- Check the necessity for adding asynchronous script execution in addition to synchronous.
- use colored logging for script execution ```console.log(`\x1b[33m\x1b[1m\x1b[7m\x1b[36m%s\x1b[0m \x1b[2m\x1b[3m%s\x1b[0m`, `Script:`, `NodeJS App`)```
- Merge script execution implementations accross modules to using same specification and logic.
        
        3 places of script execution switcher implementation: 
        - graph module
        - scriptExecution module
        - buildTool module
- allow executing without the first parameter 
  i.e. `yarn run scriptManager buildSourceCode ".build()"` instead of `yarn run scriptManager buildSourceCode ".build({})"`
  as the `scriptManager` merges the first parameters using Object.assign to pass the project config value to the script.