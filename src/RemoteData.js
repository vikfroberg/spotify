import { Type } from "burk";

const RemoteData = Type("RemoteData", {
  NotAsked: [],
  Loading: [],
  Success: ["data"],
  Failure: ["data"],
});

export default RemoteData;
