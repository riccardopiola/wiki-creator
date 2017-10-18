// @flow
const fse = require('fs-extra');

type Settings = {
  modulePath: string,
  wikiPath: string,
  customWikiPagesPath: string,
  wikiURL: string,
  HomePage: {
    homePageName: string
  },
  SideBar: {
    writeSideBar: boolean
  },
  topPageIndexes: {
    writeIndexIfNComponents: number
  },
  exclude: string[]
}

const baseSettings = {
  modulePath: 'API',
  wikiPath: 'wiki/out',
  customWikiPagesPath: 'wiki',
  wikiURL: '',
  HomePage: {
    homePageName: 'Index'
  },
  SideBar: {
    writeSideBar: true
  },
  topPageIndexes: {
    writeIndexIfNComponents: 3
  },
  exclude: []
};

function getSettings(): Settings {
  try {
    const rawData = fse.readFileSync(`${process.cwd()}/.wikiconfig.json`, 'utf-8');
    return JSON.parse(rawData);
  } catch (e) {
    console.error(`${e.message}\n CANNOT FIND .wikiconfig.json, using base settings`);
    return baseSettings;
  }
}

module.exports = {
  getSettings
};
