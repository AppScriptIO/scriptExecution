import util from 'util'
import vm from 'vm'

/** 
 * Execute `scriptCofnig.type == 'jsCodeToEvaluate'` where the script is required and the jsCodeToEvaluate is evaluated on the required file.
 * this is a different approach where command arguments aren't needed as the parameters are passed as JS code and evaluated.
 */
export function executeUsingArbitraryCode({ 
    scriptPath, 
    jsCodeToEvaluate, 
    parameter = {},
    adapterFunction = null // the adapter must return a function where it encapsulates the specific needed implementation for the script.
}) {
    let scriptModule = require(scriptPath)
    scriptModule = createModuleProxy({ target: scriptModule, adapterFunction, additionalParameter: parameter })
    
    let contextEnvironment = vm.createContext(Object.assign({
            // proxy for calling first function in the tree, pass arguments. 
            _requiredModule_: scriptModule, // pass required script
            // require // pass global require to the evaluated code context,
            parameter: parameter
        },
        (typeof parameter == 'object') ? parameter : {} // make all keys available for the script as globals
    ))
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

function createModuleProxy({
    target, // target module or subproperties of module (recursive calls)
    // merging supports only when the additional parameter is an object and first argument of the js code is an object too. In other casses the addional parameter will be ignored in calling.
    additionalParameter, // parameters to add to the arguments call (where arguments call are from the evaluated js code and parameter are from the api caller e.g. scriptManager)
    adapterFunction
}) { // this function is called recursively to support nested objects in case the target is an object.
    if(typeof target != 'function' && typeof target != 'object') return target // ignore non-objects and non-functions.
    return new Proxy(target, { // create a proxy to apply `adapterFunction` on the first called function.
        apply: function(_target, thisArg, argumentsList) {
            if(typeof additionalParameter == 'object' && typeof argumentsList[0] == 'object') // supports only objects
                argumentsList[0] = Object.assign(additionalParameter, argumentsList[0])
            if(adapterFunction) // apply the adapter on the first called function e.g. `<scriptModule>.x.y.z(<apply adapter>)` or `<scriptModule>(<apply adapter>)`
                return adapterFunction({ callback: _target, args: argumentsList})()
            else 
                return _target(...argumentsList)
        }, 
        get: (_target, property, receiver) => {
            let propertyValue = Reflect.get(_target, property, receiver)
            return createModuleProxy({ target: propertyValue, adapterFunction, additionalParameter })
        }
    })
}

