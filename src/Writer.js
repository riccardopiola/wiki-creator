const fs = require('fs');
const fse = require('fs-extra');
const readline = require('readline');
const path = require('path');

const cwd = process.cwd();
const settings = require(`${cwd}/react-wikipage-creator.config.json`);
const { wikiURL, wikiPath, useCustomWikiPages, customWikiPagesPath } = settings;

function write(componentsArray, fileName) {
  return new Promise((resolve, reject) => {
    let writeIndex = false;
    let customPath = path.join(__dirname ,'standardMD/Standard.md');
    if (fse.pathExistsSync(`${customWikiPagesPath}/${fileName}.md`))
      customPath = `${customWikiPagesPath}/${fileName}.md`;
    // Decide whether to write the index
    if (settings.writeIndexIfNComponents)
      if (componentsArray.length >= settings.writeIndexIfNComponents)
        writeIndex = true;
    const outStream = fs.createWriteStream(`${wikiPath}/${fileName}.md`)
    componentsArray.forEach((component, i) => {
      const { name, folder, props, description } = component;
      const rl = readline.createInterface({
        input: fs.createReadStream(customPath),
        output: outStream
      });
      if (writeIndex) {
        writeIndex = false;
        outStream.write(composeIndex(componentsArray));
      }
      rl.on('line', (line) => {
        if (/\$\{(\w*)\}/.test(line)) {
          const newLine = line.replace(/\$\{(\w*)\}/, (match, p1) => {
            switch(p1) {
              case 'NAME':
                return name;
              case 'DESCRIPTION':
                return description.join(' ');
              case 'PROPS':
                return stringifyProps(props);
              case 'END':
                return '***';
              default:
                console.error('cannot find' + p1);
            }
          });
          outStream.write(newLine + '\n', 'utf-8');
        } else {
          outStream.write(line + '\n', 'utf-8');
        }
      })
      rl.on('close', () => {
        if (componentsArray.length === i + 1) {
          outStream.end();
          console.log(`Wrote ${wikiPath}/${fileName}.md`);
          resolve(componentsArray, fileName);
        }
      });
    });
  });
}

function composeIndex(componentsArray) {
  const list = componentsArray.reduce((str, component) => {
    const link = `${wikiURL}/${component.file}#${component.name}-`;
    return str + `- [${component.name}](${link})` + '\n';
  }, '');
  return [
    '## Index',
    list,
    '***\n'
  ].join('\n');
}

function stringifyProps(props) {
  const propSectionString = '';
  const propString = '- **$PROP_NAME**: `$PROP_TYPE` $PROP_DESC';
  return props.reduce((str, propObj, i) => {
    if (propObj.section)
      return str + propObj.section + '\n';
    let propLine = propString
      .replace('$PROP_NAME', propObj.propName)
      .replace('$PROP_TYPE', propObj.propType)
      .replace('$PROP_DESC', propObj.propDesc);
    if (props[i + 1]) {
      if (props[i + 1].section)
        propLine = propLine + '\n';
    }
      propLine = propLine + '\n';
    return str + propLine + '\n';
  }, '');
}

module.exports = write;