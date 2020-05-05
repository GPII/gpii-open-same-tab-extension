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

/* global fluid, jqUnit, openURLs, chrome, sinon */
"use strict";

(function () {

    /************************************************************************************************************
     * openURLS.getFilter tests
     ************************************************************************************************************/

    const getFilterTestCases = [{
        name: "Simple identifier",
        identifiers: {
            foo: "bar",
            abc: "123"
        },
        filter: {
            urls: [
                "*://bar/*",
                "*://123/*"
            ]
        }
    }, {
        name: "Subdomain identifier",
        identifiers: {
            domain: "sub.domain.com"
        },
        filter: {
            urls: ["*://sub.domain.com/*"]
        }
    }, {
        name: "No identifier",
        identifiers: {},
        filter: {
            urls: []
        }
    }];

    jqUnit.test("test openURLs.getFilter()", () => {
        jqUnit.expect(getFilterTestCases.length);
        getFilterTestCases.forEach(testCase => {
            var actualFilter = openURLs.getFilter(testCase.identifiers);
            jqUnit.assertDeepEq(`${testCase.name}: the filter is generated correctly`, testCase.filter, actualFilter);
        });
    });

    /************************************************************************************************************
     * openURLs.openURL tests
     ************************************************************************************************************/

    const openTabTestCases = [{
        name: "Open Existing",
        existing: true
    }, {
        name: "Refresh Existing",
        existing: true,
        refresh: true
    }, {
        name: "Open New"
    }, {
        name: "Open New (with refresh arg)",
        refresh: true
    }];

    jqUnit.test("test openURLs.openTab", () => {
        const matchingTab = {
            windowId: 88,
            index: 2,
            id: 23
        };

        const loadingTab = {
            id: 24
        };

        openTabTestCases.forEach(testCase => {
            chrome.tabs.query.onFirstCall().yields(testCase.existing ? [matchingTab] : []);
            chrome.tabs.query.onSecondCall().yields([loadingTab]);

            const url = "https://actual.org/url";
            const queryURL = "*://actual.org/url";

            openURLs.openTab(url, testCase.refresh);

            jqUnit.assertTrue(`${testCase.name}: Tabs queried for matching URLs`, chrome.tabs.query.calledWith({url: queryURL}));
            jqUnit.assertTrue(`${testCase.name}: Tabs queried for loading URLs`, chrome.tabs.query.calledWith({"status": "loading", "windowId": chrome.windows.WINDOW_ID_CURRENT}));

            if (testCase.existing) {
                jqUnit.assertTrue(`${testCase.name}: Window for matching tab focused`, chrome.windows.update.calledOnceWithExactly(matchingTab.windowId, {focused: true}));
                jqUnit.assertTrue(`${testCase.name}: Matching tab highlighted`, chrome.tabs.highlight.calledOnceWithExactly({windowId: matchingTab.windowId, tabs: matchingTab.index}));
                jqUnit.assertTrue(`${testCase.name}: Removed loading tab`, chrome.tabs.remove.calledOnceWithExactly(loadingTab.id));
                jqUnit.assertTrue(`${testCase.name}: Tab isn't updated`, chrome.tabs.update.notCalled);

                if (testCase.refresh) {
                    jqUnit.assertTrue(`${testCase.name}: Matching tab is refreshed`, chrome.tabs.reload.calledOnceWithExactly(matchingTab.id));
                } else {
                    jqUnit.assertTrue(`${testCase.name}: Tab isn't reloaded`, chrome.tabs.reload.notCalled);
                }

            } else {
                jqUnit.assertTrue(`${testCase.name}: Window isn't explicitly focused`, chrome.windows.update.notCalled);
                jqUnit.assertTrue(`${testCase.name}: Tab isn't highlighted`, chrome.tabs.highlight.notCalled);
                jqUnit.assertTrue(`${testCase.name}: Loading tab isnt' removed`, chrome.tabs.remove.notCalled);
                jqUnit.assertTrue(`${testCase.name}: Tab isn't reloaded`, chrome.tabs.reload.notCalled);
                jqUnit.assertTrue(`${testCase.name}: Loading tab is updated with correct URL`, chrome.tabs.update.calledOnceWithExactly(loadingTab.id, {url}));
            }

            // clean up
            chrome.flush();
        });
    });

    /************************************************************************************************************
     * openURLs.handleRequest tests
     ************************************************************************************************************/

    const handlestRequestTestCases = [{
        name: "Open same tab",
        details: {
            url: "https://opensametab.morphic.org/actual.org/url"
        },
        expected: {
            response: {cancel: true},
            args: ["https://actual.org/url", false]
        }
    }, {
        name: "Refresh tab",
        details: {
            url: "http://refreshsametab.morphic.org/actual.org/url"
        },
        expected: {
            response: {cancel: true},
            args: ["http://actual.org/url", true]
        }
    }, {
        name: "Unfiltered URL",
        details: {
            url: "http://morphic.org/actual.org/url"
        },
        expected: {
            response: {cancel: true},
            args: ["http://morphic.org/actual.org/url", false]
        }
    }];

    jqUnit.test("test openURLs.handleRequest", () => {
        let openTabStub = sinon.stub(openURLs, "openTab");

        handlestRequestTestCases.forEach(testCase => {
            let response = openURLs.handleRequest(testCase.details);
            jqUnit.assertDeepEq(`${testCase.name}: the response is returned correctly`, testCase.expected.response, response);

            let isOpenTabCalledProperly = openTabStub.calledOnceWithExactly.apply(openTabStub, testCase.expected.args);
            jqUnit.assertTrue(`${testCase.name}: the openURLs.openTab method was called with the correct args`, isOpenTabCalledProperly);

            // clean up
            openTabStub.reset();
        });

        // clean up
        openTabStub.restore();
    });

    /************************************************************************************************************
     * openURLs.bindListener tests
     ************************************************************************************************************/

    jqUnit.test("test openURLs.bindListener", () => {
        const filter = {
            urls: [
                "*://opensametab.morphic.org/*",
                "*://refreshsametab.morphic.org/*"
            ]
        };

        const opts = ["blocking"];

        openURLs.bindListener();

        let isCalledProperly = chrome.webRequest.onBeforeRequest.addListener.calledOnceWithExactly(openURLs.handleRequest, filter, opts);
        jqUnit.assertTrue("The chrome.webRequest.onBeforeRequest.addListener method was called with the correct args", isCalledProperly);

        // cleanup
        chrome.flush();
    });

    jqUnit.test("trigger onBeforeRequest event", () => {
        let handelRequestStub = sinon.stub(openURLs, "handleRequest");
        const details = {test: "test"};


        chrome.webRequest.onBeforeRequest.dispatch(details);
        jqUnit.assertFalse("The handleRequest method should not have been triggered before the onBeforeRequest listener is bound", handelRequestStub.called);

        openURLs.bindListener();
        chrome.webRequest.onBeforeRequest.dispatch(details);
        jqUnit.assertTrue("The onBeforeRequest handler should be called once, after triggering the onBeforeRequest event", handelRequestStub.calledOnceWithExactly(details));

        // cleanup
        chrome.flush();
        handelRequestStub.restore();
    });


})();
