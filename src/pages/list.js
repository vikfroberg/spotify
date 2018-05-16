import React, { Fragment } from "react";
import RemoteData from "../data/remote-data";
import Maybe from "../data/maybe";
import Component from "../components/program";
import qs from "query-string";
import * as Spotify from "../requests/spotify";
import { Block, Image } from "../components/ui";
import { pipe } from "../utils/helpers";
import { Link } from "react-router-dom";

// View

class List extends Component {
  state = {
    remoteArtists: RemoteData.NotAsked,
  };
  componentDidMount() {
    const artistIds = this.props.list.artistIds;
    if (artistIds.length > 0) {
      this.replace(
        "artists",
        Spotify.getArtists(artistIds.join(","), this.props.token),
        this.artistsSuccess,
        this.artistsFailure,
      );
    }
  }
  artistsSuccess = data => {
    this.setState({ remoteArtists: RemoteData.Success(data.artists) });
  };
  artistsFailure = err => {
    if (Spotify.Error.isTokenExpired(err)) {
      this.props.onTokenExpire();
    }
    this.setState({ remoteArtists: RemoteData.Failure(err) });
  };
  render() {
    return (
      <Fragment>
        <Block $css={{ fontSize: "36px" }}>{this.props.list.name}</Block>
        <Block $css={{ fontSize: "26px" }}>Labels</Block>
        {this.props.list.labels.map(label => (
          <Block key={label}>
            <Link
              to={{ pathname: "/label", search: qs.stringify({ name: label }) }}
            >
              {label}
            </Link>
          </Block>
        ))}
        <Block $css={{ fontSize: "26px" }}>Artists</Block>
        {pipe(this.state.remoteArtists, [
          RemoteData.fold({
            Success: artists =>
              artists.map(artist => (
                <Link key={artist.id} to={"/artists/" + artist.id}>
                  {pipe(artist.images.small, [
                    Maybe.fold({
                      Just: image => (
                        <Image
                          $css={{ borderRadius: "64px" }}
                          alt={artist.name}
                          src={image.url}
                          height={64}
                          width={64}
                        />
                      ),
                      Nothing: () => (
                        <Block
                          $css={{
                            backgroundColor: "#999",
                            height: "64px",
                            width: "64px",
                          }}
                        />
                      ),
                    }),
                  ])}
                  <Block>{artist.name}</Block>
                </Link>
              )),
            Failure: () => "Failed to load artists",
            _: () => "Loading...",
          }),
        ])}
      </Fragment>
    );
  }
}

export default List;
