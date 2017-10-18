// 

const searchAPI = require('./searchAPI');
const extract = require('./Parsing/extract');
const { writeFile, writeIndex, writeSideBar } = require('./Writing/write');


async function start() {
  // 1. FIND THE INTERESTING FILES
  const foldersMap = await searchAPI(); // Map<folderName, [...files]
  // 2. EXTRACT THE DATA FROM EACH FILE
  const extractedFoldersMap = new Map();
  const extractedPromises = [];
  // Loop over the folders
  foldersMap.forEach(async (files, folder) => {
    // Loop over the single files and collect the "extract" Promises
    const filesPromiseArr = files.map((file) => {
      return extract(folder, file);
    });
    // Create a big promise from the single file promises and push it into the main
    // extractedPromises, also push the filesArray of a folder, once resolved, to the map
    extractedPromises.push(Promise.all(filesPromiseArr)
      .then((filesArr) => {
        extractedFoldersMap.set(folder, filesArr);
      })
    ); // eslint-disable-line
  });
  // Wait for all the extractions to happen
  await Promise.all(extractedPromises);
  // 3. WRITE THE DOCS
  extractedFoldersMap.forEach((fileDataArr, folder) => {
    // Write each single file
    fileDataArr.forEach(fileObj => {
      writeFile(fileObj.componentsArray, fileObj.file);
    });
    // Write "folder" files
    const folderComponents = fileDataArr.reduce((arr, o) => {
      o.componentsArray.forEach((comp) => arr.push(comp));
      return arr;
    }, []);
    writeFile(folderComponents, folder);
  });
  // Write Index and Sidebar
  writeIndex(extractedFoldersMap);
  writeSideBar(extractedFoldersMap);
}

module.exports = start;
