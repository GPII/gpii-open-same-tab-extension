# Contributing

## Process/Workflow

### Issue Tracker

Issues are tracked using using the [GPII JIRA](
    https://issues.gpii.net/issues/?jql=project%20%3D%20GPII%20AND%20component%20%3D%20%22Open%20in%20Same%20Tab%20Browser%20Extension%22)
    instance.

### Commit Logs

All commits logs should include, at minimum, the following information:

1. A reference to the JIRA issue this commit applies to (at the beginning of the first line)
2. A short and meaningful summary of the commit, on the first line
3. A meaningful commit log describing the contents of the change

In rare cases, a commit may be trivial or entirely cosmetic (code reformatting, fixing typos in comments, etc). In those
cases, it is acceptable to use the "NOJIRA:" prefix for your log. However, it is still required to provide a meaningful
summary and descriptive commit message.

```text
GPII-99999: Add foo function to whirlygig

Refactored the whirlygig to include a new foo algorithm based on the wireframes provided by the designers.
(http://linkToWireFrames)
```

### Unit Tests

Production-level code needs to be accompanied by a reasonable suite of unit tests. This helps others confirm that the
code is working as intended, and allows the community to adopt more agile refactoring techniques while being more
confident in our ability to avoid regressions. Please view the Documentation for using
[jqUnit](https://docs.fluidproject.org/infusion/development/jqUnit.html) for writing tests.

### Linting

JavaScript is a highly dynamic and loose language, and many common errors are not picked up until run time. In order to
avoid errors and common pitfalls in the language, all code should be regularly checked using the provided lint task.
You may also wish to setup linting in your IDE.

```bash
# Runs JavaScript linting only
grunt lint

# Runs web-ext linting of extension
npx web-ext lint

# Runs all linting tasks
npm run lint
```

### Pull Requests and Merging

After a Pull Request (PR) has been submitted, one or more members of the community will review the contribution. This
typically results in a back and forth conversation and modifications to the PR. Merging into the project repo is a
manual process and requires at least one Maintainer to sign off on the PR and merge it into the project repo.

## Publishing

1. Prepare Code.
    1. Ensure that all of the code, that should be published, has been merged into the master branch.
    2. Ensure that the code in master is working as expected.
        1. Run tests: `npm test`
        2. Lint: `npm lint`
        3. Manually test build.
    3. Increase the "version" number in the [manifest](
        https://github.com/GPII/gpii-open-same-tab-extension/blob/master/src/manifest.json#L5) file, and push changes to
        master.
        1. If making a beta, open the manifest file, located in the newly created build directory, and add a
            [version name](https://developer.chrome.com/apps/manifest/version#version_name) with the beta release number
            (e.g. “version_name”:  “0.1.0 beta 10” ). The version name may be displayed instead of the version number
            in the store.
2. Create the release package.
    1. Create a release build: `npm run build`
3. Publish to the extension store(s)
    1. Upload the zip package from the `build` directory to the extension store(s).
    2. Update the “Detailed description” field as necessary. Similar information is contained in this README.
4. Verify Published extension
    1. Ensure that the contents of the extension page on the store appear correct. Double check things like version
        number/name, descriptions, etc.
    2. Install the version from the store, and run through the manual testing again.
    3. If everything is working, announce release where required (e.g., fluid-work list, GPII list, project teams, etc.
        ). If there are any issues, fix them and repeat the process.
5. Release on GitHub
    1. Tag the master branch with the release (e.g., v0.1.0, v0.1.0-beta.10).
    2. Create a GitHub release for the tag.
