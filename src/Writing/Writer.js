import type { ObjectType as componentObject } from '../Parsing/ObjectCreator';

const fs = require('fs');
const fse = require('fs-extra');
const readline = require('readline');
const path = require('path');

const settings = require('../getSettings').getSettings();

type Prop = {
  propName: string,
  propType: string,
  propDesc: string
} | {
  section: string
}

class Writer {
  outStream: any
  rl: any
  component: componentObject
  constructor(component: componentObject, file: string, outStream?: any) {
    this.component = component;
    if (outStream)
      this.outStream = outStream;
    else
      this.outStream = fs.createWriteStream(`${settings.wikiPath}/${component.title}.md`);
    // See if there is a custom Markdown file and create the inStream
    let inPath;
    if (fse.pathExistsSync(`${settings.customWikiPagesPath}/${file}.md`))
      inPath = `${settings.customWikiPagesPath}/${file}.md`;
    else
      inPath = path.join(__dirname, '..', 'Templates/Standard.md');
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
        case 'NAME':
          return this.component.name;
        case 'DESCRIPTION':
          return this.component.description.join(' ');
        case 'PROPS':
          return this.stringifyProps();
        case 'END':
          return '***';
        default:
          console.error(`cannot find ${p1}`);
      }
    });
    this.outStream.write(`${newLine}\n`, 'utf-8');
  }
  stringifyProps() {
    const propString = '- **$PROP_NAME**: `$PROP_TYPE` $PROP_DESC';
    const propsArr = this.component.props;
    return propsArr.reduce((str: string, propObj: Prop, i: number) => {
      if (propObj.section)
        return `${str + propObj.section}\n`;
      let propLine = propString
        .replace('$PROP_NAME', propObj.propName)
        .replace('$PROP_TYPE', propObj.propType)
        .replace('$PROP_DESC', propObj.propDesc);
      if (propsArr[i + 1]) {
        if (propsArr[i + 1].section)
          propLine = `${propLine}\n`;
      }
      return `${str + propLine}\n`;
    }, '');
  }
}

module.exports = Writer;
