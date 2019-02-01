import path from 'path'
import assert from 'assert' 
import util from 'util'
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' }

/**
 * Execute `scriptCofnig.type == 'module'` i.e. value is exported.
 */
export function executeOnCall({ scriptPath, methodName, parameter = [] }) {
    assert(path.isAbsolute(scriptPath), `• 'scriptPath' must be an absolute path to be executed.`)
    console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS module]`, `Running ${scriptPath}`)
    console.log(`\t\x1b[2m\x1b[3m%s\x1b[0m \x1b[95m%s\x1b[0m`, `File path:`, `${scriptPath}`)
    let requiredModule = require(scriptPath)
    let func; // function to execute

    switch (typeof requiredModule) {
        case 'object':
            assert(typeof requiredModule[methodName] == 'function', `• "${methodName}" must match property of required module and be a function: ${util.inspect(requiredModule)}`)
            func = requiredModule[methodName]
        break;
        case 'function': 
            func = requiredModule
        break; 
        default:
            let partialMessage =  (methodName) ? 'object' : 'function';
            throw new Error(`• Required script ${scriptPath} must be a ${partialMessage}, i.e. the script is expected to export a ${partialMessage}. Required script: ${util.inspect(requiredModule)}`)
        break;
    }

    func(...parameter) // execute function from module passing it the parameters.
}
