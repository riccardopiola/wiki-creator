// 

const fs = require('fs');

const settings = require('../getSettings').getSettings();
const Writer = require('./Writer');
const IndexWriter = require('./IndexWriter');

function writeFile(componentsArray, fileName) {
  return new Promise((resolve) => {
    const outStream = fs.createWriteStream(`${settings.wikiPath}/${fileName}.md`);
    // Decide whether to write the index
    if (settings.writeIndexIfNComponents) {
      if (componentsArray.length >= settings.writeIndexIfNComponents)
        outStream.write(composeIndex(componentsArray, fileName));
    }
    componentsArray.forEach((component, i) => {
      const writer = new Writer(component, fileName, outStream);
      writer.start(() => {
        if (componentsArray.length === i + 1) {
          outStream.end();
          console.log(`Wrote ${settings.wikiPath}/${fileName}.md`);
          resolve();
        }
      });
    });
  });
}


function writeIndex(foldersMap) {
  const fileName = settings.HomePage.homePageName;
  const indexWriter = new IndexWriter(fileName, foldersMap);
  indexWriter.start();
}

function writeSideBar(foldersMap) {
  const fileName = '_SideBar';
  const indexWriter = new IndexWriter(fileName, foldersMap);
  indexWriter.start();
}

function composeIndex(componentsArray, file) {
  const list = componentsArray.reduce((str, component) => {
    const link = `${settings.wikiURL}/${file}#${component.title}-`;
    return `${str}- [${component.title}](${link})\n`;
  }, '');
  return [
    '## Index',
    list,
    '***\n'
  ].join('\n');
}

module.exports = { writeFile, writeIndex, writeSideBar };
