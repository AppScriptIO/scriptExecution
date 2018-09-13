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
import { runInDebugContext } from 'vm';
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' },
      osUsername = operatingSystem.userInfo().username,
      namedArgs = parseKeyValuePairSeparatedBySymbolFromArray({ array: process.argv }) // ['x=y'] --> { x: y }
let nodeCommandArgument = process.argv.slice(2) // remove node bin path and executed js entrypoint path. Keeping only the command arguments.
let nodeEnvironmentVariable = process.env

export function script({
    hostScriptPath, // the path of script directory or array of paths.
    applicationRoot,
    filename = nodeCommandArgument[0]
}) {

    // TODO: scriptObject.type == 'module' for a single module path

    // flatten structure of array of objects to array of strings/paths
    let scriptDirectoryPathArray = hostScriptPath
        .filter(scriptObject => scriptObject.type == 'directory')
        .reduce((accumulator, currentValue) => {
            accumulator.push(currentValue.path)
            return accumulator
        }, [])
    // change relative path to absolute
    for (let index in scriptDirectoryPathArray) {
        scriptDirectoryPathArray[index] = path.join(applicationRoot, scriptDirectoryPathArray[index])
    }

    if(!filename) { // if no arguments supplied, fallback to default command.
        console.log("No command argument passed. Please choose a script:")
        console.log(listContent({ dir: scriptDirectoryPathArray, recursive: false }))
        process.exit(1)
    } 

    let continueRequire = true;
    while(continueRequire && scriptDirectoryPathArray.length > 0) {
        let hostScriptDirectoryPath = scriptDirectoryPathArray.pop()
        let hostMachineScriptModulePath = path.join(hostScriptDirectoryPath, `${filename}`); // the specific module to run.
        // Load the module with the matching name (either a folder module or file with js extension)
        try {
            console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS script]`, `Running ${hostMachineScriptModulePath}`)
            require( hostMachineScriptModulePath )
            continueRequire = false
        } catch (error) {
            console.log(error)
            console.log(filename + ' command isn`t configured')
        }
    }
}

  