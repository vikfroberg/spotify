import React from "react";
import RemoteData from "./RemoteData";
import * as Spotify from "./Spotify";
import * as R from "ramda";
import { Type } from "burk";
import { pipe } from "./Utils";
import { Cmd } from "./Elm";

// MSG

const Msg = Type("Artists.Msg", {
  ArtistsSuccess: ["items"],
  ArtistsFailure: ["err"],
});

// MODEL

export const init = token => ({
  model: RemoteData.Loading,
  commands: Cmd.fromTask(
    Msg.ArtistsSuccess,
    Msg.ArtistsFailure,
    topArtistsTask(token),
  ),
});

// UPDATE

export const update = ({ model, commands }) =>
  Msg.fold({
    ArtistsSuccess: items => ({
      model: RemoteData.Success(items),
      commands,
    }),
    ArtistsFailure: err => ({
      model: RemoteData.Error(err),
      commands,
    }),
  });

// VIEW

export function View({ model }) {
  return (
    <div>
      {pipe(model, [
        RemoteData.fold({
          Loading: () => "Loading artists...",
          Success: artists =>
            artists.map(artist => <p key={artist.id}>{artist.name}</p>),
          _: () => "Failed to load artists",
        }),
      ])}
    </div>
  );
}

const topArtistsTask = token =>
  Spotify.getTopArtists(token).map(R.path(["data", "items"]));
