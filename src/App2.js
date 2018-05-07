import React from "react";
import Dict from "./Dict";
import RemoteData from "./RemoteData";
import IO from "./IO";
import Task from "./Task";
import Maybe from "./Maybe";
import { Cmd, createProgram } from "./Elm";
import * as R from "ramda";
import { Type } from "burk";
import * as Spotify from "./Spotify";
import { pipe } from "./Utils";
import * as Dom from "./Dom";
import * as Login from "./Login";
import * as Router from "./Router";
// import * as List from "./List";
// import * as Observable from "./Observable";
// import { patch } from "./Patchable";

// const fakeObservable = time => {
//   let i = 0;
//   return {
//     subscribe: (res, rej) => {
//       const id = setInterval(() => res(time + ":" + i++), time);
//       return { unsubscribe: () => clearInterval(id) };
//     },
//   };
// };

// const id = x => x;
// const seconds1 = fakeObservable(1000);
// const seconds3 = fakeObservable(3000);

// const subContext = List.Context([], x => console.log(x));

// const a = List.List([
//   Observable.Observable(seconds1, id, id),
//   Observable.Observable(seconds3, id, id),
// ]);
// const b = List.List([Observable.Observable(seconds1, id, id)]);
// const c = Observable.Observable(seconds3, id, id);

// patch(subContext, a);
// patch(subContext, b, a);
// patch(subContext, c, b);

// const d = Dom.Element("ul", {}, {}, [
//   Dom.Element("li", { color: "red" }, {}, [Dom.Text("item 1")]),
//   Dom.Element("li", {}, {}, [Dom.Text("item 2")]),
// ]);

// const e = Dom.Element("ul", {}, {}, [
//   Dom.Element("li", {}, {}, [Dom.Text("item 3")]),
//   Dom.Element("li", {}, {}, []),
//   Dom.Element("li", {}, {}, [Dom.Text("item 1")]),
// ]);

// const domContext = Dom.Context(document.getElementById("root"));

// patch(domContext, d);
// patch(domContext, e, d);
// patch(domContext, d, e);

// const Msg = Type("Msg", {
//   TokenSuccess: ["token"],
//   TokenFailure: ["err"],
//   ArtistsSuccess: ["items"],
//   ArtistsFailure: ["err"],
// });

// const init = () => ({
//   model: {
//     remoteToken: RemoteData.Loading,
//     remoteArtists: RemoteData.NotAsked,
//   },
//   commands: {
//     accessToken: Cmd.fromTask(
//       Msg.TokenSuccess,
//       Msg.TokenFailure,
//       accessTokenTask,
//     ),
//   },
// });

// const update = ({ model, commands }) =>
//   Msg.fold({
//     TokenSuccess: token => ({
//       model: {
//         ...model,
//         remoteToken: RemoteData.Success(token),
//         remoteArtists: RemoteData.Loading,
//       },
//       commands: {
//         ...commands,
//         topArtists: Cmd.fromTask(
//           Msg.ArtistsSuccess,
//           Msg.ArtistsFailure,
//           topArtistsTask(token),
//         ),
//       },
//     }),
//     TokenFailure: err => ({
//       model: {
//         ...model,
//         remoteToken: RemoteData.Error(err),
//       },
//     }),
//     ArtistsSuccess: items => ({
//       model: {
//         ...model,
//         remoteArtists: RemoteData.Success(items),
//       },
//     }),
//     ArtistsFailure: err => ({
//       model: {
//         ...model,
//         remoteArtists: RemoteData.Error(err),
//       },
//     }),
//   });

// const tokenSuccess = token => ({ model, commands }) => ({
//   model: {
//     ...model,
//     remoteToken: RemoteData.Success(token),
//     remoteArtists: RemoteData.Loading,
//   },
//   commands: {
//     ...commands,
//     topArtists: Cmd.fromTask(
//       artistsSuccess,
//       artistsFailure,
//       topArtistsTask(token),
//     ),
//   },
// });

// const tokenFailure = err => ({ model, commands }) => ({
//   model: {
//     ...model,
//     remoteToken: RemoteData.Error(err),
//   },
// });

// const artistsSuccess = items => ({ model, commands }) => ({
//   model: {
//     ...model,
//     remoteArtists: RemoteData.Success(items),
//   },
// });

// const artistsFailure = err => ({ model, commands }) => ({
//   model: {
//     ...model,
//     remoteArtists: RemoteData.Error(err),
//   },
// });

// function View({ model }) {
//   return (
//     <div>
//       {pipe(model.remoteToken, [
//         RemoteData.fold({
//           Loading: () => "Fetching token...",
//           Success: () => (
//             <div>
//               {pipe(model.remoteArtists, [
//                 RemoteData.fold({
//                   Loading: () => "Loading artists...",
//                   Success: artists =>
//                     artists.map(artist => <p key={artist.id}>{artist.name}</p>),
//                   _: () => "Failed to load artists",
//                 }),
//               ])}
//             </div>
//           ),
//           _: () => <a href={Spotify.AUTH_URL}>Login</a>,
//         }),
//       ])}
//     </div>
//   );
// }

// const accessTokenTask = IO.toTask(Dom.getHashParams)
//   .map(Dict.get("access_token"))
//   .flatMap(
//     Maybe.fold({
//       Just: Task.succeed,
//       Nothing: () => Task.fail("Could not find access_token"),
//     }),
//   );

// const topArtistsTask = R.memoize(token =>
//   Spotify.getTopArtists(token).map(R.path(["data", "items"])),
// );

const updater = update => msg => state => {
  console.log({ msg, state });
  return update(state)(msg);
};

const App = createProgram(Router.init(), Router.View, updater(Router.update));

class Main extends React.Component {
  state = { isHidden: false };
  componentDidMount() {
    // setTimeout(() => this.setState({ isHidden: true }), 100);
  }
  render() {
    return this.state.isHidden ? <div /> : <App />;
  }
}

export default Main;
