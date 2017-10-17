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
  const extractedPromises: Array<Promise<any>> = [];
  // Loop over the folders
  foldersMap.forEach(async (files: string[], folder: string) => {
    // Loop over the single files and collect the "extract" Promises
    const filesPromiseArr: Array<Promise<fileDataObject>> = files.map((file: string) => {
      return extract(folder, file);
    });
    // Create a big promise from the single file promises and push it into the main
    // extractedPromises, also push the filesArray of a folder, once resolved, to the map
    extractedPromises.push(Promise.all(filesPromiseArr)
      .then((filesArr: Array<fileDataObject>) => {
        extractedFoldersMap.set(folder, filesArr);
      })
    ); // eslint-disable-line
  });
  // Wait for all the extractions to happen
  await Promise.all(extractedPromises);
  // 3. WRITE THE DOCS
  extractedFoldersMap.forEach((fileDataArr: Array<fileDataObject>, folder: string) => {
    // Write each single file
    fileDataArr.forEach(fileObj => {
      writeFile(fileObj.componentsArray, fileObj.file);
    });
    // Write "folder" files
    const folderComponents = fileDataArr.reduce((arr: componentObject[], o: fileDataObject) => {
      o.componentsArray.forEach((comp: componentObject) => arr.push(comp));
      return arr;
    }, []);
    writeFile(folderComponents, folder);
  });
  // Write Index and Sidebar
  writeIndex(extractedFoldersMap);
  writeSideBar(extractedFoldersMap);
}

module.exports = start;
