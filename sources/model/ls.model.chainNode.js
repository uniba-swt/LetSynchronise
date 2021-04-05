class ChainNode {
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



    toString() {
        let output = "";
        output = output + ModelDependency.GetDependencyString(this.dependency);
        for (const node of this.children) {
            output = output + '->' +node.toString();
        }
        return output;
    }
  }