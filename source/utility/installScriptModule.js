import { installModuleMultiple, isFileOrFolderJSModule } from '@dependency/handleModuleSystem'
import findFileWalkingUpDirectory from 'find-up'

async function installEntrypointModule({ entrypointModulePath }) {
    // install node_modules for entrypoint module if not present in case a folder is being passed.
    // ISSUE - installing node_modules of and from within running module, will fail to load the newlly created moduules as node_modules path was already read by the nodejs application.
    let installDirectory,
        moduleType = isFileOrFolderJSModule({ modulePath: entrypointModulePath });
    switch(moduleType) {
        case 'directory':
            installDirectory = entrypointModulePath
        break;
        case 'file':
            installDirectory = path.dirname(entrypointModulePath) 
        break;
    }
    // Install node_modules
    // in case package.json doesn't exist in script's path, then check upper directories for the closest package.json and install if no node_modules located. This is because the yarn install if doesn't detect package.json file it will search for it in the upper directories and install the closest one.
    let closestPackageJsonPath = await findFileWalkingUpDirectory('package.json', { cwd: installDirectory }),
        closestPackageJsonDirectoryPath = (closestPackageJsonPath) ? path.dirname(closestPackageJsonPath) : false;
    if(closestPackageJsonDirectoryPath) {
        let isNodeModuleInstallExist = filesystem.existsSync(path.join(closestPackageJsonDirectoryPath, `node_modules`))
        if (!isNodeModuleInstallExist) {
            await installModuleMultiple({ installPathArray: [ installDirectory ] }) // install modules
        }
    }
}