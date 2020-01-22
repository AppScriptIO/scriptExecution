"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.scriptLookup = scriptLookup;var _path = _interopRequireDefault(require("path"));
var _configurationManagement = require("@dependency/configurationManagement");
var _handleFilesystemOperation = require("@dependency/handleFilesystemOperation");
var _util = _interopRequireDefault(require("util"));

async function scriptLookup({
  script,
  projectRootPath,
  scriptKeyToInvoke })
{
  let scriptConfig, scriptFileConfigArray, scriptDirectoryPathArray;
  switch (typeof script) {
    case 'string':
      scriptConfig = { type: 'script', path: script };
      break;
    case 'object':

      scriptFileConfigArray = script.filter(scriptObject => scriptObject.type != 'directory');

      for (let index in scriptFileConfigArray) {
        if (scriptFileConfigArray[index].path) {
          scriptFileConfigArray[index].path = (0, _configurationManagement.resolveConfigOptionToAbsolutePath)({ optionPath: scriptFileConfigArray[index].path, rootPath: projectRootPath });
        } else {


        }
      }



      scriptConfig = scriptFileConfigArray.find(scriptObject => scriptObject.key == scriptKeyToInvoke);


      scriptDirectoryPathArray = script.
      filter(scriptObject => scriptObject.type == 'directory').
      reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.path);
        return accumulator;
      }, []);

      for (let index in scriptDirectoryPathArray) {
        scriptDirectoryPathArray[index] = (0, _configurationManagement.resolveConfigOptionToAbsolutePath)({ optionPath: scriptDirectoryPathArray[index], rootPath: projectRootPath });
      }

      if (!scriptKeyToInvoke) {

        console.log('• No command argument passed. Please choose a script:');
        if (script.length > 0) {
          console.log(script);
          let scriptInDirectory = (0, _handleFilesystemOperation.listContent)({ dir: scriptDirectoryPathArray, recursive: false });
          if (scriptInDirectory) {
            console.log(`\n Or \n`);
            scriptInDirectory;
          }
        } else {
          console.log(`• There are no script options, the array is empty. Add scripts to the configuration files.`);
        }
        process.exit(1);
      }

      if (!scriptConfig)
      if (_path.default.isAbsolute(scriptKeyToInvoke)) scriptConfig = { path: scriptKeyToInvoke };else
      {

        let continueLoop = true;
        while (continueLoop && scriptDirectoryPathArray.length > 0) {
          let scriptDirectoryPath = scriptDirectoryPathArray.pop();
          let scriptPath = _path.default.join(scriptDirectoryPath, `${scriptKeyToInvoke}`);

          try {
            require.resolve(scriptPath);

            continueLoop = false;
            scriptConfig = { path: scriptPath };
          } catch (error) {

          }
        }






        if (continueLoop) {
          try {

            let scriptPath = require.resolve(scriptKeyToInvoke, { paths: [projectRootPath, process.cwd()] });
            scriptConfig = { path: scriptPath };
          } catch (error) {

            console.log(`• Failed search for: ${scriptKeyToInvoke}`);

          }
        }
      }

      break;}


  if (!scriptConfig) {
    let errorMessage = `❌ Reached switch default as scriptKeyToInvoke "${scriptKeyToInvoke}" does not match any option.`;
    let scriptListMessage = `scriptList: \n ${_util.default.inspect(script, { colors: true, compact: false })}`;
    throw new Error(`\x1b[41m${errorMessage}\x1b[0m \n ${scriptListMessage}`);
  }

  return scriptConfig;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9sb29rdXAuanMiXSwibmFtZXMiOlsic2NyaXB0TG9va3VwIiwic2NyaXB0IiwicHJvamVjdFJvb3RQYXRoIiwic2NyaXB0S2V5VG9JbnZva2UiLCJzY3JpcHRDb25maWciLCJzY3JpcHRGaWxlQ29uZmlnQXJyYXkiLCJzY3JpcHREaXJlY3RvcnlQYXRoQXJyYXkiLCJ0eXBlIiwicGF0aCIsImZpbHRlciIsInNjcmlwdE9iamVjdCIsImluZGV4Iiwib3B0aW9uUGF0aCIsInJvb3RQYXRoIiwiZmluZCIsImtleSIsInJlZHVjZSIsImFjY3VtdWxhdG9yIiwiY3VycmVudFZhbHVlIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJsZW5ndGgiLCJzY3JpcHRJbkRpcmVjdG9yeSIsImRpciIsInJlY3Vyc2l2ZSIsInByb2Nlc3MiLCJleGl0IiwiaXNBYnNvbHV0ZSIsImNvbnRpbnVlTG9vcCIsInNjcmlwdERpcmVjdG9yeVBhdGgiLCJwb3AiLCJzY3JpcHRQYXRoIiwiam9pbiIsInJlcXVpcmUiLCJyZXNvbHZlIiwiZXJyb3IiLCJwYXRocyIsImN3ZCIsImVycm9yTWVzc2FnZSIsInNjcmlwdExpc3RNZXNzYWdlIiwidXRpbCIsImluc3BlY3QiLCJjb2xvcnMiLCJjb21wYWN0IiwiRXJyb3IiXSwibWFwcGluZ3MiOiJvTUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxlQUFlQSxZQUFmLENBQTRCO0FBQ2pDQyxFQUFBQSxNQURpQztBQUVqQ0MsRUFBQUEsZUFGaUM7QUFHakNDLEVBQUFBLGlCQUhpQyxFQUE1QjtBQUlKO0FBQ0QsTUFBSUMsWUFBSixFQUFrQkMscUJBQWxCLEVBQXlDQyx3QkFBekM7QUFDQSxVQUFRLE9BQU9MLE1BQWY7QUFDRSxTQUFLLFFBQUw7QUFDRUcsTUFBQUEsWUFBWSxHQUFHLEVBQUVHLElBQUksRUFBRSxRQUFSLEVBQWtCQyxJQUFJLEVBQUVQLE1BQXhCLEVBQWY7QUFDQTtBQUNGLFNBQUssUUFBTDs7QUFFRUksTUFB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RCxDQUtFLE9BQU9JLEtBQVAsRUFBYzs7QUFFZjtBQUNGOzs7Ozs7O0FBT0QsWUFBSVAsWUFBSixFQUFrQjtBQUNoQixjQUFJOztBQUVGLGdCQUFJRyxVQUFVLEdBQUdFLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQmhDLGlCQUFoQixFQUFtQyxFQUFFa0MsS0FBSyxFQUFFLENBQUNuQyxlQUFELEVBQWtCd0IsT0FBTyxDQUFDWSxHQUFSLEVBQWxCLENBQVQsRUFBbkMsQ0FBakI7QUFDQWxDLFlBQUFBLFlBQVksR0FBRyxFQUFFSSxJQUFJLEVBQUV3QixVQUFSLEVBQWY7QUFDRCxXQUpELENBSUUsT0FBT0ksS0FBUCxFQUFjOztBQUVkaEIsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsd0JBQXVCbEIsaUJBQWtCLEVBQXREOztBQUVEO0FBQ0Y7QUFDRjs7QUFFSCxZQXRGSjs7O0FBeUZBLE1BQUksQ0FBQ0MsWUFBTCxFQUFtQjtBQUNqQixRQUFJbUMsWUFBWSxHQUFJLGtEQUFpRHBDLGlCQUFrQiw4QkFBdkY7QUFDQSxRQUFJcUMsaUJBQWlCLEdBQUksa0JBQWlCQyxjQUFLQyxPQUFMLENBQWF6QyxNQUFiLEVBQXFCLEVBQUUwQyxNQUFNLEVBQUUsSUFBVixFQUFnQkMsT0FBTyxFQUFFLEtBQXpCLEVBQXJCLENBQXVELEVBQWpHO0FBQ0EsVUFBTSxJQUFJQyxLQUFKLENBQVcsV0FBVU4sWUFBYSxjQUFhQyxpQkFBa0IsRUFBakUsQ0FBTjtBQUNEOztBQUVELFNBQU9wQyxZQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbmZpZ09wdGlvblRvQWJzb2x1dGVQYXRoIH0gZnJvbSAnQGRlcGVuZGVuY3kvY29uZmlndXJhdGlvbk1hbmFnZW1lbnQnXG5pbXBvcnQgeyBsaXN0Q29udGVudCB9IGZyb20gJ0BkZXBlbmRlbmN5L2hhbmRsZUZpbGVzeXN0ZW1PcGVyYXRpb24nXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NyaXB0TG9va3VwKHtcbiAgc2NyaXB0LCAvLyBbIHN0cmluZyB8IG9iamVjdCB8IGFycmF5IG9mIG9iamVjdHMgXSB0aGUgcGF0aCBvZiBzY3JpcHQgZGlyZWN0b3J5IG9yIGFycmF5IG9mIG9iamVjdHMsIHdoZXJlIG9iamVjdHMgY2FuIHJlcHJlc2VudCBkaXJlY3RvcmllcyBvciBtb2R1bGUgcGF0aHMuXG4gIHByb2plY3RSb290UGF0aCxcbiAgc2NyaXB0S2V5VG9JbnZva2UsXG59KSB7XG4gIGxldCBzY3JpcHRDb25maWcsIHNjcmlwdEZpbGVDb25maWdBcnJheSwgc2NyaXB0RGlyZWN0b3J5UGF0aEFycmF5XG4gIHN3aXRjaCAodHlwZW9mIHNjcmlwdCkge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBzY3JpcHRDb25maWcgPSB7IHR5cGU6ICdzY3JpcHQnLCBwYXRoOiBzY3JpcHQgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgLy8gc2NyaXB0T2JqZWN0LnR5cGUgPT0gJ21vZHVsZScgZm9yIGEgc2luZ2xlIG1vZHVsZSBwYXRoXG4gICAgICBzY3JpcHRGaWxlQ29uZmlnQXJyYXkgPSBzY3JpcHQuZmlsdGVyKHNjcmlwdE9iamVjdCA9PiBzY3JpcHRPYmplY3QudHlwZSAhPSAnZGlyZWN0b3J5JylcbiAgICAgIC8vIGNoYW5nZSByZWxhdGl2ZSBwYXRoIHRvIGFic29sdXRlXG4gICAgICBmb3IgKGxldCBpbmRleCBpbiBzY3JpcHRGaWxlQ29uZmlnQXJyYXkpIHtcbiAgICAgICAgaWYgKHNjcmlwdEZpbGVDb25maWdBcnJheVtpbmRleF0ucGF0aCkge1xuICAgICAgICAgIHNjcmlwdEZpbGVDb25maWdBcnJheVtpbmRleF0ucGF0aCA9IHJlc29sdmVDb25maWdPcHRpb25Ub0Fic29sdXRlUGF0aCh7IG9wdGlvblBhdGg6IHNjcmlwdEZpbGVDb25maWdBcnJheVtpbmRleF0ucGF0aCwgcm9vdFBhdGg6IHByb2plY3RSb290UGF0aCB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRlZmF1bHQgZW50cnlwb2ludCBmaWxlIGxvY2F0aW9uIGlmIG5vIHBhdGggb3B0aW9uIHByZXNlbnQgaW4gY29uZmlndXJhdGlvbiBmaWxlLiBUcnkgdG8gZmluZCB0aGUga2V5IG5hbWUgYXMgZmlsZSBuYW1lIGluIGRlZmF1bHQgZW50cnlwb2ludEZvbGRlci5cbiAgICAgICAgICAvLyBzY3JpcHRQYXRoID0gcGF0aC5qb2luKGAke2NvbmZpZ0luc3RhbmNlLnJvb3RQYXRofWAsIGBzY3JpcHRgLCBgJHtzY3JpcHRDb25maWcua2V5fWApIC8vIC5qcyBmaWxlIG9yIGZvbGRlciBtb2R1bGUuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTG9hZCB0aGUgbW9kdWxlIHdpdGggdGhlIG1hdGNoaW5nIG5hbWUgKGVpdGhlciBhIGZvbGRlciBtb2R1bGUgb3IgZmlsZSB3aXRoIGpzIGV4dGVuc2lvbilcbiAgICAgIC8vIGdldCBzcGVjaWZpYyBlbnRyeXBvaW50IGNvbmZpZ3VyYXRpb24gb3B0aW9uIChlbnRyeXBvaW50LmNvbmZpZ0tleSlcbiAgICAgIHNjcmlwdENvbmZpZyA9IHNjcmlwdEZpbGVDb25maWdBcnJheS5maW5kKHNjcmlwdE9iamVjdCA9PiBzY3JpcHRPYmplY3Qua2V5ID09IHNjcmlwdEtleVRvSW52b2tlKVxuXG4gICAgICAvLyBmbGF0dGVuIHN0cnVjdHVyZSBvZiBhcnJheSBvZiBvYmplY3RzIHRvIGFycmF5IG9mIHN0cmluZ3MvcGF0aHNcbiAgICAgIHNjcmlwdERpcmVjdG9yeVBhdGhBcnJheSA9IHNjcmlwdFxuICAgICAgICAuZmlsdGVyKHNjcmlwdE9iamVjdCA9PiBzY3JpcHRPYmplY3QudHlwZSA9PSAnZGlyZWN0b3J5JylcbiAgICAgICAgLnJlZHVjZSgoYWNjdW11bGF0b3IsIGN1cnJlbnRWYWx1ZSkgPT4ge1xuICAgICAgICAgIGFjY3VtdWxhdG9yLnB1c2goY3VycmVudFZhbHVlLnBhdGgpXG4gICAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yXG4gICAgICAgIH0sIFtdKVxuICAgICAgLy8gY2hhbmdlIHJlbGF0aXZlIHBhdGggdG8gYWJzb2x1dGVcbiAgICAgIGZvciAobGV0IGluZGV4IGluIHNjcmlwdERpcmVjdG9yeVBhdGhBcnJheSkge1xuICAgICAgICBzY3JpcHREaXJlY3RvcnlQYXRoQXJyYXlbaW5kZXhdID0gcmVzb2x2ZUNvbmZpZ09wdGlvblRvQWJzb2x1dGVQYXRoKHsgb3B0aW9uUGF0aDogc2NyaXB0RGlyZWN0b3J5UGF0aEFycmF5W2luZGV4XSwgcm9vdFBhdGg6IHByb2plY3RSb290UGF0aCB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIXNjcmlwdEtleVRvSW52b2tlKSB7XG4gICAgICAgIC8vIGlmIG5vIGFyZ3VtZW50cyBzdXBwbGllZCwgZmFsbGJhY2sgdG8gZGVmYXVsdCBjb21tYW5kLlxuICAgICAgICBjb25zb2xlLmxvZygn4oCiIE5vIGNvbW1hbmQgYXJndW1lbnQgcGFzc2VkLiBQbGVhc2UgY2hvb3NlIGEgc2NyaXB0OicpXG4gICAgICAgIGlmIChzY3JpcHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHNjcmlwdClcbiAgICAgICAgICBsZXQgc2NyaXB0SW5EaXJlY3RvcnkgPSBsaXN0Q29udGVudCh7IGRpcjogc2NyaXB0RGlyZWN0b3J5UGF0aEFycmF5LCByZWN1cnNpdmU6IGZhbHNlIH0pXG4gICAgICAgICAgaWYgKHNjcmlwdEluRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXFxuIE9yIFxcbmApXG4gICAgICAgICAgICBzY3JpcHRJbkRpcmVjdG9yeVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg4oCiIFRoZXJlIGFyZSBubyBzY3JpcHQgb3B0aW9ucywgdGhlIGFycmF5IGlzIGVtcHR5LiBBZGQgc2NyaXB0cyB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlcy5gKVxuICAgICAgICB9XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXNjcmlwdENvbmZpZylcbiAgICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShzY3JpcHRLZXlUb0ludm9rZSkpIHNjcmlwdENvbmZpZyA9IHsgcGF0aDogc2NyaXB0S2V5VG9JbnZva2UgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBjaGVjayBzY3JpcHQgaW4gZGlyZWN0b3JpZXMgKGBzY3JpcHRDb25maWcudHlwZSA9PSAnZGlyZWN0b3J5JyBjb25maWd1cmF0aW9uKVxuICAgICAgICAgIGxldCBjb250aW51ZUxvb3AgPSB0cnVlXG4gICAgICAgICAgd2hpbGUgKGNvbnRpbnVlTG9vcCAmJiBzY3JpcHREaXJlY3RvcnlQYXRoQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHNjcmlwdERpcmVjdG9yeVBhdGggPSBzY3JpcHREaXJlY3RvcnlQYXRoQXJyYXkucG9wKClcbiAgICAgICAgICAgIGxldCBzY3JpcHRQYXRoID0gcGF0aC5qb2luKHNjcmlwdERpcmVjdG9yeVBhdGgsIGAke3NjcmlwdEtleVRvSW52b2tlfWApIC8vIHRoZSBzcGVjaWZpYyBtb2R1bGUgdG8gcnVuLlxuICAgICAgICAgICAgLy8gTG9hZCB0aGUgbW9kdWxlIHdpdGggdGhlIG1hdGNoaW5nIG5hbWUgKGVpdGhlciBhIGZvbGRlciBtb2R1bGUgb3IgZmlsZSB3aXRoIGpzIGV4dGVuc2lvbilcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHJlcXVpcmUucmVzb2x2ZShzY3JpcHRQYXRoKVxuICAgICAgICAgICAgICAvLyBpbiBjYXNlIHJlc29sdmVkIGFuZCBmb3VuZDpcbiAgICAgICAgICAgICAgY29udGludWVMb29wID0gZmFsc2VcbiAgICAgICAgICAgICAgc2NyaXB0Q29uZmlnID0geyBwYXRoOiBzY3JpcHRQYXRoIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIC8vIHNraXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBpZiBubyBwYXRoIHdhcyBmb3VuZFxuICAgICAgICAgIC8vIFJ1biBzY3JpcHRzIGZyb20gbW9kdWxlcyBieSB1c2luZyBhIHNpbWlsYXIgbW9kdWxlIHJlc29sdmluZyBhbGdvcml0aG0gb2YgYHBhdGgucmVzb2x2ZSgpYCwgd2hlcmU6XG4gICAgICAgICAgLy8gLSBgeWFybiBydW4gc2NyaXB0TWFuYWdlciAuL3gveS9tb2R1bGVaIFwiLmZ1bmN0aW9uWSgpXCJgIHdpbGwgbG9hZCB0aGUgc2NyaXB0IGZyb20gcmVsYXRpdmUgcGF0aFxuICAgICAgICAgIC8vIC0gc2ltaWxhciB0byBwcmV2aW91cyBvbmx5IHVzaW5nIGFic29sdXRlIHBhdGguXG4gICAgICAgICAgLy8gLS0+IGB5YXJuIHJ1biBzY3JpcHRNYW5hZ2VyIEBkZXBlbmRlbmN5L21vZHVsZVogXCIuZnVuY3Rpb25ZKClcImAgd2lsbCBhY3R1YWxseSBzZWFyY2ggZm9yIHRoZSBzY3JpcHQgYXMgaWYgaXQgaXMgYSBub2RlX21vZHVsZXMgbW9kdWxlYCB3aWxsIGxvYWQgdGhlIHNjcmlwdCBmcm9tIHJlbGF0aXZlIHBhdGhcbiAgICAgICAgICBpZiAoY29udGludWVMb29wKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyB0cnkgcmVzb2x2aW5nIHRoZSBzY3JpcHQgdXNpbmcgcmVxdWlyZSBhbGdvcml0aG0gZnJvbSB0aGUgcHJvamVjdCByb290IGRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgbGV0IHNjcmlwdFBhdGggPSByZXF1aXJlLnJlc29sdmUoc2NyaXB0S2V5VG9JbnZva2UsIHsgcGF0aHM6IFtwcm9qZWN0Um9vdFBhdGgsIHByb2Nlc3MuY3dkKCldIH0pXG4gICAgICAgICAgICAgIHNjcmlwdENvbmZpZyA9IHsgcGF0aDogc2NyaXB0UGF0aCB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAvLyBza2lwXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDigKIgRmFpbGVkIHNlYXJjaCBmb3I6ICR7c2NyaXB0S2V5VG9JbnZva2V9YClcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgYnJlYWtcbiAgfVxuXG4gIGlmICghc2NyaXB0Q29uZmlnKSB7XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IGDinYwgUmVhY2hlZCBzd2l0Y2ggZGVmYXVsdCBhcyBzY3JpcHRLZXlUb0ludm9rZSBcIiR7c2NyaXB0S2V5VG9JbnZva2V9XCIgZG9lcyBub3QgbWF0Y2ggYW55IG9wdGlvbi5gXG4gICAgbGV0IHNjcmlwdExpc3RNZXNzYWdlID0gYHNjcmlwdExpc3Q6IFxcbiAke3V0aWwuaW5zcGVjdChzY3JpcHQsIHsgY29sb3JzOiB0cnVlLCBjb21wYWN0OiBmYWxzZSB9KX1gIC8vIGxvZyBhdmFpbGFibGUgc2NyaXB0c1xuICAgIHRocm93IG5ldyBFcnJvcihgXFx4MWJbNDFtJHtlcnJvck1lc3NhZ2V9XFx4MWJbMG0gXFxuICR7c2NyaXB0TGlzdE1lc3NhZ2V9YClcbiAgfVxuXG4gIHJldHVybiBzY3JpcHRDb25maWdcbn1cbiJdfQ==