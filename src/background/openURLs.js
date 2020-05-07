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
    const urlObj = new URL(url);
    const queryURL = urlObj.href.replace(urlObj.protocol, "*:");

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
        browser.tabs.update(loadingTab.id, {url});
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
    const refresh = details.url.indexOf(openURLs.identifiers.refreshTab) >= 0;
    const url = details.url.replace(`${openURLs.identifiers[refresh ? "refreshTab" : "openTab"]}/`, "");

    openURLs.openTab(url, refresh);

    return {cancel: true};
};

openURLs.bindListener = () => {
    browser.webRequest.onBeforeRequest.addListener(openURLs.handleRequest, openURLs.getFilter(openURLs.identifiers), ["blocking"]);
};
