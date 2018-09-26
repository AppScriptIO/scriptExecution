#!/usr/bin/env node 
// Shebang (#!) above allows for invoking this file directly on Unix-like platforms.

/**
 * This is a CLI entrypoint, where commands could be called to run necessary development environment on host machine.
 */
const path = require('path'),
      ownModulePath = `${__dirname}/../../../`;

function invoke({
    configurationPath,
    filename
}) {
    const configuration = require(configurationPath),
          applicationRootPath = configuration.directory.application.hostAbsolutePath
    
    require(ownModulePath).hostCLIAdapter({
        hostScriptPath: configuration.script.hostMachine,
        applicationRoot: configuration.directory.application.hostAbsolutePath,
        filename
    })
}

/**
 * USAGE: 
 *  script invokation from shell using: npx || yarn run || <pathToScript>
 *  Shell: npx cliAdapter configuration=<relativePathToConfigurationFromPWD> <filename>
 */
function cliInterface() {
    var { parseKeyValuePairSeparatedBySymbolFromArray, combineKeyValueObjectIntoString } = require('@dependency/parseKeyValuePairSeparatedBySymbol')
    const   namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }) // ['x=y'] --> { x: y }
    const configurationPath = (namedArgs.configuration) ? 
        path.join(process.env.PWD, namedArgs.configuration) : 
        path.join(process.env.PWD, 'configuration') // default seach in prim house
    process.argv = process.argv.filter(value => value !== `configuration=${namedArgs.configuration}`) // remove configuration paramter
    const nodeCommandArgument = process.argv.slice(2) // remove node bin path and executed js entrypoint path. Keeping only the command arguments.
    const filename = nodeCommandArgument[0]

    console.log(configurationPath)
    invoke({ configurationPath, filename })
}

cliInterface()