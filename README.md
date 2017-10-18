# Wiki Creator v0.1.0

`$ npm install --save-dev react-wikipage-creator`

`$ node_modules/.bin/react-webpage-creator`

A ruthlessly simple utility to generate Docs (in Markdown) from React components using Flow types

Extract a description of the component from the comments in src and the Props information from flow types

***_FROM:_***  `Footer.js`:

```javascript
// @flow
const React = require('react');
const { View, StyleSheet, Platform, TouchableNativeFeedback, TouchableOpacity, Text } = require('react-native');

const theme = require('../theme');

// @wiki
type FooterProps = {
  children: React.Node // ( FooterTab components for best results)
};

/** @wiki
 * title: Footer
 * Component that takes up the bottom part of the screen
 */
const Footer = (props: FooterProps) => (
  // Render code
);

// @wiki
type TabProps = {
  // Function
  onPress: () => void, // Callback function for when the tab is clicked, usually navigation.navigate('Somewhere')
  // Variables
  text?: string, // Text to be displayed in the tab
  icon?: React.Node, // Icon Element (or any element) to de displayed on top of the string text
  selected: boolean // Wether to turn on the 'selected' styles for the FooterTab
};

/** @wiki
 * title: FooterTab
 * Navigation Bottom Tab
 */
class FooterTab extends React.Component<TabProps> {
  render() {
    // Code here
  }
}
```

***_TO:_***  `Footer.md`:

## `<Footer />`

### ***_Description_***

Footer Component that takes up the bottom part of the screen

### ***_Available Props_***

- **children**: `React.Node` ( FooterTab components for best results)

***
## `<FooterTab />`

### ***_Description_***

FooterTab Navigation Bottom Tab

### ***_Available Props_***

Function
- **onPress**: `() => void` Callback function for when the tab is clicked, usually navigation.navigate('Somewhere')
Variables
- **text?**: `string` Text to be displayed in the tab
- **icon?**: `React.Node` Icon Element (or any element) to de displayed on top of the string text
- **selected**: `boolean` Wether to turn on the 'selected' styles for the FooterTab

***

## Prepare your source code

Add a @wiki line comment on top of your Props declaration, like in the example above

Add a @wiki block comment top of the component (class of const)
If you put `title: SomeComponentTitle` in the line immediately below the @wiki it is gonna use that title for the component
Otherwise it will get the component name from the actual variable
After that line you can write a description, you can split the description in as many lines as you want

Alternatively you can omit the `title: SomeComponentTitle` and start writing the description right away

## Setup

`$ npm install --save-dev react-wikipage-creator`;

Add this to your npm scripts

`$ node_modules/.bin/react-wikipage-creator`

If you also want your changes to be pushed to an existing github wiki repo also add `--upload` to the command

`$ node_modules/.bin/react-wikipage-creator --upload`

Create a file: `.wikiconfig.json` at the root of your project

your config file should look something like this:
```json
{
  "modulePath": "MyModule",
  "wikiPath": "wiki/out",
  "customWikiPagesPath": "wiki",
  "wikiURL": "https://github.com/riccardopiola/react-wikipage-creator/wiki",
  "HomePage": {
    "homePageName": "Index"
  },
  "Sidebar": {
    "writeSideBar": true
  },
  "topPageIndexes": {
    "writeIndexIfNComponents": 3
  },
  "exclude": [
    "Components/index.js",
    "Anatomy/index.js"
  ]
}
```
Those are all the available options:

- ***modulePath***: |`path`|
Path to the API that you want to create a wiki from
- ***wikiPath***:  |`path`| 
Folder where you want to put your wiki
- ***customWikiPagesPath***: |`path`|
Folder with the CustomWikiPages
- ***wikiURL***: |`URL`|
The URL for the links in the index
- ***HomePage***
  - ***homePageName***: |`string`|
  Name of the HomePage of the wiki (so you can get an index in there)
- ***Sidebar***
  - ***writeSideBar*** |`boolean`|
  If true write a _SideBar.md file that will be the Sidebar
- ***topPageIndexes***
  - ***writeIndexIfNComponents*** |`number`|
  Minimum number of components needed in a single page to write an index at the start. If you want to disable this feature
- ***exclude*** |`Array<string>`|
  The path (relative to the modulePath) of the file you don't want to check

NOTE: Remeber to create the folders too, your directory should look something like this:

NOTE2: All the paths (except exclude) are relative to where you launch the utility, if you launch it from the root of your project they will be relative from there (dont need to write ./)

```
.
├── package.json
├── wiki
|   ├── out
|   |   ├── AwesomeComponent.md (generated)
|   |   ├── Index.md (generated)
|   └── AwesomeComponent.md (optional)
|   └── Index.md (optional)
├── MyModule
|   ├── Components
|   |   ├── AwesomeComponent.js
```

The only folders you will actually have to create are the two you specified in the config file for "modulePath", "wikiPath", "customWikiPagesPath"

## Integrating the Generated markdown into existing markdown

#### Components

If you want to add other information to the markdown for a component besides the generated Props, Description and Title you can create a file with the same name as the source code file and put it in the customWikiPagesPath path specified in the config.

For example let's say we have a component called AwesomeComponent in the file $modulePath/Components/AwesomeComponent.js

you can create a file called AwesomeComponent.js and write your additional info, then specify where the program should insert the generated markdown, like this:

`AwesomeComponent.md`
```
## `<${NAME} />`

### ***_Description_***

${DESCRIPTION}

### ***_Additional_Info_***
Some additional text that is going to be displayed after the Description

### ***_Available Props_***

${PROPS}

${END}

```

as you can see from the above example the available variables are:

| Identifier     | Replacement             |
|----------------|-------------------------|
| ${NAME}        | The component's name    |
| ${DESCRIPTION} | Component's description |
| ${PROPS}       | Component's props       |
| ${END}         | A divider               |

If you want to edit the Standard layout you can go into the folder `node_modules/react-wikipage-creator/lib/Templates/` and edit the `Standard.md` markdown file

#### HomePage and _Sidebar customization

If you want to have an Index of all your pages in the HomePage or the Sidebar of the Wiki:

Example for changing the HomePage (its the same for the _Sidebar)
1. Specify the name of the HomePage in .wikiconfig.json (HomePage.homePageName parameter) and call it `"Home"` for example
2. Create a `Home.md` file in `$customWikiPagesPath` and write that file as a normal Markdown file
3. Insert somethere in `Home.md` the following line `${INDEX}`, it will replace that with the actual Summary of all the pages
4. Run the program

