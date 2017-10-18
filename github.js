const child_process = require('child_process');
const settings = require('./lib/getSettings').getSettings();

async function upload() {
  await commandExecutor('git add .');
  await commandExecutor('git commit --quiet --allow-empty-message');
  await commandExecutor('git push');
  return console.log('Successfully updated gihub wiki repo');
}

function commandExecutor(command) {
  return new Promise((resolve) => {
    const options = {
      cwd: `${process.cwd()}/${settings.wikiPath}`
    };
    child_process.exec(command, options, (error, stdout, stderr) => {
      if (error)
        throw error;
      else if (stderr)
        throw stderr;
      else {
        if (stdout)
          console.log(stdout);
        resolve();
      }
    });
  });
}

module.exports = upload;
