/**
 * CLI tool that calls other script according to passed argument commands. Acts as a switcher or adapter to receiving command-line arguments/commands.
 * For managing the the development, build, & testing of this project.
 * USAGE:
 * • ./entrypoint [build|run] entrypointConfigurationPath=./entrypoint/configuration.js entrypointConfigurationKey=[run | install | build | buildContainerManager/buildEnvironmentImage ] dockerImageTag=X dockerhubUser=x dockerhubPass=x [dockerImageName=x]
 */
import operatingSystem from 'os'
import path from 'path'
import { parseKeyValuePairSeparatedBySymbolFromArray, combineKeyValueObjectIntoString } from '@dependency/parseKeyValuePairSeparatedBySymbol' 
import { listContent } from './utility/listDirectoryContent.js'
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' },
      osUsername = operatingSystem.userInfo().username,
      namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }) // ['x=y'] --> { x: y }
let nodeCommandArgument = process.argv.slice(2) // remove node bin path and executed js entrypoint path. Keeping only the command arguments.
let nodeEnvironmentVariable = process.env

export function script({
    hostScriptPath // the path of script directory.
}) {
    
    const hostMachineScriptModulePath = path.join(hostScriptPath, `${nodeCommandArgument[0]}`); // the specific module to run.
    console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS script]`, `Running ${hostMachineScriptModulePath}`)

    if(!nodeCommandArgument[0]) { // if no arguments supplied, fallback to default command.
        console.log("No command argument passed. Please choose a script:")
        console.log(listContent({ dir: hostScriptPath, recursive: false }))
        process.exit(1)
    } 

    switch (nodeCommandArgument[0]) {
        default:
            // Load the module with the matching name (either a folder module or file with js extension)
            try {
                require( hostMachineScriptModulePath )
            } catch (error) {
                console.log(error)
                console.log(nodeCommandArgument[0] + ' command isn`t configured')
            }
        break;
    }
}

  