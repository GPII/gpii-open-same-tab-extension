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

"use strict";

module.exports = {
    sourceDir: "./src",
    run: {
        // Due to https://github.com/mozilla/web-ext/issues/1862
        // the following configuration is specified in the npm script instead. Once that
        // issue has been addressed, the targets can be removed from the script and just
        // use the configuration here instead.
        // target: ["firefox-desktop", "chromium"]
    }
};
