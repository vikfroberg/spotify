import React from "react";

class LocalStorage extends React.Component {
  state = JSON.parse(localStorage.getItem("store")) || this.props.initialState;
  render() {
    return this.props.children({
      store: this.state,
      setStore: updater => {
        this.setState(updater, () => {
          localStorage.setItem("store", JSON.stringify(this.state));
        });
      },
    });
  }
}

export default LocalStorage;
