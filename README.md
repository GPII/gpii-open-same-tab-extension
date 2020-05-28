# gpii-open-same-tab-extension

![CI build status badge](https://github.com/GPII/gpii-open-same-tab-extension/workflows/CI/badge.svg)

A browser extension for opening a Morphic MYOB link in an existing tab.

## Building the extension

### Dependencies

Install *grunt-cli* globally:

```bash
npm install -g grunt-cli
```

Install required dependencies:

```bash
npm install
```

### Build

#### Including dependencies

For testing the extension in the browser, you'll need to ensure that the 3rd party dependencies have been copied to the
source directory. This is performed by the following grunt task:

```bash
grunt loadDependencies
```

The above grunt task is included in the necessary npm scripts, but if you are not using those, you may need to call it
manually.

#### Packaging

When you are ready to release, or need to manually test in some browsers, you'll want to package the extension. This
can be done manually by zipping the contents of the `src` directory. However, you can also use the following NPM script
to generate the package and output to the `build` directory.

```
npm run build
```

## Testing and Debugging

### Running the extension from source

Requirements:

* [Google Chrome browser](https://www.google.com/chrome/browser/desktop/)
* [Firefox Browser](https://firefox.com)

#### Using web-ext
Using [web-ext](https://github.com/mozilla/web-ext) you are able to run an instance of the extension in Chrome and
Firefox from the local source code. web-ext will even monitor changes and update the extension on the fly.

```bash
# deploy the local source code as extensions in Firefox and Chrome
npm run dev

#Press R to reload
#Press Ctrl-C to quit
```

##### Manually loading extensions

See [Temporarily Install Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) and Chrome's [Gettings Started Tutorial](https://developer.chrome.com/extensions/getstarted) for information on how to manually install in development extensions into the browsers. If you require a packaged version, you can run a build first and source it from the `build` directory. Otherwise you can install the code directly from the `src` directory.

### Debugging

### Firefox

You can bring up the debugger by going to "about:debugging" in the Awesomebar (Address Bar).

See the [Debugging](https://extensionworkshop.com/documentation/develop/debugging/) documentation provided in the
[Firefox Extension Workshop](https://extensionworkshop.com/) for more details.

### Chrome

To launch the debugger and view reported errors, open the [extensions page in Chrome](chrome://extensions) and find the
listing for this extension. If any errors have occurred, an `errors` link will be present, and will open to a log of the
errors reported. To open the debugger click on the `bakground page` link (_**NOTE:** You may need to enabled `Developer
Mode` first._).

See the [Debugging Extensions](https://developer.chrome.com/extensions/tut_debugging) documentation for more information.

### Unit Tests

Run all the tests and generate reports which can be viewed in the browser from the "reports" directory:

```bash
npm test
```

### Manual Tests

The Open in Same Tab extension will allow most URLs to pass through and behave as normal. However, it will intercept
URLs that appear like following identifiers in the domain name: `opensametab.morphic.org`, `refreshsametab.morphic.org`.
In both cases the extension will intercept the URL, remove the identifier and pass along the balance. If there are no
existing tabs/windows open to the requested URL, the URL is handled as normal. If one already exists it will open to
that existing tab instead. In the case of `refreshsametab.morphic.org`, it will also trigger the page to reload.

For example, `http://opensametab.morphic.org/redirect/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FURL` will open `https://en.wikipedia.org/wiki/URL`.

#### Caveats

When using web-ext for testing the extensions, a new instance of the browser is created. You may not be able to launch
URLs into this particular instance from outside of the browser, even if it is the default browser. The main instance of
the browser may load instead. If this happens, you'll need to test URLs by directly inputting them into the address
bar. You may also wish to manually load the extensions instead.

### Linting

To ensure that syntax, code and configuration are written correctly please run the linting tasks.

```bash
# Run eslint
grunt lint

# Run eslint and web-ext linting
npm run lint
```

## 3rd Party Software

### MPL 2.0

* [webextension-polyfill v0.6.0](https://github.com/mozilla/webextension-polyfill)
