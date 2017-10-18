// 

const fs = require('fs');
const readline = require('readline');

const settings = require('../getSettings').getSettings();
const Parser = require('./Parser');

/**
 * Function that extracts prop-types, description and title from React components
 * @param {string} folderName The name of the folder
 * @param {string} fileName The name of the file
 */
function extract(folderName, fileName) {
  const filePath = `${settings.modulePath}/${folderName}/${fileName}`;
  return new Promise((resolve) => {
    const parser = new Parser(filePath, fileName);
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    });
    rl.on('line', (line) => {
      parser.check(line);
    });
    rl.on('close', () => {
      resolve({
        file: fileName.substr(0, fileName.length - 3),
        componentsArray: parser.ObjectCreatorsArray.map(o => o.getObject())
      });
    });
  });
}

module.exports = extract;
