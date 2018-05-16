import React from "react";
import IO from "../data/io";

class Component extends React.Component {
  concats = {};
  concat = (key, task, resolve, reject) => {
    this.concats[key] = this.concats[key] || { pending: null, queue: [] };
    const io = IO.fromTask(resolve, reject, task);
    if (this.concats[key].pending === null) {
      this.concats[key].pending = io.fork(() => {
        this.concats[key].pending = null;
        if (this.concats[key].queue.length > 0) {
          this.concat(key, this.concats[key].queue.shift());
        }
      });
    } else {
      this.concats[key].queue.push(io);
    }
  };
  replaces = {};
  replace = (key, task, resolve, reject) => {
    const io = IO.fromTask(resolve, reject, task);
    if (this.replaces[key]) {
      this.replaces[key].cancel();
    }
    this.replaces[key] = io.fork(() => {});
  };
  componentWillUnmount() {
    Object.keys(this.replaces).forEach(key => this.replaces[key].cancel());
    Object.keys(this.concats).forEach(key =>
      this.replaces[key].pending.cancel(),
    );
  }
}

export default Component;
