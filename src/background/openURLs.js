/*
 * Copyright The Morphic: Open in Same Tab copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/GPII/gpii-open-same-tab-extension/blob/master/AUTHORS.md
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-open-same-tab-extension/blob/master/LICENSE.txt
 */

/* global browser */

"use strict";

const openURLs = {};

openURLs.openTab = async (url, refresh) => {
    const queryURL = url.href.replace(url.protocol, "*:");

    let [matchedTab] = await browser.tabs.query({url: queryURL});
    let [loadingTab] = await browser.tabs.query({"status": "loading", "windowId": browser.windows.WINDOW_ID_CURRENT});

    // In Firefox onload if we try to enter in the URL in the only tab it may not indicate it is `loading`
    // This appears to only happen if only a single default tab is open, so we just use that one as the loading tab.
    if (!loadingTab) {
        [loadingTab] = await browser.tabs.query({});
    }

    if (matchedTab) {
        browser.windows.update(matchedTab.windowId, {focused: true});
        browser.tabs.highlight({windowId: matchedTab.windowId, tabs: matchedTab.index});
        browser.tabs.remove(loadingTab.id);
        if (refresh) {
            browser.tabs.reload(matchedTab.id);
        }
    } else {
        browser.tabs.update(loadingTab.id, {url: url.href});
    }
};

openURLs.identifiers = {
    openTab: "opensametab.morphic.org",
    refreshTab: "refreshsametab.morphic.org"
};

openURLs.getFilter = identifiers => {
    const urls = Object.keys(identifiers).map(key => `*://${identifiers[key]}/*`);

    return {urls};
};

openURLs.handleRequest = details => {
    const url = new URL(details.url);
    const refresh = url.hostname.indexOf(openURLs.identifiers.refreshTab) >= 0;
    // URL will look like: "http://opensametab.morphic.org/redirect/https%3A%2F%2Fexample.com%2F"
    const destination = url.pathname.replace(/^\/(redirect\/)?(.*)/, (match, c1, c2) => decodeURIComponent(c2));

    let success;
    // Validate the URL.
    try {
        const destinationUrl = new URL(destination);
        success = true;
    } catch (e) {
        success = false;
    }

    if (success) {
        openURLs.openTab(destinationUrl, refresh);
    }

    return {cancel: success};
};

openURLs.bindListener = () => {
    browser.webRequest.onBeforeRequest.addListener(openURLs.handleRequest, openURLs.getFilter(openURLs.identifiers), ["blocking"]);
};
