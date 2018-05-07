import { Type } from "burk";
import Maybe from "./Maybe";
import RemoteData from "./RemoteData";

const Result = Type("Result", {
  Ok: ["res"],
  Err: ["err"],
});

Result.fromMaybe = e =>
  Maybe.fold({
    Just: Result.Ok,
    Nothing: () => Result.Err(e),
  });

Result.toMaybe = Result.fold({
  Ok: Maybe.Just,
  Err: () => Maybe.Nothing,
});

Result.toRemoteData = Result.fold({
  Ok: RemoteData.Success,
  Err: RemoteData.Error,
});

export default Result;
