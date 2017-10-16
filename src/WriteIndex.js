const fse = require('fs-extra');

const settings = require(`${process.cwd()}/wiki-creator.config.json`);
const { wikiPath, wikiURL } = settings;

function writeIndex(componentsMatrix, sectionsArray) {
  const fileData = sectionsArray.reduce((str, section, i) => {
    return str + composeIndexModified(componentsMatrix[i].componentsArray, section);
  });
  return fse.writeFile(`${wikiPath}/Index.md`, fileData);
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

module.exports = writeIndex;