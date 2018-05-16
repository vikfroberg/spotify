import * as R from "ramda";
import Task from "./task";

const IO = fork => ({
  fork,
  map: fn => IO(res => fork(x => res(fn(x)))),
  flatMap: fn => IO(res => fork(x => fn(x).fork(res))),
});

IO.fromTask = R.curry((a, b, task) =>
  IO(res => task.fork(x => res(a(x)), y => res(b(y)))),
);

IO.toTask = io => Task((res, rej) => io.fork(res));

export default IO;
