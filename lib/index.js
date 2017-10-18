// 

const searchAPI = require('./searchAPI');
const extract = require('./Parsing/extract');
const { writeFile, writeIndex, writeSideBar } = require('./Writing/write');


async function start() {
  // 1. FIND THE INTERESTING FILES
  const foldersMap = await searchAPI(); // Map<folderName, [...files]
  // 2. EXTRACT THE DATA FROM EACH FILE
  const extractedFoldersMap = new Map();
  const promises = [];
  // Loop over the folders
  foldersMap.forEach(async (files, folder) => {
    // Loop over the single files and collect the "extract" Promises
    const filesPromiseArr = files.map((file) => {
      return extract(folder, file);
    });
    // Create a big promise from the single file promises and push it into the main
    // extractedPromises, also push the filesArray of a folder, once resolved, to the map
    promises.push(Promise.all(filesPromiseArr)
      .then((filesArr) => {
        extractedFoldersMap.set(folder, filesArr);
      })
    ); // eslint-disable-line
  });
  // Wait for all the extractions to happen
  await Promise.all(promises);
  // 3. WRITE THE DOCS
  extractedFoldersMap.forEach((fileDataArr, folder) => {
    // Write each single file
    fileDataArr.forEach(fileObj => {
      promises.push(writeFile(fileObj.componentsArray, fileObj.file));
    });
    // Write "folder" files
    const folderComponents = fileDataArr.reduce((arr, o) => {
      o.componentsArray.forEach((comp) => arr.push(comp));
      return arr;
    }, []);
    promises.push(writeFile(folderComponents, folder));
  });
  // Write Index and Sidebar
  promises.push(writeIndex(extractedFoldersMap));
  promises.push(writeSideBar(extractedFoldersMap));
  return Promise.all(promises);
}

module.exports = start;
