import React from "react";
import qs from "query-string";
import Maybe from "../data/maybe";
import { Redirect } from "react-router-dom";
import { pipe } from "../utils/helpers";

class AccessToken extends React.Component {
  componentDidMount() {
    const query = qs.parse(this.props.location.hash.substring(1));
    const maybeToken = Maybe.from(query.access_token);
    pipe(maybeToken, [
      Maybe.fold({
        Just: token => {
          this.props.onSuccess(token);
        },
        Nothing: () => {
          this.props.onFailure("No token found");
        },
      }),
    ]);
  }
  render() {
    return <Redirect to="/" />;
  }
}

export default AccessToken;
