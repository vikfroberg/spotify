import * as R from "ramda";
import * as U from "./Utils";
import Dict from "./Dict";

export function getHashParams() {
  return new Promise((res, rej) =>
    res(
      U.pipe(window.location.hash, [
        R.drop(1),
        R.split("&"),
        R.map(R.split("=")),
        R.fromPairs,
        Dict.from,
      ]),
    ),
  );
}
