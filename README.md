# gpii-open-same-tab-extension

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

The src directory should contain all of the relevant code to be packaged for the extension. The only explicit build
step needed is to pull in the 3rd party dependencies. That can be done after `npm install` by running the following
grunt task:

```bash
grunt loadDependencies
```

## Testing and Debugging

### Running the extension from source

Requirements:

* [Google Chrome browser](https://www.google.com/chrome/browser/desktop/)
* [Firefox Browser](https://firefox.com)

Using [web-ext](https://github.com/mozilla/web-ext) you are able to run an instance of the extension in Chrome and
Firefox from the local source code. web-ext will even monitor changes and update the extension on the fly.

```bash
# deploy the local source code as extensions in Firefox and Chrome
npm run dev

#Press R to reload
#Press Ctrl-C to quit
```

### Debugging

### Firefox

When launching the extension in Firefow using web-ext, the browser console should open at the same time. This will
contain useful log. You can also bring up the debugger by going to "about:debugging" in the Awesomebar (Address Bar).

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

For example, `http://opensametab.morphic.org/en.wikipedia.org/wiki/URL` will open `https://en.wikipedia.org/wiki/URL`.

#### Caveats

When using web-ext for testing the extensions a new instance of the browser is created. You may not be able to launch
URLs into this particular instance from outside of the browser, even if it is the default browser. The main instance of
the browser may load instead. If this is happens, you'll need to test URLs by directly inputting them into the address
bar.

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
