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

/* global chrome */

"use strict";

const openURL = (url, refresh) => {
    const urlObj = new URL(url);
    const queryURL = urlObj.href.replace(urlObj.protocol, "*:");
    chrome.tabs.query({url: queryURL}, tabs => {
        const matchedTab = tabs[0];

        chrome.tabs.query({"status": "loading", "windowId": chrome.windows.WINDOW_ID_CURRENT}, tabs => {
            const loadingTab = tabs[0];
            if (matchedTab) {
                chrome.windows.update(matchedTab.windowId, {focused: true});
                chrome.tabs.highlight({windowId: matchedTab.windowId, tabs: matchedTab.index});
                chrome.tabs.remove(loadingTab.id);
                if (refresh) {
                    chrome.tabs.reload(matchedTab.id);
                }
            } else {
                chrome.tabs.update(loadingTab.id, {url});
            }
        });
    });
};

const identifiers = {
    openTab: "opensametab.morphic.org",
    refreshTab: "refreshsametab.morphic.org"
};

const getFilter = identifiers => {
    const urls = Object.keys(identifiers).map(key => `*://${identifiers[key]}/*`);

    return {urls};
};

const handleRequest = details => {
    const refresh = details.url.indexOf(identifiers.refreshTab) >= 0;
    const url = details.url.replace(`${identifiers[refresh ? "refreshTab" : "openTab"]}/`, "");
    let response;

    // if clicking on a filtered link, in the browser, should just redirect to the correct link
    if (details.initiator) {
        response = {redirectUrl: url};
    } else {
        openURL(url, refresh);
        response = {cancel: true};
    }

    return response;
};

chrome.webRequest.onBeforeRequest.addListener(handleRequest, getFilter(identifiers), ["blocking"]);
