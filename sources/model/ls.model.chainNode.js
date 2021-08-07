class ChainNode {
    dependency = null;
    children = [];

    constructor(dependency) {
      this.dependency = dependency;
      this.children = []; // adjacency list
    }
  
    addChildren(chainNode) {
      this.children.push(chainNode);
    }

    addChildrenDependency(dependency) {
        let childNode = new ChainNode(dependency)
        this.children.push(childNode);
        return childNode;
    }

    contains(chainNode) {
      let result = false;
      if (this.dependency == chainNode.dependency) {
        result = true;
      }
      for (const node of this.children) {
        result = result || node.contains(chainNode);
      }
      return result;
    }

    toString() {
        let output = "";
        output = output + Utility.FormatDependencyString(this.dependency);
        for (const node of this.children) {
            output = output + ` -> ${node.toString()}`;
        }
        return output;
    }
  }