import { Type } from "burk";
import Maybe from "./Maybe";

const Dict = Type("Dict", {
  Dict: ["x"],
});

Dict.from = Dict.Dict;

Dict.get = key => dict =>
  Dict.fold(
    {
      Dict: x => Maybe.from(x[key]),
    },
    dict,
  );

export default Dict;
