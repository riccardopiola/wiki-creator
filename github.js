const child_process = require('child_process');

async function upload() {
  await processSpawner('git add .');
  
}

function processSpawner(command) {
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
