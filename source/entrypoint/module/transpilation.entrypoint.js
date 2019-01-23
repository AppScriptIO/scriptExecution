// const transpileMacros = require('@dependency/transpileMacros.js')
// transpileMacros('babel-plugin-...') // executes babel register with specified babel plugins.

/* Entrypoint chain */
// • Transpilation (babelJSCompiler)
require('@dependency/javascriptTranspilation')({ babelConfigurationFile: 'serverRuntime.BabelConfig.js' })

// • Run
module.exports = require('./')