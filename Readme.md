# Console.IO

[![Build Status](https://travis-ci.org/nkashyap/console.io.png?branch=master)](https://travis-ci.org/nkashyap/console.io)
[![Nodejitsu Deploy Status](https://webhooks.nodejitsu.com/nkashyap/console.io.png)](https://webops.nodejitsu.com#nodejitsu/webhooks)

Console.IO is a NodeJS project. It provides Remote Web Console for websites and web applications.
It uses express.io (express & socket.io) to provide user real time experience.

* [Demo] (http://console.io.jit.su/)
* [Console.IO] (http://nkashyap.github.io/console.io)

It works pretty much on all modern browsers, mobile devices, Smart TVs, etc

Tested on: 
* Toshiba TV (2011, 2012, 2013)
* LG NetCast TV (2011, 2012, 2013)
* Philips NetTV (2011, 2012, 2013)
* Samsung TV (2010, 2011, 2012, 2013)
* Panasonic TV (2012, 2013)
* Technika Avtrex STB
* Sony (BDP-S4100)
* Hopper Dish (Hopper)
* Firefox, Safari, Opera, Chrome, Maple, PhantomJS and IE
* iPhone, iPod, iPad, Android browser, windows 8 phone etc


### INSTALLATION
#### NPM

```bash
npm install -g xconsole.io
```

#### Source (install.bat for windows users)

```bash
npm install
```

### START SERVER
#### NPM

```bash
consoleio
```

#### Source (start.bat for window users)

```bash
node ./server/main.js
```

### USAGE
#### Include Script directly

```html
<script type="text/javascript" src="http://<console.io server>/console.io.js"></script>
```

#### Via RequireJS

```html
    //requirejs bootstrap file

    requirejs.config({
        baseUrl: './',
        paths: {
            "socket.io": "<console.io server>/socket.io/socket.io",
            "console.io": "<console.io server>/console.io"
        }
    });

    // usage
    define(['console.io'], function (consoleio) {
        consoleio.configure({});
    });
```

### CONFIGURATION
#### Config Object (Works only when script is included directly)

Create a config object on ConsoleIO but note that it only works when script is included directly not via RequireJS.

```html
window.ConsoleIO = window.ConsoleIO || {};

window.ConsoleIO.config = {
    url: "<console.io server>",
    base: "",

    // optionals
    secure: false,

    nativeConsole: true,
    web: false,  // true to display web console
    webOnly: false, // true for web console mode only

    // Web console config
	filters: ['log','error'],
	search: 'test',
	pageSize: 100,

    // Web UI config
    docked: false,
    position: 'bottom',
    height: '300px',
    width: '99%'
};
```

#### QueryString Parameters (Works only when script is included directly)

Pass list of configurations options in the query strings parameters like given below.
Any query string parameters in the location bar will overwrite file query strings parameters.
Note that it only works when script is included directly not via RequireJS.

```html
<script type="text/javascript" src="http://<console.io server>/console.io.js?url=<console.io server>"></script>
```

#### Configurations when loaded via RequireJS
```html
define(['console.io'], function (consoleio) {
    consoleio.configure({
        url: "<console.io server>",
        base: "",

        // optionals
        secure: false,

        nativeConsole: true,
        web: false,
        webOnly: false,

        // Web console config
        filters: ['log','error'],
        search: 'test',
        pageSize: 100,

        // Web UI config
        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    });
});
```

NOTE: It can also capture iframe logs. To do that just include console.io.js script file in the child document.

Visit http://<console.io server>/ for ConsoleIO interface (Tested on Chrome Browsers)

![Console.IO](https://raw.github.com/nkashyap/console.io/master/resources/images/console.io.png)

![Status tab](https://raw.github.com/nkashyap/console.io/master/resources/images/status-tab.png)

![Source tab](https://raw.github.com/nkashyap/console.io/master/resources/images/source-tab.png)

![Preview tab](https://raw.github.com/nkashyap/console.io/master/resources/images/preview-tab.png)

![Console tab](https://raw.github.com/nkashyap/console.io/master/resources/images/console-tab.png)


NOTE:
* ![Online icons](https://raw.github.com/nkashyap/console.io/master/resources/icons/online.png) Device is registered and connected.
* ![Offline icons](https://raw.github.com/nkashyap/console.io/master/resources/icons/offline.png) Device is registered but offline.
* ![Subscribe icons](https://raw.github.com/nkashyap/console.io/master/resources/icons/subscribe.gif) Device is subscribed (double click on Online icon to subscribe).
* ![Web icons](https://raw.github.com/nkashyap/console.io/master/resources/icons/console.gif) web console icon to enable/disable web remotely.


### APPLICATION
#### Editor

Commands/Scripts can be execute on connected client from application.

Shortcuts: 
* Ctrl+Enter: execute command
* Ctrl+Space: autocomplate
* Ctrl-Q: toggle comments
* Shift-Ctrl-Q: fold/unfold code
* Ctrl-F / Cmd-F: Start searching
* Ctrl-G / Cmd-G: Find next
* Shift-Ctrl-G / Shift-Cmd-G: Find previous
* Shift-Ctrl-F / Cmd-Option-F: Replace
* Shift-Ctrl-R / Shift-Cmd-Option-F: Replace all

NOTE: All multilines code should be wrapped within self executable function. E.G
```html
(function doSomeThing(){
 .......
}())
```

#### Device and Tabs
* Files: Show all attached javascript and css files in the web page
* Status: Device Status and some basic information
* Source: Double click on a file in file explorer to view file content
* Preview: HTML dom structure
* Console: Remote console 
	* Pause incoming logs
	* Clear logs
	* Export logs
	* Change page size
	* Search word or use regex to filter logs
	* Filter logs by type

#### Web console
* Control it remotely
	* Pause incoming logs
	* Clear logs
	* Change page size
	* Search word or use regex to filter logs
	* Filter logs by type
* TODO
    * Ability to configure height, width, position & remote control.
    * Control logging speed
    * Scroll through logs (Smart Tv/mobile/tablets)

### CONSOLE API
 * console.assert(x)
 * console.count(key)
 * console.time(name, reset)
 * console.timeEnd(name)
 * console.debug(arguments...)
 * console.warn(arguments...)
 * console.info(arguments...)
 * console.log(arguments...)
 * console.dir(object)
 * console.dirxml(HTML Element)
 * console.error(error)
 * console.exception(error)
 * console.trace()

#### TODO
* console.group()
* console.groupCollapsed()
* console.groupEnd()
* console.markTimeline()
* console.timestamp()
* console.profiles
* console.profile()
* console.profileEnd()


### SERVER CONFIGURATION

All server side configurations are defined in server/config.js file.
If you have install using npm -g then you will find it in C:\Users\[USERNAME]\AppData\Roaming\npm\node_modules\xconsole.io\server folder

#### Server Port
You can change default (8082) port number

```html
express: {
    production: {
        ...
        { 'port-number': 8082 },
        { 'session-key': 'console.io' },
        ...
    }
}
```

#### SSL Support

Change following in server side config file to enable server to run over SSL and use "https" instead of "http" to inject files on client.
To generate your own SSL Certificate please check this [How to generate custom SSL certificates](http://forum.synology.com/wiki/index.php/How_to_generate_custom_SSL_certificates).

```html
var config = {
    .....
    https: {
        enable: true, // change true/false to enable and disable SSL
        key: './server/certificates/server.key',
        certificate: './server/certificates/server.crt',
        ca: './server/certificates/ca.crt'
    },
    .....
}
```

And change console.io config as follows

```html
{
    ....
    secure: true,
    .....
}
```

### IISNODE

Console.IO can be hosted inside IIS. It allows to bypass SSL self-signed certificate issue.

#### INSTALL
 * Install x64 node from http://nodejs.org/download/
 * Install x64 iisnode from https://github.com/tjanczuk/iisnode
 * IIS URL Rewrite module
 * Add Web Application inside a website and set it to console.io source directory
 * Navigate to https://[your machine name]/console.io/ to access console.io application.

NOTE: Only IIS8 supports websockets therefore Console.IO is configured to used xhr-polling by default

![IIS NODE](https://raw.github.com/nkashyap/console.io/master/resources/images/iis.png).

#### USAGE
##### Include Script directly

```html
<script type="text/javascript" src="/console.io/console.io.js"></script>
```

##### Via RequireJS

```html
    //requirejs bootstrap file

    requirejs.config({
        baseUrl: './',
        paths: {
            "socket.io": "/console.io/socket.io/socket.io",
            "console.io": "/console.io/console.io"
        }
    });

    // usage
    define(['console.io'], function (consoleio) {
        consoleio.configure({});
    });
```


### ANGULARJS

Example to setup AngularJS global $http error handler

```html
angular.module('app', ['ngResource',])
	.config(function ($httpProvider)
	{
		$httpProvider.responseInterceptors.push(function globalErrorHandling($q) {
			return function(promise) {
				return promise.then(function(successResponse) {
					console.info(successResponse);
					return successResponse;

				}, function(errorResponse) {
					console.exception(errorResponse);
					return $q.reject(errorResponse);
				});
			};
		});
	});
});
```

### TODO
 * Add JSDoc & Unit Tests
 * Support scaling

### COPYRIGHT AND LICENSE
 MIT LICENSE 

### REFERENCE
 * [Javascript Stacktrace] (https://github.com/eriwen/javascript-stacktrace)
 * [codemirror] (http://codemirror.net/)
 * [express.io] (https://github.com/techpines/express.io)
 * [Socket.io] (http://socket.io/#how-to-use)
 * [prettify] (https://code.google.com/p/google-code-prettify/)
 * [dhtmlx] (http://dhtmlx.com/) [GPL LICENSE]
 * [OpenSSL] (http://www.openssl.org/)
 * [Html2Canvas] (http://html2canvas.hertzen.com/)
 * [Grunt] (http://gruntjs.com/)
 * [uglify-js] (https://github.com/mishoo/UglifyJS/)
 * [js-beautify] (https://github.com/einars/js-beautify/)
