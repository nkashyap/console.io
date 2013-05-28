# Console.IO

Console.IO is a Node.JS project. Its provide Remote Web Console for websites, Javascript, Smart Tv, mobile phones apps.
It uses rxpress.io & socket.io to provide real time response from the browsers.

Its works pretty much on all modern browsers, mobile devices, Smart TVs, etc

## Install express.io

```bash
npm install express.io
```

## Start server

```bash
node ./server/main.js
```

## Include following scripts in your website or javascript application

Include following file 

```html
<script type="text/javascript" src="inject.js?url=http://NodeServerURL:Port&secure=false"></script>
```

Then goto following url to access web console http://NodeServerURL:Port/

#Console.IO Editor

You can execute commands on remote client from Console.IO. You can execute single & multilines javascript code.

Shortcuts: 
Ctrl+Enter: execute command
Ctrl+Space: autocomplate
Ctrl-Q: toggle comments

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
 * Load addons dynamically (e.g web, socket, etc)
 * Update Readme with full feature list

#Copyright and license
 MIT-LICENSE

#Reference
 [Javascript Stacktrace] (https://github.com/eriwen/javascript-stacktrace)
 [codemirror] (http://codemirror.net/)
 [express.io] (https://github.com/techpines/express.io)
 [Socket.io] (http://socket.io/#how-to-use)
