// 



class ObjectCreator {
  constructor(fileName) {
    this.object = {
      props: [],
      description: [],
      title: fileName
    };
  }
  addNewProp(line) {
    const str = line.split(/:/);
    const propName = str[0].trim();
    str.splice(0, 1);
    const str2 = str.join(':').split(/\s*\/\/\s*/); // ( // )
    // Format propType
    let propType = str2[0].trim();
    if (propType.endsWith(',')) {
      propType = propType.substr(0, propType.length - 1);
    }
    // Format propDesc
    let propDesc = '';
    if (str2[1])
      propDesc = str2[1].trim();
    this.object.props.push({
      propName,
      propType,
      propDesc
    });
  }
  addNewPropSection(line) {
    const str = line.split(/\s*\/\/\s*/);
    this.object.props.push({ section: str[1].trim() });
  }
  addComponentTitle(name) {
    this.object.title = name;
  }
  addDescriptionLine(line) {
    if (line.length <= 3)
      return;
    this.object.description.push(line.substr(3));
  }
  getObject() {
    return this.object;
  }
}

module.exports = ObjectCreator;
