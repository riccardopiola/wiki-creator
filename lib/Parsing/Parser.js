// 
const ObjectCreator = require('./ObjectCreator');

class Parser {
  // Read line after
  // Continuous reading
  // Type of component Title to read
  // Component Objects
 // The Object creator in use
  // Other

  constructor(filePath, fileName) {
    this.wiki1 = false;
    this.wiki2 = false;
    this.readingProps = false;
    this.readingDesc = false;
    this.componentTitle = 'standard';
    this.ObjectCreatorsArray = [];
    this.filePath = filePath;
    this.fileName = fileName;
  }
  check(line) {
    if (this.wiki1) // If prev line was: // @wiki
      this.checkWiki1(line);
    else if (this.wiki2) // If prev line was: /** @wiki
      this.checkWiki2(line);
    else if (this.readingProps)
      this.checkProps(line);
    else if (this.readingDesc)
      this.checkDesc(line);
    else if (line.startsWith('// @wiki'))
      this.wiki2 = true;
    else if (line.startsWith('/** @wiki'))
      this.wiki1 = true;
  }
  newComponent() {
    this.ObjectCreatorsArray.push(new ObjectCreator(this.fileName));
    this.ObjectCreator = this.ObjectCreatorsArray[this.ObjectCreatorsArray.length];
    this.componentTitle = 'standard';
  }
  checkWiki1(line) { // -> // @wiki
    this.newComponent();
    if (/^type .*Props/.test(line)) // if props initializer
      this.readingProps = true;
    else { // Error handling
      console.error(`Unrecognized @wiki statement at ${this.filePath}`);
    }
    this.wiki1 = false;
  }
  checkWiki2(line) { // -> /** @wiki
    if (/^\s\*\s+title:\s+(\w+)/.test(line)) { // if custom title found
      const result = /^\s\*\s+title:\s+(\w+)/.exec(line);
      this.ObjectCreator.addComponentTitle(result[1]);
      this.componentTitle = 'custom';
    } else if (/^\s\*\s/.test(line)) { // if description found
      this.ObjectCreator.addDescriptionLine(line);
      this.readingDesc = true;
    } else if (/class\s+(\w+)\s+/ && this.componentTitle === 'reading') { // Standard component name
      const result = /class\s+(\w+)\s+/.exec(line);
      this.ObjectCreator.addComponentTitle(result[1]);
      this.componentTitle = 'standard';
    } else if (/const\s+(\w+)\s+/ && this.componentTitle === 'reading') { // Standard component name
      const result = /const\s+(\w+)\s+/.exec(line);
      this.ObjectCreator.addComponentTitle(result[1]);
      this.componentTitle = 'standard';
    } else { // Error handling
      console.error(`Unrecognized @wiki statement at ${this.filePath}`);
    }
    this.wiki2 = false;
  }
  checkProps(line) {
    if (/^\s*\/\/\s*/.test(line)) // New section
      this.ObjectCreator.addNewPropSection(line);
    else if (/^\s\s+/.test(line)) // New prop
      this.ObjectCreator.addNewProp(line);
    else if (/^\}/.test(line)) // End of props
      this.readingProps = false;
    else { // Error handling
      this.readingProps = false;
      console.error(`Didn't catch the end of props at ${this.filePath}`);
    }
  }
  checkDesc(line) {
    if (/^\s\*\s/.test(line)) { // New description line
      this.ObjectCreator.addDescriptionLine(line);
    } else if (/^\s\*\//.test(line)) { // End of description
      this.readingDesc = false;
      if (this.componentTitle === 'standard')
        this.wiki2 = true;
    } else { // Error handling
      this.readingDesc = false;
      console.error(`Didn't catch the end of description at ${this.filePath}`);
    }
  }
}

module.exports = Parser;
