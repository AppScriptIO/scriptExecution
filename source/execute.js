import { executeOnRequire } from "./executionAlgorithm/executeOnRequire.js"
import { executeOnCall } from "./executionAlgorithm/executeOnCall.js"
import { executeUsingArbitraryCode } from "./executionAlgorithm/executeUsingArbitraryCode.js"

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
 */
export function singleScriptExecution({ 
    scriptConfig, 
    parameter // @type array - parameter that should be executed with the script.
}) {
    // set target script path for the command line argument
    process.argv[1] = scriptConfig.path || process.argv[1] // in case path doesn't exist, keep it as is.

    switch (scriptConfig.type) {
        case 'script':
            executeOnRequire({ scriptPath: scriptConfig.path, parameter })
        break;
        case 'module': 
            executeOnCall({ scriptPath: scriptConfig.path, methodName: scriptConfig.methodName, parameter })
        break;
        case 'evaluateCode':
            executeUsingArbitraryCode({ scriptPath: scriptConfig.path, jsCodeToEvaluate: scriptConfig.jsCodeToEvaluate, parameter })
        break;
        default:
            throw new Error(`• Failed to execute script, as the 'scriptConfig.type' isn't recognized.`)
        break;
    }
}
