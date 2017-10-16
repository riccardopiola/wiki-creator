const extractor = require('./Extractor');
const writer = require('./Writer');

const settings = require(`${process.cwd()}/react-wikipage-creator.config.json`);
const { modulePath, wikiPath, customWikiPagesPath } = settings;

async function processFile(folderName, fileNameJS) {
  const filePath = `${modulePath}/${folderName}/${fileNameJS}`;
  const fileName = fileNameJS.substr(0, fileNameJS.length - 3);
  const componentsArray = await extractor(folderName, filePath, fileName);
  console.log('Extracting from ' + filePath);
  await writer(componentsArray, fileName);
  return componentsArray;
}

module.exports = processFile;