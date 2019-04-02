import React, { Fragment } from "react";
import RemoteData from "../data/remote-data";
import Maybe from "../data/maybe";
import Component from "../components/program";
import qs from "query-string";
import * as Spotify from "../requests/spotify";
import * as R from "ramda";
import { InlineBlock, Block, Image, FlexRow } from "../components/ui";
import { pipe } from "../utils/helpers";
import { trace } from "../utils/debug";
import { Link } from "react-router-dom";

// View

class Artist extends Component {
  state = {
    remoteInfo: RemoteData.NotAsked,
    remoteAlbums: RemoteData.NotAsked,
    remoteTracks: RemoteData.NotAsked,
  };
  componentDidMount() {
    this.replace(
      "info",
      Spotify.getArtistInfo(this.props.id, this.props.token),
      this.infoSuccess,
      this.tokenExpired(this.infoFailure),
    );
    this.replace(
      "albums",
      Spotify.getArtistAlbums(this.props.id, this.props.token),
      this.albumsSuccess,
      this.tokenExpired(this.albumsFailure),
    );
  }
  infoSuccess = data => {
    this.setState({ remoteInfo: RemoteData.Success(data) });
    this.replace(
      "tracks",
      Spotify.searchTracks(`artist:"${data.name}"`, this.props.token),
      this.tracksSuccess,
      this.tokenExpired(this.tracksFailure),
    );
  };
  infoFailure = err => {
    this.setState({ remoteInfo: RemoteData.Failure(err) });
  };
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
        {pipe(this.state.remoteInfo, [
          RemoteData.fold({
            Success: artist => (
              <FlexRow>
                <Block>
                  {pipe(artist.images.medium, [
                    Maybe.fold({
                      Just: image => (
                        <Image
                          $css={{ borderRadius: "300px" }}
                          src={image.url}
                          height={300}
                          width={300}
                        />
                      ),
                      Nothing: () => (
                        <Block
                          $css={{
                            borderRadius: "300px",
                            width: "300px",
                            height: "300px",
                            backgroundColor: "#999",
                          }}
                        />
                      ),
                    }),
                  ])}
                </Block>
                <Block
                  $css={{
                    lineHeight: "160px",
                    paddingLeft: "40px",
                    fontSize: 46,
                  }}
                >
                  {artist.name}
                </Block>
                {this.props.lists.map(
                  list =>
                    R.contains(artist.id, list.artistIds) ? (
                      <Block
                        $css={{ cursor: "pointer", color: "blue" }}
                        key={list.id}
                        onClick={() =>
                          this.props.onRemoveListClick(list.id, artist.id)}
                      >
                        Remove from {list.name}
                      </Block>
                    ) : (
                      <Block
                        $css={{ cursor: "pointer", color: "blue" }}
                        key={list.id}
                        onClick={() =>
                          this.props.onAddListClick(list.id, artist.id)}
                      >
                        Add to {list.name}
                      </Block>
                    ),
                )}
              </FlexRow>
            ),

            Failure: () => "Failed to load artist info",
            _: () => "Loading...",
          }),
        ])}
        {pipe(this.state.remoteAlbums, [
          RemoteData.map(R.groupBy(a => a.label)),
          RemoteData.map(R.toPairs),
          RemoteData.map(R.sortBy(([label, albums]) => albums.length)),
          RemoteData.map(R.reverse),
          RemoteData.fold({
            Success: labelPairs =>
              labelPairs.map(([label, albums]) => (
                <Block key={label}>
                  <Link
                    to={{
                      pathname: "/label",
                      search: qs.stringify({ name: label }),
                    }}
                  >
                    {label} ({albums.length})
                  </Link>
                </Block>
              )),
            Failure: () => "Failed to load labels",
            _: () => "Loading",
          }),
        ])}
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

export default Artist;
