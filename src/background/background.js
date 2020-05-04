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

var openURL = function (url, refresh) {
    var urlObj = new URL(url);
    var queryURL = urlObj.href.replace(urlObj.protocol, "*:");
    chrome.tabs.query({url: queryURL}, function (tabs) {
        var matchedTab = tabs[0];

        chrome.tabs.query({"status": "loading", "windowId": chrome.windows.WINDOW_ID_CURRENT}, function (tabs) {
            var loadingTab = tabs[0];
            if (matchedTab) {
                chrome.windows.update(matchedTab.windowId, {focused: true});
                chrome.tabs.highlight({windowId: matchedTab.windowId, tabs: matchedTab.index});
                chrome.tabs.remove(loadingTab.id);
                if (refresh) {
                    chrome.tabs.reload(matchedTab.id);
                }
            } else {
                chrome.tabs.update(loadingTab.id, {url: url});
            }
        });
    });
};

var identifiers = {
    openTab: "opensametab.morphic.org",
    refreshTab: "refreshsametab.morphic.org"
};

var getFilter = function (identifiers) {
    var urls = Object.keys(identifiers).map(function (key) {
        return "*://" + identifiers[key] + "/*";
    });

    return {urls: urls};
};

var handleRequest = function (details) {
    var refresh = details.url.indexOf(identifiers.refreshTab) >= 0;
    var url = details.url.replace(identifiers[refresh ? "refreshTab" : "openTab"] + "/", "");
    var response;

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
