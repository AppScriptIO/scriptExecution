/**
 * CLI tool that calls other script according to passed argument commands. Acts as a switcher or adapter to receiving command-line arguments/commands.
 * For managing the the development, build, & testing of this project.
 * USAGE:
 * • ./entrypoint [build|run] entrypointConfigurationPath=./entrypoint/configuration.js entrypointConfigurationKey=[run | install | build | buildContainerManager/buildEnvironmentImage ] dockerImageTag=X dockerhubUser=x dockerhubPass=x [dockerImageName=x]
 */
import operatingSystem from 'os'
const  osUsername = operatingSystem.userInfo().username
import filesystem from 'fs'
import path from 'path'
import assert from 'assert'
import { installEntrypointModule } from './utility/installScriptModule.js'
import { scriptLookup } from './scriptLookup.js'
import { singleScriptExecution } from './executeScript.js'

/**
 * read configuration option `script` and deal with the different options to execute a script that is requested `scriptKeyToInvoke`
 */
export async function scriptExecution({
    script, // [ string | object | array of objects ] the path of script directory or array of objects, where objects can represent directories or module paths.
    appRootPath,
    scriptKeyToInvoke,
    jsCodeToEvaluate, // javascript encoded as string to evaluate on the required script.
    shouldInstallModule = false // if should install node_modules dependencies of the script to be executed.
}) {
    let scriptConfig = await scriptLookup({ script, appRootPath, scriptKeyToInvoke })
                            .catch(error => {
                                console.log(`scriptList: \n`, script) // log available scripts 
                                throw error
                            })

    if(shouldInstallModule)
        await installEntrypointModule({ scriptPath: scriptConfig.path })    
    
    if(jsCodeToEvaluate) {
        scriptConfig.type = 'evaluateCode'
        scriptConfig.jsCodeToEvaluate = jsCodeToEvaluate
    }

    singleScriptExecution({ scriptConfig }) // Assuming script is synchronous 
}


