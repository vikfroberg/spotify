import { Type } from "burk";

const Maybe = Type("Maybe", {
  Just: ["x"],
  Nothing: [],
});

Maybe.from = x => (x != null ? Maybe.Just(x) : Maybe.Nothing);

Maybe.or = y => x =>
  Maybe.fold(
    {
      Just: () => x,
      Nothing: () => y,
    },
    x,
  );

export default Maybe;
