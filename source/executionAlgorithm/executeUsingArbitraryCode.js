import util from 'util'
import vm from 'vm'

/** 
 * Execute `scriptCofnig.type == 'jsCodeToEvaluate'` where the script is required and the jsCodeToEvaluate is evaluated on the required file.
 * this is a different approach where command arguments aren't needed as the parameters are passed as JS code and evaluated.
 */
export function executeUsingArbitraryCode({ scriptPath, jsCodeToEvaluate, parameter = [] }) {
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
        console.log(`scriptModule/_requiredModule_ (i.e. required script path) is equal to : ${util.inspect(scriptModule, { colors: true, compact: false })}`)
        throw error
    }
}