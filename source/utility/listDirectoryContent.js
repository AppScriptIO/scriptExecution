import filesystem from 'fs'

// get direcotry contents list
export const listContent = ({
    dir, // single path or array of directory paths.
    filelist = [], 
    option
} = {}) => {
    
    if(! Array.isArray(dir)) dir = [dir] // in case a single string, convert it to array to work with the function.

    for ( let directoryPath of dir) {
        filelist = filelist.concat( listContentSingleContent({ directoryPath, option }) )
    }

  return filelist;
}

function listContentSingleContent({
    directoryPath,
    filelist = [], 
    option = {
        recursive: false
    }
}) {
    if(!filesystem.existsSync(directoryPath)) return filelist
    filesystem.readdirSync(directoryPath).forEach(content => {
        if(option.recursive) {
            filelist = filesystem.statSync(path.join(directoryPath, content)).isDirectory()
                ? listContent(path.join(directoryPath, content), filelist)
                : filelist.push(content);
        } else {
            filelist.push(content)
        }
    })
    return filelist
}