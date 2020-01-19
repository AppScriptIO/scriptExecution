import path from 'path'
const style = { titleCyan: '\x1b[33m\x1b[1m\x1b[7m\x1b[36m', titleGolden: '\x1b[33m\x1b[1m\x1b[7m', message: '\x1b[96m', italic: '\x1b[2m\x1b[3m', default: '\x1b[0m' }
import assert from 'assert'

/**
 * Execute `scriptCofnig.type == 'script'`
 * Usage:
 *  # Extracting the parameters from the script: `const [parameter1, parameter2] = process.argv.parameter`
 *    e.g. `const [api] = process.argv.parameter` or `const [{ project: projectApi }] = process.argv.parameter`
 */
export function executeOnRequire({
  scriptPath,
  parameter = null, // parameters are passed using an environment variable.
}) {
  assert(path.isAbsolute(scriptPath), `• 'scriptPath' must be an absolute path to be executed.`)
  console.log(`${style.italic}${style.titleGolden}%s${style.default} - %s`, `•[JS script]`, `Running ${scriptPath}`)
  console.log(`\t\x1b[2m\x1b[3m%s\x1b[0m \x1b[95m%s\x1b[0m`, `File path:`, `${scriptPath}`)

  // pass parameter to script
  // another option for passing parameter could be `process.argv.push(...parameter)`
  process.argv['parameter'] = parameter // attach to the global `process.argv` object, this will not affect the argv array yet allow access to the parameters

  require(scriptPath)
}
