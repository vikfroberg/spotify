export const patch = (context, newNode, oldNode, index = 0) => {
  if (oldNode) {
    if (newNode) {
      if (newNode.isEqual(oldNode)) {
        newNode.update(context, oldNode, index);
      } else {
        newNode.replace(context, oldNode, index);
      }
    } else {
      oldNode.destroy(context, index);
    }
  } else {
    if (newNode) {
      newNode.append(context, index);
    } else {
      throw new Error("Both old and new node can't be null");
    }
  }
};
