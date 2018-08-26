import filesystem from 'fs'

// get direcotry contents list
export const listContent = ({dir, filelist = [], recursive = false}) => {
    filesystem.readdirSync(dir).forEach(content => {
        if(recursive) {
            filelist = filesystem.statSync(path.join(dir, content)).isDirectory()
                ? listContent(path.join(dir, content), filelist)
                : filelist.push(content);
        } else {
            filelist.push(content)
        }
  
    });
  return filelist;
}
