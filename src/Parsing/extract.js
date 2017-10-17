// @flow
import type { ObjectType as componentObject } from './ObjectCreator';

const fs = require('fs');
const readline = require('readline');

const settings = require('../getSettings').getSettings();
const Parser = require('./Parser');

/**
 * Function that extracts prop-types, description and title from React components
 * @param {string} folderName The name of the folder
 * @param {string} fileName The name of the file
 */
function extract(folderName: string, fileName: string): Promise<{
  file: string, componentsArray: componentObject[]
}> {
  const filePath = `${settings.modulePath}/${folderName}/${fileName}`;
  return new Promise((resolve) => {
    const parser = new Parser(filePath, fileName);
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    });
    rl.on('line', (line: string) => {
      parser.check(line);
    });
    rl.on('close', () => {
      resolve({
        file: fileName,
        componentsArray: parser.ObjectCreatorsArray.map(o => o.getObject())
      });
    });
  });
}

module.exports = extract;
