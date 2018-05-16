import React from "react";
import * as Spotify from "../requests/spotify";

class Login extends React.Component {
  render() {
    return <a href={Spotify.AUTH_URL}>Login</a>;
  }
}

export default Login;
