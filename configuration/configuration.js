const path = require('path')

module.exports = {
    directory: {
        application: {
            rootPath: path.resolve(`${__dirname}/..`),
        },
    },
    script: [
        {
            type: 'directory',
            path: './script/'
        }
    ]
}
