#!/usr/bin/env node 
// Shebang (#!) above allows for invoking this file directly on Unix-like platforms.
/**
 * This is a CLI entrypoint, where commands could be called to run necessary development environment on host machine.
 */
const path = require('path')
const applicationRootPath = path.join(process.env.PWD, '../'),
      ownModulePath = `${__dirname}/../../../`;
const configuration = require(path.join(applicationRootPath, `./setup/configuration/configuration.js`))

require(ownModulePath).hostCLIAdapter({
    hostScriptPath: configuration.script.hostMachine,
    applicationRoot: configuration.directory.application.hostAbsolutePath
})