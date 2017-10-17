// @flow
const fse = require('fs-extra');

function getSettings() {
  return fse.readFile(`${process.cwd()}/.wikiconfig.json`, 'utf-8')
    .then((json) => JSON.parse(json))
    .catch(e => console.error(`${e.message}\n CANNOT FIND .wikiconfig.json, please provide a config file`));
}

module.exports = {
  getSettings
};
