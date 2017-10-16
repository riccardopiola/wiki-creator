const fse = require('fs-extra');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const settings = require(`${process.cwd()}/react-wikipage-creator.config.json`);
const { wikiPath, wikiURL, customWikiPagesPath } = settings;

function readWriteFile(outPath, inPath, keyword, writeFunc) {
  return new Promise((resolve, reject) => {
    if (!fse.pathExistsSync(inPath))
      inPath = path.join(__dirname, 'standardMD/Index.md');
    const outStream = fs.createWriteStream(outPath);
    const rl = readline.createInterface({
      input: fs.createReadStream(inPath),
      output: outStream
    });
    rl.on('line', (line) => {
      let newLine;
      if (/\$\{(\w*)\}/.test(line)) {
        newLine = line.replace(/\$\{(\w*)\}/, (match, p1) => {
          if (p1 === keyword)
            return writeFunc();
          else
            return line + '\n';
        });
      } else {
        newLine = line + '\n';
      }
      outStream.write(newLine);
    });
    rl.on('close', () => {
      outStream.close();
      resolve();
    });
  });
}

function writeIndex(componentsMatrix, sectionsArray) {
  const indexString = sectionsArray.reduce((str, section, i) => {
    return str + composeIndexModified(componentsMatrix[i].componentsArray, section);
  }, '');
  if (!settings.indexName)
    throw new Error('settings.indexName must be defined in react-wikipage-creator.config.json');
  return readWriteFile(`${wikiPath}/${settings.indexName}.md`, `${customWikiPagesPath}/${settings.indexName}.md`, 'INDEX', () => indexString);
}

function writeSideBar(componentsMatrix, sectionsArray) {
  const sideBarString = sectionsArray.reduce((str, section, i) => {
    return str + composeIndexModified(componentsMatrix[i].componentsArray, section);
  }, '');
  return readWriteFile(`${wikiPath}/_SideBar.md`, `${customWikiPagesPath}/_SideBar.md`, 'INDEX', () => sideBarString);
}

function composeIndexModified(componentsArray, section) {
  const list = componentsArray.reduce((str, component) => {
    const link = `${wikiURL}/${component.file}#${component.name}`;
    return str + `- [${component.name}](${link})` + '\n';
  }, '');
  return [
    `## [${section}](${wikiURL}/${section})`,
    list,
    '***\n'
  ].join('\n');
}

module.exports = { writeIndex, writeSideBar };