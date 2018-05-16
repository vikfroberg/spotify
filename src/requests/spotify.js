import request from "superagent";
import qs from "query-string";
import Task from "../data/task";
import Maybe from "../data/maybe";
import * as R from "ramda";
import { Type } from "burk";
import { trace } from "../utils/debug";
import { liftAll, concatN } from "../utils/helpers";

// const CLIENT_SECRET = "0407c924f6684b10902887a85a4b54b8";

const CLIENT_ID = "ba714a6f875d4b329119327b37125d07";

const CLIENT_SCOPE = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
].join(" ");

const AUTH_QUERY = [
  "response_type=token",
  `client_id=${CLIENT_ID}`,
  `scope=${CLIENT_SCOPE}`,
  "redirect_uri=http://localhost:3000/access-token",
].join("&");

export const Error = Type("Error", {
  NotFound: [],
  BadRequest: [],
  UnAuthorized: [],
  NotAcceptable: [],
  Forbidden: [],
  ServerError: [],
});

Error.from = code => {
  switch (code) {
    case 400:
      return Error.BadRequest;
    case 404:
      return Error.NotFound;
    case 401:
      return Error.UnAuthorized;
    case 403:
      return Error.Forbidden;
    case 406:
      return Error.NotAcceptable;
    default:
      return Error.ServerError;
  }
};

Error.isTokenExpired = Error.fold({
  UnAuthorized: () => true,
  _: () => false,
});

const get = (url, { params = {}, headers = {} }) =>
  Task((resolve, reject) => {
    const req = request
      .get(url)
      .query(qs.stringify(params))
      .set(headers)
      .end((err, res) => {
        if (err) {
          reject(Error.from(res.statusCode));
        } else {
          resolve(res.body);
        }
      });
    return { cancel: () => req.abort() };
  });

export const AUTH_URL = "https://accounts.spotify.com/authorize?" + AUTH_QUERY;

const maybeFind = (fn, xs) => (xs ? Maybe.from(xs.find(fn)) : Maybe.Nothing);

const decodeArtist = artist => ({
  id: artist.id,
  name: artist.name,
  images: {
    small: maybeFind(img => img.width < 300, artist.images),
    medium: maybeFind(img => img.width < 640, artist.images),
    large: maybeFind(img => img.width === 640, artist.images),
  },
});

const decodeAlbum = album => ({
  id: album.id,
  name: album.name,
  label: album.label,
  images: {
    small: maybeFind(img => img.width < 300, album.images),
    medium: maybeFind(img => img.width < 640, album.images),
    large: maybeFind(img => img.width === 640, album.images),
  },
});

const decodeTrack = track => ({
  id: track.id,
  name: track.name,
  album: decodeAlbum(track.album),
  artists: track.artists.map(decodeArtist),
});

const decodeAlbumTrack = track => ({
  id: track.id,
  name: track.name,
  artists: track.artists.map(decodeArtist),
});

const itemsLens = R.lensPath(["items"]);
const artistsLens = R.lensPath(["artists"]);

export function searchArtists(q, token) {
  return get("https://api.spotify.com/v1/search", {
    params: { type: "artist", q },
    headers: { Authorization: `Bearer ${token}` },
  })
    .map(r => r.artists)
    .map(R.over(itemsLens, R.map(decodeArtist)));
}

export function searchTracks(q, token) {
  const query = qs.stringify({ type: "track", limit: 50, q });
  return getNext(
    "https://api.spotify.com/v1/search?" + query,
    { Authorization: `Bearer ${token}` },
    res => res.tracks,
  ).map(R.over(itemsLens, R.map(decodeTrack)));
}

export function getLabelArtists(name, token) {
  const query = qs.stringify({
    type: "artist",
    limit: 50,
    q: `label:"${name}"`,
  });
  return getNext(
    "https://api.spotify.com/v1/search?" + query,
    { Authorization: `Bearer ${token}` },
    res => res.artists,
  ).map(R.over(itemsLens, R.map(decodeArtist)));
}

export function getLabelAlbums(name, token) {
  const query = qs.stringify({
    type: "album",
    limit: 50,
    q: `label:"${name}"`,
  });
  return getNext(
    "https://api.spotify.com/v1/search?" + query,
    { Authorization: `Bearer ${token}` },
    res => res.albums,
  ).map(R.over(itemsLens, R.map(decodeAlbum)));
}

export function getLabelTracks(name, token) {
  const query = qs.stringify({
    type: "track",
    limit: 50,
    q: `label:"${name}"`,
  });
  return getNext(
    "https://api.spotify.com/v1/search?" + query,
    { Authorization: `Bearer ${token}` },
    res => res.tracks,
  ).map(R.over(itemsLens, R.map(decodeTrack)));
}

const getNext = (url, headers, decoder, max = 100) =>
  get(url, { headers })
    .map(decoder)
    .flatMap(
      res =>
        res.next != null && res.offset < max
          ? getNext(res.next, headers, decoder, max).map(newRes => ({
              ...newRes,
              items: [...res.items, ...newRes.items],
            }))
          : Task.succeed(res),
    );

export function getAlbum(id, token) {
  return get(`https://api.spotify.com/v1/albums/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).map(decodeAlbum);
}

export function getAlbumTracks(id, token) {
  return get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
    params: { limit: 50 },
    headers: { Authorization: `Bearer ${token}` },
  }).map(R.over(itemsLens, R.map(decodeAlbumTrack)));
}

export function getArtists(ids, token) {
  return get(`https://api.spotify.com/v1/artists`, {
    params: { ids },
    headers: { Authorization: `Bearer ${token}` },
  }).map(R.over(artistsLens, R.map(decodeArtist)));
}

export function getArtistInfo(id, token) {
  return get(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).map(decodeArtist);
}

export function getArtistAlbums(id, token) {
  return get(`https://api.spotify.com/v1/artists/${id}/albums`, {
    params: { include_groups: "single,album", limit: 50 },
    headers: { Authorization: `Bearer ${token}` },
  }).flatMap(data => {
    const ids = data.items.map(a => a.id);
    return liftAll(
      concatN(ids.length, []),
      ids.map(id =>
        getAlbum(id, token)
          .map(x => [x])
          .map(trace("album")),
      ),
    ).map(items => ({ ...data, items }));
  });
}
