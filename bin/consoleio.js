#!/usr/bin/env node
module.exports = (function consoleio(){
    console.log("Starting Console.IO");
    return require('../server/main');
}());