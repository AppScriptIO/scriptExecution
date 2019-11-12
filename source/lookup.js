import path from 'path'
import { resolveConfigOptionToAbsolutePath } from '@dependency/configurationManagement'
import { listContent } from '@dependency/listDirectoryContent'
import util from 'util'

export async function scriptLookup({
  script, // [ string | object | array of objects ] the path of script directory or array of objects, where objects can represent directories or module paths.
  projectRootPath,
  scriptKeyToInvoke,
}) {
  let scriptConfig, scriptFileConfigArray, scriptDirectoryPathArray
  switch (typeof script) {
    case 'string':
      scriptConfig = { type: 'script', path: script }
      break
    case 'object':
      // scriptObject.type == 'module' for a single module path
      scriptFileConfigArray = script.filter(scriptObject => scriptObject.type != 'directory')
      // change relative path to absolute
      for (let index in scriptFileConfigArray) {
        if (scriptFileConfigArray[index].path) {
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

      if (!scriptKeyToInvoke) {
        // if no arguments supplied, fallback to default command.
        console.log('• No command argument passed. Please choose a script:')
        if (script.length > 0) {
          console.log(script)
          let scriptInDirectory = listContent({ dir: scriptDirectoryPathArray, recursive: false })
          if (scriptInDirectory) {
            console.log(`\n Or \n`)
            scriptInDirectory
          }
        } else {
          console.log(`• There are no script options, the array is empty. Add scripts to the configuration files.`)
        }
        process.exit(1)
      }

      if (!scriptConfig)
        if (path.isAbsolute(scriptKeyToInvoke)) scriptConfig = { path: scriptKeyToInvoke }
        else {
          // check script in directories (`scriptConfig.type == 'directory' configuration)
          let continueLoop = true
          while (continueLoop && scriptDirectoryPathArray.length > 0) {
            let scriptDirectoryPath = scriptDirectoryPathArray.pop()
            let scriptPath = path.join(scriptDirectoryPath, `${scriptKeyToInvoke}`) // the specific module to run.
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

          // if no path was found
          // Run scripts from modules by using a similar module resolving algorithm of `path.resolve()`, where:
          // - `yarn run scriptManager ./x/y/moduleZ ".functionY()"` will load the script from relative path
          // - similar to previous only using absolute path.
          // --> `yarn run scriptManager @dependency/moduleZ ".functionY()"` will actually search for the script as if it is a node_modules module` will load the script from relative path
          if (continueLoop) {
            try {
              // try resolving the script using require algorithm from the project root directory.
              let scriptPath = require.resolve(scriptKeyToInvoke, { paths: [projectRootPath, process.cwd()] })
              scriptConfig = { path: scriptPath }
            } catch (error) {
              // skip
              console.log(`• Failed search for: ${scriptKeyToInvoke}`)
              // console.error(error)
            }
          }
        }

      break
  }

  if (!scriptConfig) {
    let errorMessage = `❌ Reached switch default as scriptKeyToInvoke "${scriptKeyToInvoke}" does not match any option.`
    let scriptListMessage = `scriptList: \n ${util.inspect(script, { colors: true, compact: false })}` // log available scripts
    throw new Error(`\x1b[41m${errorMessage}\x1b[0m \n ${scriptListMessage}`)
  }

  return scriptConfig
}
