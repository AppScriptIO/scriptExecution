import vm from 'vm'
import path from 'path'
import assert from 'assert'
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' }

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
export function singleScriptExecution({ scriptConfig }) {
    // set target script path for the command line argument
    process.argv[1] = scriptConfig.path || process.argv[1] // in case path doesn't exist, keep it as is.

    switch (scriptConfig.type) {
        case 'module': 
            singleScriptExecution_typeModule({ scriptPath: scriptConfig.path, methodName: scriptConfig.methodName })
        break;
        case 'script':
            singleScriptExecution_typeScript({ scriptPath: scriptConfig.path })
        break;
        case 'evaluateCode':
            singleScriptExecution_typeEvaluateCode({ scriptPath: scriptConfig.path, jsCodeToEvaluate: scriptConfig.jsCodeToEvaluate })
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
 * Execute `scriptCofnig.type == 'module'` i.e. value is exported.
 */
function singleScriptExecution_typeModule({ scriptPath, methodName }) {
    assert(path.isAbsolute(scriptPath), `• 'scriptPath' must be an absolute path to be executed.`)
    console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS module]`, `Running ${scriptPath}`)
    console.log(`\t\x1b[2m\x1b[3m%s\x1b[0m \x1b[95m%s\x1b[0m`, `File path:`, `${scriptPath}`)
    if(methodName) { 
        require(scriptPath)[methodName]()
    } else {
        let func = require(scriptPath)
        assert(typeof func == 'function', `• Required script ${scriptPath} must be a function, i.e. the script is expected to export a function`)
        func() // execute the default export assuming it is a function.
    }
}

/** 
 * Execute `scriptCofnig.type == 'jsCodeToEvaluate'` where the script is required and the jsCodeToEvaluate is evaluated on the required file.
 * this is a different approach where command arguments aren't needed as the parameters are passed as JS code and evaluated.
 */
function singleScriptExecution_typeEvaluateCode({ scriptPath, jsCodeToEvaluate }) {
    // process.exit()
    let scriptModule = require(scriptPath)
    let contextEnvironment = vm.createContext({
        _requiredModule_: scriptModule, // pass required script
        // require // pass global require to the evaluated code context
    })
    let vmScript = new vm.Script(`
        _requiredModule_${jsCodeToEvaluate}
        `, { // where `requiredModule` is the required script variable from the context
        filename: scriptPath // add file to Node's event loop stack trace
    })
    try {
        vmScript.runInContext(contextEnvironment, { 
            breakOnSigint: true // break when Ctrl+C is received.
        })    
    } catch (error) {
        console.log(`❌ 'vm.runInContext' ${scriptPath} running in its own context failed.`)
        throw error
    }
}