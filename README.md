# Wiki Creator v0.1.0

`npm install --save-dev wiki-creator`;

## Config

Create a file: `wiki-creator.config.json` at the root of your project

- ***modulePath***: `path`
Path to the API that you want to create a wiki from
- ***wikiPath***:  `path`
Folder where you want to put your wiki
- ***customWikiPagesPath***: `path`
Folder with the CustomWikiPages
- ***writeIndexIfNComponents***: `0 | number`
Minimum number of components needed in a single page to write an index at the start. If you want to disable this feature 
- ***wikiURL***: `URL`
The URL for the links in the index
