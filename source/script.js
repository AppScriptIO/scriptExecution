/**
 * CLI tool that calls other script according to passed argument commands. Acts as a switcher or adapter to receiving command-line arguments/commands.
 * For managing the the development, build, & testing of this project.
 * USAGE:
 * • ./entrypoint [build|run] entrypointConfigurationPath=./entrypoint/configuration.js entrypointConfigurationKey=[run | install | build | buildContainerManager/buildEnvironmentImage ] dockerImageTag=X dockerhubUser=x dockerhubPass=x [dockerImageName=x]
 */
import operatingSystem from 'os'
const  osUsername = operatingSystem.userInfo().username
import filesystem from 'fs'
import assert from 'assert'
import { installEntrypointModule } from './utility/installScriptModule.js'
import { scriptLookup } from './lookup.js'
import { singleScriptExecution } from './execute.js'

/**
 * read configuration option `script` and deal with the different options to execute a script that is requested `scriptKeyToInvoke`
 */
export async function scriptExecution({
    script, // [ string | object | array of objects ] the path of script directory or array of objects, where objects can represent directories or module paths.
    projectRootPath,
    scriptKeyToInvoke,
    jsCodeToEvaluate, // javascript encoded as string to evaluate on the required script.
    shouldInstallModule = false, // if should install node_modules dependencies of the script to be executed.
    executeWithParameter, // an array of function parameters that should be passed to the target script.
}) {
 
    let scriptConfig = await scriptLookup({ script, projectRootPath, scriptKeyToInvoke })
                                .catch(error => { throw error })

    if(shouldInstallModule)
        await installEntrypointModule({ scriptPath: scriptConfig.path })    
    
    if(jsCodeToEvaluate) {
        scriptConfig.type = 'evaluateCode'
        scriptConfig.jsCodeToEvaluate = jsCodeToEvaluate
    }

    scriptConfig.type = scriptConfig.type || 'script' // fallback to default

    singleScriptExecution({ scriptConfig, parameter: executeWithParameter }) // Assuming script is synchronous 
}

export { 
    singleScriptExecution as execute, 
    scriptLookup as lookup 
} 