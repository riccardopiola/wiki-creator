const child_process = require('child_process');

async function upload() {
  await commandExecutor('git add .');
  await commandExecutor('git commit --quiet --allow-empty-message');
  await commandExecutor('git push');
  return console.log('Successfully updated gihub wiki repo');
}

function commandExecutor(command) {
  return new Promise((resolve) => {
    child_process.exec(command, (error, stdout, stderr) => {
      if (error)
        console.error(error);
      else if (stderr)
        console.error(stderr);
      else {
        if (stdout)
          console.log(stdout);
        resolve();
      }
    });
  });
}

module.exports = upload;
