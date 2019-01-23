#!/usr/bin/env node
// Shebang (#!) above allows for invoking this file directly on Unix-like platforms.

/**
 * This is a CLI entrypoint, where commands could be called to run necessary development environment on host machine.
 */
const path = require('path')
const scriptExecution = require('../').scriptExecution
const configuration = require('../configuration')
const   projectRootPath = path.normalize(`${__dirname}/..`) 
                          || configuration.directory.application.rootPath, // example of configuration file usage
        scriptConfigArray = [
            {
                type: 'script',
                key: 'scriptExample',
                path: './test/example/script.js'
            },
            {
                type: 'module',
                key: 'moduleExample',
                path: './test/example/module.js',
                methodName: 'someFunction'
            },    
        ] || configuration.script, // example of configuration file usage
        scriptKeyArray = ['scriptExample', 'moduleExample']

;(async () => {
    try {
        
        for (let scriptKey of  scriptKeyArray) {
            await scriptExecution({
                script: scriptConfigArray,
                appRootPath: projectRootPath,
                scriptKeyToInvoke: scriptKey
            }).then(result => {
                if(result) console.log(result)
            })
        }    

    } catch (error) {
        console.log(`❌ Test Failed.`)
        throw error
    }
    console.log(`✔ Test Succeeded.`)
})()
