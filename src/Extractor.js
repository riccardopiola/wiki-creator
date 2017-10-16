const fs = require('fs');
const readline = require('readline');

const ObjectCreator = require('./ObjectCreator');

// const wikiRegex = /^(\/\/)|(\/\*) @(?=wiki)/; // Used to find props
const propsStartRegex = /^type .*Props/;
const propsRegex = /^\s\s+/; // Props body (two or more spaces)
const propsSectionRegex = /^\s*\/\/\s*/; // Props section comment
const propsRegexEnd = /^\}/; // Props terminator

// const wikiRegex2 = /^\/\*\* @(?=wiki)/; // Used to find Component descriptions
const descriptionRegex = /^\s\*\s/; // ( *)
const descriptionRegexEnd = /^\s\*\// // Description terminator

function extract(folderName, filePath, fileName) {
  return new Promise((resolve, reject) => {
    let readingProps = false;
    let readingComponentTitle = false;
    let readingDesc = false;

    const ObjectCreatorsArr = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    });
    rl.on('line', function (line) {
    // QUICK CHECK
      if ((!readingDesc && !readingComponentTitle) && !readingProps) {
        if ((!line.startsWith('// @wiki') && !line.startsWith('/** @wiki')) && !propsStartRegex.test(line))
          return;
      }
      if (line.startsWith('// @wiki')) { // Start of props statement
        ObjectCreatorsArr.push(new ObjectCreator(folderName, fileName));
    // START OF PROPS SECTION
      } else if (propsStartRegex.test(line)) {
        readingProps = true;
      } else if (readingProps && propsSectionRegex.test(line)) { // Add a new prop section
        ObjectCreatorsArr[ObjectCreatorsArr.length - 1].addNewPropSection(line);
      } else if (readingProps && propsRegex.test(line)) { // Add a new prop
        ObjectCreatorsArr[ObjectCreatorsArr.length - 1].addNewProp(line);
      } else if (readingProps && propsRegexEnd.test(line)) { // End of props statement
        readingProps = false;
      } else if (readingProps) { // Error handling
        readingProps = false;
        console.error('Error: Did not detect end of propTypes for file ' + filePath);
    // END OF PROPS SECTION
    // START OF TITLE SECTION
      } else if (line.startsWith('/** @wiki')) { // Start of description statement
        readingComponentTitle = true;
      } else if (readingComponentTitle && descriptionRegex.test(line)) { // Read the component title
        ObjectCreatorsArr[ObjectCreatorsArr.length - 1].addComponentName(line);
        readingComponentTitle = false;
        readingDesc = true; // Start reading component description
    // END OF TITLE SECTION
    // START OF DESCRIPTION SECTION
      } else if (readingDesc && descriptionRegex.test(line)) { // Read the component description
        ObjectCreatorsArr[ObjectCreatorsArr.length - 1].addDescriptionLine(line);
      } else if (readingDesc && descriptionRegexEnd.test(line)) { // end component description
        readingDesc = false;
      } else if (readingComponentTitle || readingDesc) { //Error handling
        if (readingComponentTitle) {
          readingComponentTitle = false;
          console.error('Error: Problem with the Component Title, check' + filePath);
        }
        if (readingDesc) {
          readingDesc = false;
          console.error('Error: Problem with the Component Title, check' + filePath);
        }
      }
    // END OF DESCRIPTION SECTION
    });
  
    rl.on('close', function () {
      resolve(ObjectCreatorsArr.map(o => o.getObject()));
    });
  })
  
}

module.exports = extract;
