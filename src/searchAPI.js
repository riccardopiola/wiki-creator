// @flow
const fse = require('fs-extra');
const settings = require('./getSettings').getSettings();

const uselessFolders = ['node_modules'];

async function searchAPI(): Promise<Map<string, string[]>> {
  const itemsArray: string[] = await fse.readdir(settings.modulePath)
    .catch(e => {
      console.error(e);
      throw new Error('Module folder not found: check your modulePath variable in .wikiconfig.json');
    });
  // Create the map that will store every file and folder
  const filesMap: Map<string, string[]> = new Map();
  // Set the foles in the root folder
  filesMap.set(
    '_root',
    itemsArray.filter((file: string) => /.js|.jsx$/.test(file) && !settings.exclude.includes(file))
  );
  // Find the folders we care about
  const foldersArray = itemsArray.filter((item: string) => !item.includes('.') && !uselessFolders.includes(item));
  // Populate the Map with the folders and the files inside
  // The promises are just for timing
  const promises = foldersArray.reduce((promiseArr: Array<Promise<string[]>>, folder: string) => {
    filesMap.set(folder, []);
    promiseArr.push(fse.readdir(`${settings.modulePath}/${folder}`)
      .then((files: string[]) => {
        filesMap.set(
          folder,
          files.filter((file: string) => {
            if (!settings.exclude.includes(`${folder}/${file}`) && /.js|.jsx$/.test(file))
              return true;
            return false;
          })
        );
      })
      .catch(e => console.error(e))
    ); // eslint-disable-line
    return promiseArr;
  }, []);
  // Wait for all the fs.readdir to finish
  await promises;
  // Return the Populated Map
  return filesMap;
}

module.exports = searchAPI;
