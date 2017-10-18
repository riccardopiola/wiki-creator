// 

const readline = require('readline');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const settings = require('../getSettings').getSettings();


class IndexWriter {
  constructor(fileName, foldersMap) {
    let inPath = path.join(__dirname, '..', 'Templates/Index.md');
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
  start(callback) {
    this.rl.on('line', (line) => {
      if (/\$\{(\w*)\}/.test(line))
        this.replaceLine(line);
      else
        this.outStream.write(`${line}\n`, 'utf-8');
    });
    this.rl.on('close', () => {
      this.outStream.end();
      if (callback)
        callback();
    });
  }
  replaceLine(line) {
    const newLine = line.replace(/\$\{(\w*)\}/, (match, p1) => {
      switch (p1) {
        case 'INDEX':
          return this.writeIndex();
        default: {
          console.error(`cannot find ${p1}`);
          return match;
        }
      }
    });
    this.outStream.write(`${newLine}\n`, 'utf-8');
  }
  writeIndex() {
    let data = '';
    this.foldersMap.forEach((fileDataArr, folder) => {
      const list = fileDataArr.reduce((str, dataObj) => {
        let newStr = '';
        dataObj.componentsArray.forEach((comp) => {
          const link = `${settings.wikiURL}/${dataObj.file}#${comp.title}-`;
          newStr = `${str}\t- [${comp.title}](${link})\n`;
        });
        return newStr;
      }, '');
      const index = [
        `- [${folder}](${settings.wikiPath}/${folder})`,
        list,
      ].join('\n');
      data += index;
    });
    return data;
  }
}

module.exports = IndexWriter;
