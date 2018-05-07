import { patch } from "./Patchable";

export const Context = (list, fork) => ({
  list,
  fork,
  append: (data = []) => {
    list.push(data);
    return Context(data, fork);
  },
  get: id => {
    return Context(list[id], fork);
  },
  replace: (id, newData) => {
    const data = list[id];
    list.slice(id, 1, newData);
    return data;
  },
  destroy: id => {
    const data = list[id];
    list.slice(id, 1);
    return data;
  },
});

export const List = nodes => ({
  type: "list",
  nodes,
  isEqual: list => list.type === "list",
  update: (context, oldList, index) => {
    const maxChildren = Math.max(oldList.nodes.length, nodes.length);
    const newContext = context.get(index);
    for (let i = 0; i < maxChildren; i++) {
      patch(newContext, nodes[i], oldList.nodes[i], i);
    }
  },
  append: context => {
    const newContext = context.append();
    nodes.forEach((node, i) => node.append(newContext, i));
  },
  destroy: (context, index) => {
    const newContext = context.get(index);
    nodes.forEach((node, i) => node.destroy(newContext, i));
  },
});
