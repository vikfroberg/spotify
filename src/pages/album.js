import React, { Fragment } from "react";
import RemoteData from "../data/remote-data";
import Maybe from "../data/maybe";
import Component from "../components/program";
import qs from "query-string";
import * as Spotify from "../requests/spotify";
import { Block, Image, FlexRow } from "../components/ui";
import { pipe } from "../utils/helpers";
import { Link } from "react-router-dom";

// View

class Album extends Component {
  state = {
    remoteInfo: RemoteData.NotAsked,
    remoteTracks: RemoteData.NotAsked,
  };
  componentDidMount() {
    this.replace(
      "info",
      Spotify.getAlbum(this.props.id, this.props.token),
      this.infoSuccess,
      this.tokenExpired(this.infoFailure),
    );
    this.replace(
      "tracks",
      Spotify.getAlbumTracks(this.props.id, this.props.token),
      this.tracksSuccess,
      this.tokenExpired(this.tracksFailure),
    );
  }
  infoSuccess = data => {
    this.setState({ remoteInfo: RemoteData.Success(data) });
  };
  infoFailure = err => {
    this.setState({ remoteInfo: RemoteData.Failure(err) });
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
            Success: album => (
              <Block>
                <FlexRow>
                  <Block>
                    {pipe(album.images.medium, [
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
                    {album.name}
                  </Block>
                </FlexRow>
                <Link
                  to={{
                    pathname: "/label",
                    search: qs.stringify({ name: album.label }),
                  }}
                >
                  {album.label}
                </Link>
              </Block>
            ),

            Failure: () => "Failed to load artist info",
            _: () => "Loading...",
          }),
        ])}
        {pipe(this.state.remoteTracks, [
          RemoteData.fold({
            Success: tracks =>
              tracks.map(track => (
                <Block key={track.id} $css={{ fontSize: "18px" }}>
                  {track.name} - {track.artists.map(a => a.name).join(", ")}
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

export default Album;
