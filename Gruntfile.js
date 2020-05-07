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

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        eslint: {
            options: {
                format: "tap"
            },
            sources: ["./tests", "./src", "./*.js"]
        },
        copy: {
            lib: {
                //TODO: Currently there is a bug in Chrome that prevents source maps from working for extensions.
                //      see: https://bugs.chromium.org/p/chromium/issues/detail?id=212374
                //      After the above issue is fixed, include source maps and/or additional build types to improve
                //      debugging.
                files: [{
                    expand: true,
                    flatten: true,
                    src: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
                    dest: "src/lib/"
                }]
            }
        },
        clean: {
            lib: {
                src: ["src/lib/"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-eslint");

    grunt.registerTask("loadDependencies", "Copy dependencies from node_modules to lib directory.", ["clean", "copy"]);
    grunt.registerTask("lint", "Perform all standard lint checks.", ["eslint"]);
    grunt.registerTask("default", ["lint"]);
};
