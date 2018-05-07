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

Maybe.map = fn =>
  Maybe.fold({
    Just: x => Maybe.Just(fn(x)),
    Nothing: () => Maybe.Nothing,
  });

Maybe.withDefault = y =>
  Maybe.fold({
    Just: x => x,
    Nothing: () => y,
  });

export default Maybe;
