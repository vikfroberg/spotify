// const MemoizedType = (name, def) => R.map(R.memoize, Type(name, def));

// const Sub = _fork => ({
//   _fork,
//   map: fn => Sub(cb => _fork(R.pipe(fn, cb))),
// });

// Sub.none = () => Sub(() => {});

// Sub.batch = (x, y) =>
//   Sub(cb => {
//     x._fork(cb);
//     y._fork(cb);
//   });

// const SubFree = MemoizedType("SubFree", {
//   Every: ["time", "msg"],
//   Map: ["fn", "x"],
//   Batch: ["x", "y"],
// });

// const dispatch = x => console.log(x);

// const toSub = SubFree.fold({
//   Every: time =>
//     Sub(cb => {
//       setInterval(() => cb(), time);
//     }),
//   Map: (fn, x) => toSub(x).map(fn),
//   Batch: (x, y) => Sub.batch(toSub(x), toSub(y)),
// });

// const Msg = Type("Msg", {
//   Parent: ["msg"],
//   Child: [],
//   Child2: [],
// });

// const sub1 = SubFree.Batch([
//   SubFree.Map(Msg.Parent, SubFree.Every(1000, Msg.Child)),
//   SubFree.Map(Msg.Parent, SubFree.Every(500, Msg.Child2)),
// ]);

// const sub2 = SubFree.Batch([
//   SubFree.Map(Msg.Parent, SubFree.Every(1000, Msg.Child)),
//   SubFree.Map(Msg.Parent, SubFree.Every(500, Msg.Child2)),
// ]);

// dispatch(sub1 === sub2);

// class TEA extends React.Component {
//   mounted = true;

//   componentWillUnmount() {
//     this.mounted = false;
//   }

//   setStateIO = updater => {
//     return IO(res => {
//       if (this.mounted) {
//         this.setState(updater, () => res());
//       }
//     });
//   };
// }

// class App extends TEA {
//   state = {
//     remoteToken: RemoteData.NotAsked,
//     remoteArtists: RemoteData.NotAsked,
//   };

//   componentDidMount() {
//     console.log("HALLO");
//     this.setStateIO({ remoteToken: RemoteData.Loading })
//       .flatMap(() => getAccessTokenIO())
//       .flatMap(this.receivedAccessToken)
//       .run();
//   }

//   receivedAccessToken = Result.fold({
//     Ok: token =>
//       this.setStateIO({
//         remoteToken: RemoteData.Success(token),
//         remoteArtists: RemoteData.Loading,
//       })
//         .flatMap(() => getTopArtistsIO(token))
//         .flatMap(this.receivedTopArtists),
//     Err: err => this.setStateIO({ remoteToken: RemoteData.Error(err) }),
//   });

//   receivedTopArtists = Result.fold({
//     Ok: items => this.setStateIO({ remoteArtists: RemoteData.Success(items) }),
//     Err: err => this.setStateIO({ remoteArtists: RemoteData.Error(err) }),
//   });

//   render() {
//     return (
//       <div>
//         {pipe(this.state.remoteToken, [
//           RemoteData.fold({
//             NotAsked: () => <a href={Spotify.AUTH_URL}>Login</a>,
//             Loading: () => "Fetching token...",
//             Success: () => (
//               <div>
//                 {pipe(this.state.remoteArtists, [
//                   RemoteData.fold({
//                     NotAsked: () => {
//                       throw new Error("Should not happen");
//                     },
//                     Loading: () => "Loading artists...",
//                     Success: artists =>
//                       artists.map(artist => (
//                         <p key={artist.id}>{artist.name}</p>
//                       )),
//                     Error: () => "Failed to load artists",
//                   }),
//                 ])}
//               </div>
//             ),
//             Error: () => <a href={Spotify.AUTH_URL}>Login</a>,
//           }),
//         ])}
//       </div>
//     );
//   }
// }

// class Main extends React.Component {
//   state = { hide: false };

//   componentDidMount() {
//     setTimeout(() => {
//       this.setState({ hide: true });
//     }, 100);
//   }

//   render() {
//     return this.state.hide ? <div /> : <App />;
//   }
// }
