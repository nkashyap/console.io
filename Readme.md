# ConsoleJS

ConsoleJS is a Node.JS project. Its provide Remote Web Console for websites, Javascript, Smart Tv, mobile phones apps.
It uses socket.io to provide real time response from the browsers.

Its works pretty much on all modern browsers, mobile devices, Smart TVs, etc

## Install Socket.io

```bash
npm install socket.io
```

## Start server

```bash
node Server\Start.js
```

## Include following scripts in your website or javascript application

Basic ConsoleJS support for cross-browsers

```html
<script type="text/javascript" src="http://NodeServerURL:Port/Client/ConsoleJS.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Browser.js"></script>
```

ConsoleJS with sockets for remote logging

```html
<script type="text/javascript" src="http://NodeServerURL:Port/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Socket.js"></script>
```

ConsoleJS with web logging

```html
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Web.js"></script>
...
<link rel="stylesheet" href="http://NodeServerURL:Port/Client/Web.css" type="text/css">
<link rel="stylesheet" href="http://NodeServerURL:Port/Shared/console.css" type="text/css">
```

Include files in following order 

```html
<script type="text/javascript" src="http://NodeServerURL:Port/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/ConsoleJS.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Browser.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Socket.js"></script>
<script type="text/javascript" src="http://NodeServerURL:Port/Client/Web.js"></script>
...
<link rel="stylesheet" href="http://NodeServerURL:Port/Client/Web.css" type="text/css">
<link rel="stylesheet" href="http://NodeServerURL:Port/Shared/console.css" type="text/css">
```

Then goto following url to access web console http://NodeServerURL:Port/

![Screen shot](https://raw.github.com/nkashyap/ConsoleJS/master/consoleJS.PNG)

#ConsoleJS Editor

You can execute commands on remote client from ConsoleJS. You can execute single & multilines javascript code.

Shortcuts: Ctrl+Enter to execute command and Ctrl+Space for autocomplate

Note: All multilines code should be wrapped within self executable function. E.G
```html
(function doSomeThing(){
 .......
}())
```

#Console API methods supported
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

#Coming soon...
 * console.group()
 * console.groupCollapsed()
 * console.groupEnd()
 * console.markTimeline()
 * console.timestamp()
 * console.profiles
 * console.profile()
 * console.profileEnd()

#TODO
 * Change it into npm module
 * Move browser detect into server
 * refactor code to use express.io
 * Load addons dynamically (e.g web, socket, etc)
 * Update Readme with full feature list

#Copyright and license
 MIT-LICENSE

#Reference
 [Javascript Stacktrace] (https://github.com/eriwen/javascript-stacktrace)

 [Socket.io] (http://socket.io/#how-to-use)
