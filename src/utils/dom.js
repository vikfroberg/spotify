import Dict from "../data/dict";
import IO from "../data/io";
import * as R from "ramda";
import { pipe } from "./helpers";

export const getHashParams = IO(res => {
  res(
    pipe(window.location.hash, [
      R.drop(1),
      R.split("&"),
      R.map(R.split("=")),
      R.fromPairs,
      Dict.from,
    ]),
  );
});
