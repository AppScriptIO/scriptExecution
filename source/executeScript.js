import vm from 'vm'
import util from 'util'
import assert from 'assert'
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' }

/**
 * Synchronously execute a single script using a `script configuration` object that holds the settings that should be used to run the script.
 * @param scriptConfig = { type: 'module' || 'script', path }
 * 
 * Javascript scripts would be executed in the following way: 
 * • `script` - Immediately executed by requiring the file.
 * • `module` - 
 *      ○ Required function and then executed. 
 *      ○ Required with an exported name and then executed as a function.
 */
export function singleScriptExecution({ scriptConfig }) {
    
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
 */
function singleScriptExecution_typeEvaluateCode({ scriptPath, jsCodeToEvaluate }) {
    let scriptModule = require(scriptPath)
    let contextEnvironment = vm.createContext({
        requiredModule: scriptModule, // pass required script
        // require // pass global require to the evaluated code context
    })
    let vmScript = new vm.Script(`requiredModule${jsCodeToEvaluate}`, { // where `requiredModule` is the required script variable from the context
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