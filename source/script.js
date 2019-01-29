/**
 * CLI tool that calls other script according to passed argument commands. Acts as a switcher or adapter to receiving command-line arguments/commands.
 * For managing the the development, build, & testing of this project.
 * USAGE:
 * • ./entrypoint [build|run] entrypointConfigurationPath=./entrypoint/configuration.js entrypointConfigurationKey=[run | install | build | buildContainerManager/buildEnvironmentImage ] dockerImageTag=X dockerhubUser=x dockerhubPass=x [dockerImageName=x]
 */
import operatingSystem from 'os'
import filesystem from 'fs'
import path from 'path'
import assert from 'assert'
import { listContent } from '@dependency/listDirectoryContent'
import { runInDebugContext } from 'vm';
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' },
      osUsername = operatingSystem.userInfo().username
import { installEntrypointModule } from './utility/installScriptModule.js'
import { resolveConfigOptionToAbsolutePath } from '@dependency/configurationManagement'

/**
 * read configuration option `script` and deal with the different options to execute a script that is requested `scriptKeyToInvoke`
 */
export async function scriptExecution({
    script, // [ string | object | array of objects ] the path of script directory or array of objects, where objects can represent directories or module paths.
    appRootPath,
    scriptKeyToInvoke,
    jsToEvaluate, // javascript encoded as string to evaluate on the required script.
    shouldInstallModule = false // if should install node_modules dependencies of the script to be executed.
}) {
    let scriptConfig, scriptConfigArray, scriptDirectoryPathArray;
    switch (typeof script) {
        case 'string':
            scriptConfig = { type: 'module', path: script }
        break;
        case 'object':

            // scriptObject.type == 'module' for a single module path
            scriptConfigArray = script
                .filter(scriptObject => scriptObject.type != 'directory')
            // change relative path to absolute
            for (let index in scriptConfigArray) {
                if(scriptConfigArray[index].path) {
                    scriptConfigArray[index].path = resolveConfigOptionToAbsolutePath({ optionPath: scriptConfigArray[index].path, rootPath: appRootPath })
                } else {
                    // default entrypoint file location if no path option present in configuration file. Try to find the key name as file name in default entrypointFolder.
                    // scriptPath = path.join(`${configInstance.rootPath}`, `script`, `${scriptConfig.key}`) // .js file or folder module.
                }
            }

            // Load the module with the matching name (either a folder module or file with js extension)
            // get specific entrypoint configuration option (entrypoint.configKey)
            scriptConfig = scriptConfigArray.find(scriptObject => scriptObject.key == scriptKeyToInvoke)

            // flatten structure of array of objects to array of strings/paths
            scriptDirectoryPathArray = script
                .filter(scriptObject => scriptObject.type == 'directory')
                .reduce((accumulator, currentValue) => {
                    accumulator.push(currentValue.path)
                    return accumulator
                }, [])
            // change relative path to absolute
            for (let index in scriptDirectoryPathArray) {
                scriptDirectoryPathArray[index] = resolveConfigOptionToAbsolutePath({ optionPath: scriptDirectoryPathArray[index], rootPath: appRootPath })
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
                        scriptConfig = { type: 'script', path: scriptPath }
                    } catch (error) {
                        // skip
                    }
                }
            } 
        
        break;
    }

//     var data = '';
// function withPipe(data) {
//    console.log('content was piped');
//    console.log(data.trim());
// }
// function withoutPipe() {
//    console.log('no content was piped');
// }

// var self = process.stdin;
// self.on('readable', function() {
//     var chunk = this.read();
//     if (chunk === null) {
//         withoutPipe();
//     } else {
//        data += chunk;
//     }
// });
// self.on('end', function() {
//    withPipe(data);
// });

    console.log(process.argv)
    console.log(Boolean(process.stdin.isTTY)) 
    console.log(Boolean(process.stdout.isTTY))
    console.log(await loadSTDIN3())
    console.log(process.argv)
    return;

    let standartInputData = ''
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      // Use a loop to make sure we read all available data.
      while ((chunk = process.stdin.read()) !== null) {
        standartInputData += chunk
      }
    });
    
    process.stdin.on('end', async () => {
        jsToEvaluate = jsToEvaluate || standartInputData

        if(scriptConfig) {
            if(shouldInstallModule)
                await installEntrypointModule({ scriptPath: scriptConfig.path })    
            if(jsToEvaluate) {
                eval(`require('${scriptConfig.path}')${jsToEvaluate}`) 
            } else {
                singleScriptExecution({ scriptConfig }) // Assuming script is synchronous 
            }
        } else {
            console.log(`scriptList: \n`, script)
            let errorMessage = `❌ Reached switch default as scriptKeyToInvoke "${scriptKeyToInvoke}" does not match any option.`
            throw new Error(`\x1b[41m${errorMessage}\x1b[0m`)
        }

    });

}

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
function singleScriptExecution({ scriptConfig }) {
    
    switch (scriptConfig.type) {
        case 'module': 
            singleScriptExecution_typeModule({ scriptPath: scriptConfig.path, methodName: scriptConfig.methodName })
        break;
        case 'script':
            singleScriptExecution_typeScript({ scriptPath: scriptConfig.path })
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
        require(scriptPath)() // execute the default export assuming it is a function.
    }
}

/**
 * Handle stdin input using buffers rather than the event emitter of process.stdin, which will not keep waiting in an idle state if no piped values are passed (in the program was run without shell pipeline).
 * https://github.com/gpestana/pipe-args
  */
function loadSTDIN() {
    if (process.stdin.isTTY) return false;
  
    const BUFSIZE = 65536;
    let nbytes = 0;
    let chunks = [];
    let buffer = '';
  
    while(true) {
      try {
        buffer = Buffer.alloc(BUFSIZE);
        nbytes = filesystem.readSync(0, buffer, 0, BUFSIZE, null);
      } 
      catch (e) {
        if (e.code != 'EAGAIN') throw e; 
      };
  
      if (nbytes === 0) break;
       chunks.push(buffer.slice(0, nbytes));
    };
    
    const stdin = Buffer.concat(chunks).toString();
    if (stdin) {
      process.argv.push(stdin.trim());
      return true;
    }
  
}

const stdin = process.stdin;

function loadSTDIN2() {
	let ret = '';

	return new Promise(resolve => {
		if (stdin.isTTY) {
			resolve(ret);
			return;
		}

		stdin.setEncoding('utf8');

		stdin.on('readable', () => {
			let chunk;

			while ((chunk = stdin.read())) {
				ret += chunk;
			}
		});

		stdin.on('end', () => {
			resolve(ret);
		});
	});
};

function loadSTDIN3() {
	const ret = [];
	let len = 0;

	return new Promise(resolve => {
		if (stdin.isTTY) {
			resolve(Buffer.concat([]));
			return;
		}

		stdin.on('readable', () => {
			let chunk;

			while ((chunk = stdin.read())) {
				ret.push(chunk);
				len += chunk.length;
			}
		});

		stdin.on('end', () => {
			resolve(Buffer.concat(ret, len));
		});
	});
};
