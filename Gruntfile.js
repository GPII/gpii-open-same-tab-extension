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

 /* global module */

"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        lintAll: {
            sources: {
                md: [ "./*.md"],
                js: ["./tests/**/*.js", "./src/**/*.js", "./*.js"],
                json: ["./src/**/*.json", "./*.json", "./.*.json"],
                other: ["./.*"]
            }
        }
    });

    grunt.loadNpmTasks("gpii-grunt-lint-all");

    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);
    grunt.registerTask("default", ["lint"]);
};
