const fse = require('fs-extra');

const write = require('./src/Writer');
const writeIndex = require('./src/WriteIndex');
const processFile = require('./src/processFile');

const settings = require(`${process.cwd()}/wiki-creator.config.json`);
const { modulePath, wikiPath, customWikiPagesPath, useCustomWikiPages } = settings;

const uselessFolders = [
  'node_modules'
];

async function start() {
  // Read files and folders
  const foldersArray = await fse.readdir(modulePath);
  // Eliminate files, we need folders
  const filteredFoldersArray = foldersArray.filter(item => {
    if (item.includes('.'))
      return false;
    else if (uselessFolders.includes(item))
      return false;
    return true;
  });
  // Create a Matrix with = [ [...files], [...files]]
  const filesMatrix = await Promise.all(filteredFoldersArray.map((dir) => fse.readdir(`${modulePath}/${dir}`)));
  // Create a big promise array of all the files
  // Start the chain for each file
  const promiseObj = filesMatrix.reduce(({ sectionsArray, promiseArr }, files, i) => {
    files.forEach(file => {
      if (file === 'index.js')
        return;
      promiseArr.push(processFile(
        filteredFoldersArray[i], // folderName
        file, // file
      ));
    })
    sectionsArray.push(Promise.all(promiseArr)
      .then(componentsMatrix => { // componentsMatrix: [ [...component ] ]
        const componentsArray = componentsMatrix.reduce((bigArr, arr) => {
          arr.forEach(component => bigArr.push(component));
          return bigArr;
        }, []);
        return write(componentsArray, filteredFoldersArray[i]); // Write the big file for each folder
      })
      .then((componentsArray, section) => {
        return { componentsArray, section };
      })
      .catch(e => console.error(e))
    );
    return { sectionsArray, promiseArr };
  }, { sectionsArray: [], promiseArr: [] });

  const sections = await Promise.all(promiseObj.sectionsArray);
  const writeIndexPromise = writeIndex(sections, filteredFoldersArray)
    .then(() => console.log('Wrote Index'))
    .catch(e => console.error(e));
  await Promise.all([ writeIndexPromise ]);
  console.log('SUCCESSFULLY WROTE THE WIKI!!');
}

module.exports = start;
