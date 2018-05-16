import React, { Fragment } from "react";
import RemoteData from "../data/remote-data";
import Task from "../data/task";
import Maybe from "../data/maybe";
import * as Spotify from "../requests/spotify";
import Component from "../components/program";
import { Image } from "../components/ui";
import { pipe } from "../utils/helpers";
import { Link } from "react-router-dom";

// View

class Search extends Component {
  state = {
    artist: "",
    remoteSearch: RemoteData.NotAsked,
  };
  changeArtist = (artist, token) => {
    this.setState(
      {
        artist,
        remoteSearch:
          artist.length > 2 ? RemoteData.Loading : RemoteData.NotAsked,
      },
      () => {
        artist.length > 2 &&
          this.replace(
            "search",
            Task.debounce(500, Spotify.searchArtists(artist, token)),
            this.searchArtistSuccess,
            this.searchArtistFailure,
          );
      },
    );
  };
  searchArtistSuccess = data => {
    this.setState({
      remoteSearch: RemoteData.Success(data.items),
    });
  };
  searchArtistFailure = err => {
    if (Spotify.Error.isTokenExpired(err)) {
      this.props.onTokenExpire();
    }
    this.setState({
      remoteSearch: RemoteData.Failure(err),
    });
  };
  render() {
    return (
      <Fragment>
        <SearchForm
          onChange={e => this.changeArtist(e.target.value, this.props.token)}
        />
        {pipe(this.state.remoteSearch, [
          RemoteData.fold({
            NotAsked: () => "Search for an artist",
            Loading: () => "Loading...",
            Success: artists =>
              artists.map(artist => {
                return (
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
                          <div
                            style={{
                              display: "inline-block",
                              backgroundColor: "#999",
                              height: 64,
                              width: 64,
                            }}
                          />
                        ),
                      }),
                    ])}
                    <div>{artist.name}</div>
                  </Link>
                );
              }),
            Failure: () => "Failed to search artist",
          }),
        ])}
      </Fragment>
    );
  }
}

function SearchForm({ model, onChange }) {
  return (
    <div>
      <input
        autoFocus
        onChange={onChange}
        type="text"
        placeholder="Search for artist"
      />
    </div>
  );
}

// Helpers

export default Search;
