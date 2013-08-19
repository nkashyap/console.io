# Console.IO

Console.IO is a NodeJS project. It provides Remote Web Console for websites and web applications.
It uses express.io (express & socket.io) to provide user real time experience.

It works pretty much on all modern browsers, mobile devices, Smart TVs, etc

Tested on: 
* Toshiba TV (2011, 2012)
* LG NetCast TV (2011, 2012, 2013)
* Philips NetTV (2011, 2012)
* Samsung TV (2010, 2011, 2012, 2013)
* Technika Avtrex STB
* Firefox, Safari, Opera, Chrome, Maple and IE
* iPhone, iPod, iPad, Android browser, windows 8 phone etc


### Node NPM package
#### Install and start Console.IO server

```bash
npm install -g xconsole.io
consoleio
```

### Install from Source
#### Install and start or execute install.bat and start.bat (window user only)

```bash
npm install express.io redis
node ./server/main.js
```

### Include scripts in your web page

include inject.js scripts with config parameters

```html
<script type="text/javascript" src="inject.js?url=http://nodeserver:port&web=true&..."></script>
```

OR create a create ConfigIO global object with config options

```html
<script type="text/javascript" src="configIO.js"></script>
<script type="text/javascript" src="inject.js"></script>
```

configIO.js
```html
window.ConfigIO = {
    //URL to connect back
	url: 'http://nodeserver:port/',

    // default is true if not defined, No connection will be made to server if set to false
    socket: true,

	// set it to true to enable WebIO (web console)  (optional)
	web: true,

    // WebIO config (optional)
	filters: ['log','error'],
	search: 'test',
	pageSize: 100,

    // WebIO UI config (optional)
	docked: false,
    position: 'bottom',
    height: '300px',
    width: '99%'
};
```

OR you can include all files individually

```html
<script type="text/javascript" src="<Local Folder OR Node Server/socket.io/socket.io.js"></script>
<script type="text/javascript" src="<Local Folder OR Node Server>/addons/console.io.js"></script>
<script type="text/javascript" src="<Local Folder OR Node Server>/addons/socket.js"></script>
<script type="text/javascript" src="<Local Folder OR Node Server>/addons/web.js"></script>
<script type="text/javascript" src="<Local Folder OR Node Server>/addons/inject.js?url=http://nodeserver:port"></script>
<link type="text/css" media="all" href="<Local Folder OR Node Server>/resources/console.css" />
```

You can also capture iframe console logs. To do that just include inject.js script file in child document.

Visit http://nodeserver:port/ for ConsoleIO interface (Tested on Chrome Browsers)

![Screen shot](https://raw.github.com/nkashyap/console.io/master/console.io.png)

Note:
* ![Online icons](https://raw.github.com/nkashyap/console.io/master/app/resources/icons/online.png) Device is registered and connected.
* ![Offline icons](https://raw.github.com/nkashyap/console.io/master/app/resources/icons/offline.png) Device is registered but offline.
* ![Subscribe icons](https://raw.github.com/nkashyap/console.io/master/app/resources/icons/subscribe.gif) Device is subscribed (double click on Online icon to subscribe).
* ![WebIO icons](https://raw.github.com/nkashyap/console.io/master/app/resources/icons/console.gif) WebIO (web console) icon to enable/disable WebIO remotely.

### Console.IO Web only

Console.IO now also support web only mode. It allow user to access console logs on the device without any need of node server.

Include following script in the web page to auto inject files

```html
    <script type="text/javascript" src="inject.js?web=true&socket=false"></script>
```

Files can be included manually in the web page as well, steps are given below.

define ConfigIO object to set web only mode

```html
window.ConfigIO = {
    socket: false,
	web: true,
	....
};
```

and include following scripts in the web page

```html
    <script type="text/javascript" src="inject.js"></script>
    <script type="text/javascript" src="console.js"></script>
    <script type="text/javascript" src="web.js"></script>
    <link type="text/css" media="all" href="app/resources/console.css" />
```

### Console.IO Editor

You can execute commands on remote client from Console.IO. You can execute single & multilines javascript code.

Shortcuts: 
* Ctrl+Enter: execute command
* Ctrl+Space: autocomplate
* Ctrl-Q: toggle comments
* Shift-Ctrl-Q: fold/unfold code

Note: All multilines code should be wrapped within self executable function. E.G
```html
(function doSomeThing(){
 .......
}())
```

### Console.IO Device and Tabs
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

### Console.IO WebIO (web console)
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

### Console API methods supported
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
 * TODO
    * console.group()
    * console.groupCollapsed()
    * console.groupEnd()
    * console.markTimeline()
    * console.timestamp()
    * console.profiles
    * console.profile()
    * console.profileEnd()

## Configure Console.IO Server
All server side configurations are defined in server/config.js file.
If you have install using npm -g then you will find it in C:\Users\[USERNAME]\AppData\Roaming\npm\node_modules\xconsole.io\server folder

### Server Port
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

### SSL Support

Change following in server side config file to enable server to run over SSL and use "https" instead of "http" to inject files on client.
To generate your own SSL Certificate please check this [How to generate custom SSL certificates](http://forum.synology.com/wiki/index.php/How_to_generate_custom_SSL_certificates).

```html
var config = {
    .....
    https: {
        enable: true, // change true/false to enable and disable SSL
        key: './certificates/server.key',
        certificate: './certificates/server.crt',
        ca: './certificates/ca.crt'
    },
    .....
}
```

```html
<script type="text/javascript" src="inject.js?url=https://nodeserver:port&web=true&..."></script>
```


### Scaling server
Console.IO use socket.io and in order to scale socket.io you need to run redis server.
Change following value in config file before starting the Console.IO server and
on window platform (/redis/redis-server.exe) is started by server itself but on other platforms you have to start redis server manually.

```html
redis: {
        enable: true, // <- true to enable socket.io scaling
        process: 6 // number of process to run
    }
```

### Example to setup AngularJS global $http error handler
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
 * Update Readme with full feature list
 * Add JSDoc & Unit Tests
 * Add IISNode configuration steps

### Copyright and license
 MIT LICENSE 

### Reference
 * [Javascript Stacktrace] (https://github.com/eriwen/javascript-stacktrace)
 * [codemirror] (http://codemirror.net/)
 * [express.io] (https://github.com/techpines/express.io)
 * [Socket.io] (http://socket.io/#how-to-use)
 * [prettify] (https://code.google.com/p/google-code-prettify/)
 * [dhtmlx] (http://dhtmlx.com/) [GPL LICENSE]
 * [OpenSSL] (http://www.openssl.org/)
 * [Html2Canvas] (http://html2canvas.hertzen.com/)
