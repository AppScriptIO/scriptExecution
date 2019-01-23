/**
 * CLI tool that calls other script according to passed argument commands. Acts as a switcher or adapter to receiving command-line arguments/commands.
 * For managing the the development, build, & testing of this project.
 * USAGE:
 * • ./entrypoint [build|run] entrypointConfigurationPath=./entrypoint/configuration.js entrypointConfigurationKey=[run | install | build | buildContainerManager/buildEnvironmentImage ] dockerImageTag=X dockerhubUser=x dockerhubPass=x [dockerImageName=x]
 */
import operatingSystem from 'os'
import path from 'path'
import assert from 'assert'
import { listContent } from '@dependency/listDirectoryContent'
import { runInDebugContext } from 'vm';
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' },
      osUsername = operatingSystem.userInfo().username
import { installEntrypointModule } from './utility/installScriptModule.js'
import { resolveConfigOptionToAbsolutePath } from '@dependency/configurationManagement'

/**
 * read configuration option `script` and deal with the different options to execute a script that is requested `scriptKeyToInvoke`
 */
export async function scriptExecution({
    script, // [ string | object | array of objects ] the path of script directory or array of objects, where objects can represent directories or module paths.
    appRootPath,
    scriptKeyToInvoke,
    shouldInstallModule = false // if should install node_modules dependencies of the script to be executed.
}) {
    let scriptConfig, scriptConfigArray, scriptDirectoryPathArray;
    switch (typeof script) {
        case 'string':
            scriptConfig = { type: 'module', path: script }
        break;
        case 'object':

            // scriptObject.type == 'module' for a single module path
            scriptConfigArray = script
                .filter(scriptObject => scriptObject.type != 'directory')
            // change relative path to absolute
            for (let index in scriptConfigArray) {
                if(scriptConfigArray[index].path) {
                    scriptConfigArray[index].path = resolveConfigOptionToAbsolutePath({ optionPath: scriptConfigArray[index].path, rootPath: appRootPath })
                } else {
                    // default entrypoint file location if no path option present in configuration file. Try to find the key name as file name in default entrypointFolder.
                    // scriptPath = path.join(`${configInstance.rootPath}`, `script`, `${scriptConfig.key}`) // .js file or folder module.
                }
            }

            // Load the module with the matching name (either a folder module or file with js extension)
            // get specific entrypoint configuration option (entrypoint.configKey)
            scriptConfig = scriptConfigArray.find(scriptObject => scriptObject.key == scriptKeyToInvoke)

            // flatten structure of array of objects to array of strings/paths
            scriptDirectoryPathArray = script
                .filter(scriptObject => scriptObject.type == 'directory')
                .reduce((accumulator, currentValue) => {
                    accumulator.push(currentValue.path)
                    return accumulator
                }, [])
            // change relative path to absolute
            for (let index in scriptDirectoryPathArray) {
                scriptDirectoryPathArray[index] = path.join(appRootPath, scriptDirectoryPathArray[index])
            }

            if(!scriptKeyToInvoke) { // if no arguments supplied, fallback to default command.
                console.log("No command argument passed. Please choose a script:")
                console.log(listContent({ dir: scriptDirectoryPathArray, recursive: false }))
                console.log(`\n Or \n`)
                console.log(script)
                process.exit(1)
            } 

            if(!scriptConfig) {
                // check script in directories (`scriptConfig.type == 'directory' configuration)
                let continueLoop = true;
                while(continueLoop && scriptDirectoryPathArray.length > 0) {
                    let scriptDirectoryPath = scriptDirectoryPathArray.pop()
                    let scriptPath = path.join(scriptDirectoryPath, `${scriptKeyToInvoke}`); // the specific module to run.
                    // Load the module with the matching name (either a folder module or file with js extension)
                    try {
                        require.resolve(scriptPath)
                        // in case resolved and found:
                        continueLoop = false
                        scriptConfig = { type: 'module', path: scriptPath }
                    } catch (error) {
                        // skip
                    }
                }
            } 
        
        break;
    }

    if(scriptConfig) {
        if(shouldInstallModule)
            await installEntrypointModule({ scriptPath: scriptConfig.path })    
        singleScriptExecution({ scriptConfig }) // Assuming script is synchronous 
    } else {
        console.log(`scriptList: \n`, script)
        let errorMessage = `❌ Reached switch default as scriptKeyToInvoke "${scriptKeyToInvoke}" does not match any case/kind/option`
        throw new Error(`\x1b[41m${errorMessage}\x1b[0m`)
    }
}

/**
 * Synchronously execute a single script using a `script configuration` object that holds the settings that should be used to run the script.
 * @param scriptConfig = { type: 'module', path }
 */
function singleScriptExecution({ scriptConfig }) {
    
    switch (scriptConfig.type) {
        case 'module': 
            singleScriptExecution_typeModule({ scriptPath: scriptConfig.path, methodName: scriptConfig.methodName })
        break;
        case 'script':
            singleScriptExecution_typeScript({ scriptPath: scriptConfig.path })
        break;
        default:
            throw new Error(`• Failed to execute script, as the 'scriptConfig.type' isn't recognized.`)
        break;
    }
}

/**
 * Execute `scriptCofnig.type == 'script'`
 */
function singleScriptExecution_typeScript({ scriptPath }) {
    assert(path.isAbsolute(scriptPath), `• 'scriptPath' must be an absolute path to be executed.`)
    console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS script]`, `Running ${scriptPath}`)
    console.log(`\t\x1b[2m\x1b[3m%s\x1b[0m \x1b[95m%s\x1b[0m`, `File path:`, `${scriptPath}`)
    require(scriptPath)
}

/**
 * Execute `scriptCofnig.type == 'module'`
 */
function singleScriptExecution_typeModule({ scriptPath, methodName }) {
    assert(path.isAbsolute(scriptPath), `• 'scriptPath' must be an absolute path to be executed.`)
    console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS module]`, `Running ${scriptPath}`)
    console.log(`\t\x1b[2m\x1b[3m%s\x1b[0m \x1b[95m%s\x1b[0m`, `File path:`, `${scriptPath}`)
    if(methodName) { 
        require(scriptPath)[methodName]()
    } else {
        require(scriptPath)() // execute the default export assuming it is a function.
    }
}