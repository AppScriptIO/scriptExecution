# scriptExecution
A **scripting tool** used to execute javascript scripting files for projects. Scripts & lookup directories are defined in the target project`s configuration file.

- **Switcher** - Acts as a switcher for choosing a script to execute using a key name compared with the configuration of the target project.
_e.g. deployment scripts as building distribution code, live testing, live reload, setup and running the app._
- **Lookup algorithm** - searches for the script file inside directories specified in the target project`s configuration file.

_A commandline interface is exposed through `scriptManager` package which intern uses `scriptExecution` to execute scripts from the target project._