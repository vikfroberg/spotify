import React from "react";
import Maybe from "./Maybe";
import Dict from "./Dict";
import * as R from "ramda";
import * as P from "./Promise";
import * as Spotify from "./Spotify";
import { getHashParams } from "./Dom";

function pipe(x, fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

class App extends React.Component {
  state = {
    maybeToken: Maybe.Nothing,
    maybeArtists: Maybe.Nothing,
  };

  componentDidMount() {
    getHashParams()
      |> P.map(Dict.get("access_token"))
      |> P.flatMap(
        Maybe.fold({
          Just: Spotify.getTopArtists,
          Nothing: () => P.fail("Could not find parameter access_token"),
        }),
      )
      |> P.map(res => res.data.items)
      |> P.fold(items =>
              this.setState(
                  R.evolve({
                      maybeArtists: Maybe.or(Maybe.from(items)),
                  })), err => console.error(err))
  }

  render() {
    return (
      <div>
        {pipe(this.state.maybeToken, [
          Maybe.fold({
            Just: () => null,
            Nothing: () => <a href={Spotify.AUTH_URL}>Login</a>,
          }),
        ])}
        <div>
          {pipe(this.state.maybeArtists, [
            Maybe.fold({
              Just: artists =>
                artists.map(artist => <p key={artist.id}>{artist.name}</p>),
              Nothing: () => "No artists",
            }),
          ])}
        </div>
      </div>
    );
  }
}

export default App;
