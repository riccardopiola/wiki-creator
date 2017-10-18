// @flow
import type { ObjectType as componentObject } from './Parsing/ObjectCreator';

const searchAPI = require('./searchAPI');
const extract = require('./Parsing/extract');
const { writeFile, writeIndex, writeSideBar } = require('./Writing/write');

type fileDataObject = {
  file: string,
  componentsArray: componentObject[]
}

async function start() {
  // 1. FIND THE INTERESTING FILES
  const foldersMap: Map<string, string[]> = await searchAPI(); // Map<folderName, [...files]
  // 2. EXTRACT THE DATA FROM EACH FILE
  const extractedFoldersMap: Map<string, Array<fileDataObject>> = new Map();
  const promises: Array<Promise<any>> = [];
  // Loop over the folders
  foldersMap.forEach(async (files: string[], folder: string) => {
    // Loop over the single files and collect the "extract" Promises
    const filesPromiseArr: Array<Promise<fileDataObject>> = files.map((file: string) => {
      return extract(folder, file);
    });
    // Create a big promise from the single file promises and push it into the main
    // extractedPromises, also push the filesArray of a folder, once resolved, to the map
    promises.push(Promise.all(filesPromiseArr)
      .then((filesArr: Array<fileDataObject>) => {
        extractedFoldersMap.set(folder, filesArr);
      })
    ); // eslint-disable-line
  });
  // Wait for all the extractions to happen
  await Promise.all(promises);
  // 3. WRITE THE DOCS
  extractedFoldersMap.forEach((fileDataArr: Array<fileDataObject>, folder: string) => {
    // Write each single file
    fileDataArr.forEach(fileObj => {
      promises.push(writeFile(fileObj.componentsArray, fileObj.file));
    });
    // Write "folder" files
    const folderComponents = fileDataArr.reduce((arr: componentObject[], o: fileDataObject) => {
      o.componentsArray.forEach((comp: componentObject) => arr.push(comp));
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
