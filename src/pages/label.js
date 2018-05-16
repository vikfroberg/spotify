import React, { Fragment } from "react";
import RemoteData from "../data/remote-data";
import Maybe from "../data/maybe";
import Component from "../components/program";
import * as Spotify from "../requests/spotify";
import * as R from "ramda";
import { InlineBlock, Block, Image } from "../components/ui";
import { pipe } from "../utils/helpers";
import { Link } from "react-router-dom";
import { trace } from "../utils/debug";

// View

class Label extends Component {
  state = {
    remoteAlbums: RemoteData.NotAsked,
    remoteTracks: RemoteData.NotAsked,
  };
  componentDidMount() {
    this.replace(
      "albums",
      Spotify.getLabelAlbums(this.props.name, this.props.token),
      this.albumsSuccess,
      this.tokenExpired(this.albumsFailure),
    );
    this.replace(
      "tracks",
      Spotify.getLabelTracks(this.props.name, this.props.token),
      this.tracksSuccess,
      this.tokenExpired(this.tracksFailure),
    );
  }
  albumsSuccess = data => {
    this.setState({ remoteAlbums: RemoteData.Success(data.items) });
  };
  albumsFailure = err => {
    this.setState({ remoteAlbums: RemoteData.Failure(err) });
  };
  tracksSuccess = data => {
    this.setState({ remoteTracks: RemoteData.Success(data.items) });
  };
  tracksFailure = err => {
    this.setState({ remoteTracks: RemoteData.Failure(err) });
  };
  tokenExpired = method => err => {
    if (Spotify.Error.isTokenExpired(err)) {
      this.props.onTokenExpire();
    }
    method(err);
  };
  render() {
    return (
      <Fragment>
        <Block $css={{ fontSize: "46px" }}>{this.props.name}</Block>
        {this.props.lists.map(
          list =>
            R.contains(this.props.name, list.labels) ? (
              <Block
                $css={{ cursor: "pointer", color: "blue" }}
                key={list.id}
                onClick={() =>
                  this.props.onRemoveListClick(list.id, this.props.name)}
              >
                Remove from {list.name}
              </Block>
            ) : (
              <Block
                $css={{ cursor: "pointer", color: "blue" }}
                key={list.id}
                onClick={() =>
                  this.props.onAddListClick(list.id, this.props.name)}
              >
                Add to {list.name}
              </Block>
            ),
        )}
        {pipe(this.state.remoteAlbums, [
          RemoteData.fold({
            Success: albums =>
              albums.map(album => (
                <Link key={album.id} to={`/albums/${album.id}`}>
                  <Block>
                    {pipe(album.images.medium, [
                      Maybe.fold({
                        Just: image => (
                          <Image src={image.url} height={300} width={300} />
                        ),
                        Nothing: () => (
                          <Block
                            $css={{
                              width: "300px",
                              height: "300px",
                              backgroundColor: "#999",
                            }}
                          />
                        ),
                      }),
                    ])}
                  </Block>
                  <Block $css={{ fontSize: 46 }}>{album.name}</Block>
                </Link>
              )),
            Failure: () => "Failed to load artist albums",
            _: () => "Loading...",
          }),
        ])}
        {pipe(this.state.remoteTracks, [
          RemoteData.fold({
            Success: tracks =>
              tracks.map(track => (
                <Block key={track.id}>
                  <InlineBlock $css={{ fontSize: 18 }}>
                    {track.name}
                    {" - "}
                  </InlineBlock>
                  <InlineBlock $css={{ fontSize: 18 }}>
                    {track.artists.map(a => a.name).join(", ")}
                    {" - "}
                  </InlineBlock>
                  <InlineBlock $css={{ fontSize: 18 }}>
                    {track.album.name}
                  </InlineBlock>
                </Block>
              )),
            Failure: () => "Failed to load artist tracks",
            _: () => "Loading...",
          }),
        ])}
      </Fragment>
    );
  }
}

export default Label;
