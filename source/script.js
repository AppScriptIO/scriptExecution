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
import { scriptLookup } from './lookup.js'
import { singleScriptExecution } from './execute.js'

/**
 * read configuration option `script` and deal with the different options to execute a script that is requested `scriptKeyToInvoke`
 */
export { 
    singleScriptExecution as execute, 
    scriptLookup as lookup 
} 