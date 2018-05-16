import * as R from "ramda";
import { Type } from "burk";

const RemoteData = Type("RemoteData", {
  NotAsked: [],
  Loading: [],
  Success: ["data"],
  Failure: ["data"],
});

RemoteData.map = R.curry((fn, x) =>
  RemoteData.fold(
    {
      NotAsked: () => x,
      Loading: () => x,
      Success: data => RemoteData.Success(fn(data)),
      Failure: () => x,
    },
    x,
  ),
);

export default RemoteData;
