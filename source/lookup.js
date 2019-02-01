import path from 'path'
import { resolveConfigOptionToAbsolutePath } from '@dependency/configurationManagement'
import { listContent } from '@dependency/listDirectoryContent'
import util from 'util'

export async function scriptLookup({ script, projectRootPath, scriptKeyToInvoke }) {
    let scriptConfig, scriptFileConfigArray, scriptDirectoryPathArray;
    switch (typeof script) {
        case 'string':
            scriptConfig = { type: 'script', path: script }
        break;
        case 'object':

            // scriptObject.type == 'module' for a single module path
            scriptFileConfigArray = script
                .filter(scriptObject => scriptObject.type != 'directory')
            // change relative path to absolute
            for (let index in scriptFileConfigArray) {
                if(scriptFileConfigArray[index].path) {
                    scriptFileConfigArray[index].path = resolveConfigOptionToAbsolutePath({ optionPath: scriptFileConfigArray[index].path, rootPath: projectRootPath })
                } else {
                    // default entrypoint file location if no path option present in configuration file. Try to find the key name as file name in default entrypointFolder.
                    // scriptPath = path.join(`${configInstance.rootPath}`, `script`, `${scriptConfig.key}`) // .js file or folder module.
                }
            }

            // Load the module with the matching name (either a folder module or file with js extension)
            // get specific entrypoint configuration option (entrypoint.configKey)
            scriptConfig = scriptFileConfigArray.find(scriptObject => scriptObject.key == scriptKeyToInvoke)

            // flatten structure of array of objects to array of strings/paths
            scriptDirectoryPathArray = script
                .filter(scriptObject => scriptObject.type == 'directory')
                .reduce((accumulator, currentValue) => {
                    accumulator.push(currentValue.path)
                    return accumulator
                }, [])
            // change relative path to absolute
            for (let index in scriptDirectoryPathArray) {
                scriptDirectoryPathArray[index] = resolveConfigOptionToAbsolutePath({ optionPath: scriptDirectoryPathArray[index], rootPath: projectRootPath })
            }

            if(!scriptKeyToInvoke) { // if no arguments supplied, fallback to default command.
                console.log("• No command argument passed. Please choose a script:")
                if(script.length > 0) {
                    console.log(script)
                    let scriptInDirectory = listContent({ dir: scriptDirectoryPathArray, recursive: false })
                    if(scriptInDirectory) {
                        console.log(`\n Or \n`)
                        scriptInDirectory
                    }
                } else { console.log(`• There are no script options, the array is empty. Add scripts to the configuration files.`) }
                process.exit(1)
            } 

            if(!scriptConfig) {
                // check script in directories (`scriptConfig.type == 'directory' configuration)
                let continueLoop = true;
                while(continueLoop && scriptDirectoryPathArray.length > 0) {
                    let scriptDirectoryPath = scriptDirectoryPathArray.pop()
                    let scriptPath = path.join(scriptDirectoryPath, `${scriptKeyToInvoke}`); // the specific module to run.
                    // Load the module with the matching name (either a folder module or file with js extension)
                    try {
                        require.resolve(scriptPath)
                        // in case resolved and found:
                        continueLoop = false
                        scriptConfig = { path: scriptPath }
                    } catch (error) {
                        // skip
                    }
                }
            } 
        
        break;
    }

    if(!scriptConfig) {
        let errorMessage = `❌ Reached switch default as scriptKeyToInvoke "${scriptKeyToInvoke}" does not match any option.`
        let scriptListMessage = `scriptList: \n ${util.inspect(script, { colors: true, compact: false })}` // log available scripts 
        throw new Error(`\x1b[41m${errorMessage}\x1b[0m \n ${scriptListMessage}`)
    }
    
    return scriptConfig
}
