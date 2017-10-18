import type { ObjectType as componentObject } from '../Parsing/ObjectCreator';

const readline = require('readline');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const settings = require('../getSettings').getSettings();

type fileDataObject = {
  file: string,
  componentsArray: componentObject[]
}

class IndexWriter {
  outStream: any
  rl: any
  foldersMap: Map<string, Array<fileDataObject>>
  constructor(fileName: string, foldersMap: Map<string, Array<fileDataObject>>) {
    let inPath = `${settings.customWikiPagesPath}/${fileName}.md`;
    if (fse.pathExistsSync(`${settings.customWikiPagesPath}/${fileName}.md`))
      inPath = inPath = path.join(__dirname, '..', 'Templates/Index.md');
    this.foldersMap = foldersMap;
    this.outStream = fs.createWriteStream(`${settings.wikiPath}/${fileName}.md`);
    const inStream = fs.createReadStream(inPath);
    this.rl = readline.createInterface({
      input: inStream,
      output: this.outStream
    });
  }
  start(callback: () => void) {
    this.rl.on('line', (line: string) => {
      if (/\$\{(\w*)\}/.test(line))
        this.replaceLine(line);
      else
        this.outStream.write(`${line}\n`, 'utf-8');
    });
    this.rl.on('close', () => {
      callback();
    });
  }
  replaceLine(line: string) {
    const newLine = line.replace(/\$\{(\w*)\}/, (match: any, p1: string) => {
      switch (p1) {
        case 'INDEX':
          return this.writeIndex();
        default:
          console.error(`cannot find ${p1}`);
      }
    });
    this.outStream.write(`${newLine}\n`, 'utf-8');
  }
  writeIndex(): string {
    let data: string = '';
    this.foldersMap.forEach((fileDataArr: fileDataObject[], folder: string) => {
      data += this.composeIndexModified(fileDataArr, folder);
    });
    return data;
  }
  static composeIndexModified(fileDataArr: fileDataObject[], folder: string): string {
    const list = fileDataArr.reduce((str: string, dataObj: fileDataObject) => {
      let newStr: string = '';
      dataObj.componentsArray.forEach((comp: componentObject) => {
        const link = `${settings.wikiURL}/${dataObj.file}#${comp.title}-`;
        newStr = `\t${str}- [${comp.title}](${link})\n`;
      });
      return newStr;
    }, '');
    return [
      `- [${folder}](${settings.wikiPath}/${folder})`,
      list,
    ].join('\n');
  }
}

module.exports = IndexWriter;
