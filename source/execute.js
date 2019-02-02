import { executeOnRequire } from "./executionAlgorithm/executeOnRequire.js"
import { executeOnCall } from "./executionAlgorithm/executeOnCall.js"
import { executeUsingArbitraryCode } from "./executionAlgorithm/executeUsingArbitraryCode.js"
import { installEntrypointModule } from './utility/installScriptModule.js'

/**
 * Synchronously execute a single script using a `script configuration` object that holds the settings that should be used to run the script.
 * @param scriptConfig = { type: 'module' || 'script', path }
 * 
 * Javascript scripts wit different `scriptConfig.type` would be executed in the following way: 
 * • `script` - Immediately executed by requiring the file.
 * • `module` - 
 *      ○ Required function and then executed. 
 *      ○ Required with an exported name and then executed as a function.
 * • `jsCodeToEvaluate` - allows the execution of modules (exported values) using the api from commandline by passing js code as commandline argument.
 * 
 * `scriptConfig.adapterFunction` - a function that will be called as an intermediate to the script, this allows custom calling of scripts to support custom implementation of interfaces.
 *                                intermediate function implements the interface that the client expects. change parameter naming to match that of the script.
 * 
 * # Example 
 * `({ callback, args }) => {
 *   // change api to specific script parameter name
 *   args[0].targetProject = args[0].api.project
 *   return () => callback(...args) // specific interface of the callback
 * }`            
 */
export async function singleScriptExecution({ 
    scriptConfig, 
    parameter, // @type array - parameter that should be executed with the script. // an array of function parameters that should be passed to the target script.
    shouldInstallModule = false, // if should install node_modules dependencies of the script to be executed.
    jsCodeToEvaluate, // javascript encoded as string to evaluate on the required script.
}) {
    // set target script path for the command line argument
    process.argv[1] = scriptConfig.path || process.argv[1] // in case path doesn't exist, keep it as is.

    if(shouldInstallModule)
        await installEntrypointModule({ scriptPath: scriptConfig.path })    
    
    if(jsCodeToEvaluate) {
        scriptConfig.type = 'evaluateCode'
        scriptConfig.jsCodeToEvaluate = jsCodeToEvaluate
    }

    scriptConfig.type = scriptConfig.type || 'script' // fallback to default

    switch (scriptConfig.type) {
        case 'script':
            executeOnRequire({ scriptPath: scriptConfig.path, parameter })
        break;
        case 'module': 
            executeOnCall({ scriptPath: scriptConfig.path, methodName: scriptConfig.methodName, parameter, adapterFunction: scriptConfig.adapterFunction })
        break;
        case 'evaluateCode':
            executeUsingArbitraryCode({ scriptPath: scriptConfig.path, jsCodeToEvaluate: scriptConfig.jsCodeToEvaluate, parameter, adapterFunction: scriptConfig.adapterFunction })
        break;
        default:
            throw new Error(`• Failed to execute script, as the 'scriptConfig.type' isn't recognized.`)
        break;
    }
}
