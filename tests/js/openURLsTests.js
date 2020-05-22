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

/* global jqUnit, openURLs, browser, sinon */
"use strict";

(function () {

    // Due to a https://github.com/acvetkov/sinon-chrome/issues/100 sinon-chrome's webextension stubs
    // are in the `chrome` namespace instead of `browser`. The following maps the `chrome` namespaced stubs
    // to `browser`
    window.browser = window.chrome;

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

    const openTabTestsProps = {
        testCases: [{
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
        }, {
            name: "Open New - no loading tab",
            noLoading: true
        }, {
            name: "Open New (with refresh arg) - no loading tab",
            refresh: true,
            noLoading: true
        }],
        matchingTab: {
            windowId: 88,
            index: 2,
            id: 23
        },
        loadingTab: {
            id: 24
        },
        blankTab: {
            id: 1
        },
        url: "https://actual.org/url",
        queryURL: "*://actual.org/url"
    };

    openTabTestsProps.testCases.forEach(testCase => {
        jqUnit.asyncTest(`test openURLs.openTab - ${testCase.name}`, async () => {

            browser.tabs.query.onFirstCall().resolves(testCase.existing ? [openTabTestsProps.matchingTab] : []);
            browser.tabs.query.onSecondCall().resolves(testCase.noLoading ? [] : [openTabTestsProps.loadingTab]);
            browser.tabs.query.onThirdCall().resolves([openTabTestsProps.blankTab]);

            let loadingTab = testCase.noLoading ? openTabTestsProps.blankTab : openTabTestsProps.loadingTab;

            await openURLs.openTab(openTabTestsProps.url, testCase.refresh);

            jqUnit.assertTrue("Tabs queried for matching URLs", browser.tabs.query.calledWith({url: openTabTestsProps.queryURL}));
            jqUnit.assertTrue("Tabs queried for loading URLs", browser.tabs.query.calledWith({"status": "loading", "windowId": browser.windows.WINDOW_ID_CURRENT}));

            if (testCase.existing) {
                jqUnit.assertTrue("Window for matching tab focused", browser.windows.update.calledOnceWithExactly(openTabTestsProps.matchingTab.windowId, {focused: true}));
                jqUnit.assertTrue("Matching tab highlighted", browser.tabs.highlight.calledOnceWithExactly({
                    windowId: openTabTestsProps.matchingTab.windowId,
                    tabs: openTabTestsProps.matchingTab.index
                }));
                jqUnit.assertTrue("Removed loading tab", browser.tabs.remove.calledOnceWithExactly(loadingTab.id));
                jqUnit.assertTrue("Tab isn't updated", browser.tabs.update.notCalled);

                if (testCase.refresh) {
                    jqUnit.assertTrue("Matching tab is refreshed", browser.tabs.reload.calledOnceWithExactly(openTabTestsProps.matchingTab.id));
                } else {
                    jqUnit.assertTrue("Tab isn't reloaded", browser.tabs.reload.notCalled);
                }

            } else {
                jqUnit.assertTrue("Window isn't explicitly focused", browser.windows.update.notCalled);
                jqUnit.assertTrue("Tab isn't highlighted", browser.tabs.highlight.notCalled);
                jqUnit.assertTrue("Loading tab isnt' removed", browser.tabs.remove.notCalled);
                jqUnit.assertTrue("Tab isn't reloaded", browser.tabs.reload.notCalled);
                let isUpdatedCalled = browser.tabs.update.calledOnceWithExactly(loadingTab.id, {url: openTabTestsProps.url});
                jqUnit.assertTrue("Loading tab is updated with correct URL", isUpdatedCalled);
            }

            // teardown
            browser.flush();
            jqUnit.start();
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

        let isCalledProperly = browser.webRequest.onBeforeRequest.addListener.calledOnceWithExactly(openURLs.handleRequest, filter, opts);
        jqUnit.assertTrue("The browser.webRequest.onBeforeRequest.addListener method was called with the correct args", isCalledProperly);

        // cleanup
        browser.flush();
    });

    jqUnit.test("trigger onBeforeRequest event", () => {
        let handelRequestStub = sinon.stub(openURLs, "handleRequest");
        const details = {test: "test"};


        browser.webRequest.onBeforeRequest.dispatch(details);
        jqUnit.assertFalse("The handleRequest method should not have been triggered before the onBeforeRequest listener is bound", handelRequestStub.called);

        openURLs.bindListener();
        browser.webRequest.onBeforeRequest.dispatch(details);
        jqUnit.assertTrue("The onBeforeRequest handler should be called once, after triggering the onBeforeRequest event", handelRequestStub.calledOnceWithExactly(details));

        // cleanup
        browser.flush();
        handelRequestStub.restore();
    });


})();
