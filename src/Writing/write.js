// @flow
import type { ObjectType as componentObject } from '../Parsing/ObjectCreator';

const fs = require('fs');

const settings = require('../getSettings').getSettings();
const Writer = require('./Writer');
const IndexWriter = require('./IndexWriter');

function writeFile(componentsArray: componentObject[], fileName: string): Promise<any> {
  return new Promise((resolve) => {
    const outStream = fs.createWriteStream(`${settings.wikiPath}/${fileName}.md`);
    // Decide whether to write the index
    if (settings.writeIndexIfNComponents) {
      if (componentsArray.length >= settings.topPageIndexes.writeIndexIfNComponents)
        outStream.write(composeIndex(componentsArray, fileName));
    }
    componentsArray.forEach((component: componentObject, i: number) => {
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

type fileDataObject = {
  file: string,
  componentsArray: componentObject[]
}

function writeIndex(foldersMap: Map<string, Array<fileDataObject>>): Promise<any> {
  return new Promise((resolve) => {
    const fileName = settings.HomePage.homePageName;
    const indexWriter = new IndexWriter(fileName, foldersMap);
    indexWriter.start(() => {
      console.log(`Wrote ${settings.wikiPath}/${settings.HomePage.homePageName}.md`);
      resolve();
    });
  });
}

function writeSideBar(foldersMap: Map<string, Array<fileDataObject>>): Promise<any> {
  return new Promise((resolve) => {
    const fileName = '_SideBar';
    const indexWriter = new IndexWriter(fileName, foldersMap);
    indexWriter.start(() => {
      console.log(`Wrote ${settings.wikiPath}/_SideBar.md`);
      resolve();
    });
  });
}

function composeIndex(componentsArray: componentObject[], file: string): string {
  const list = componentsArray.reduce((str: string, component: componentObject) => {
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
