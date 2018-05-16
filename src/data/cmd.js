let _key = 0;

export const Cmd = fork => ({
  kind: "Cmd",
  key: _key++,
  fork,
});

Cmd.none = () => Cmd(() => ({ cancel: () => {} }));

Cmd.fromTask = (resFn, rejFn, task) =>
  Cmd(fork => task.fork(x => fork(resFn(x)), y => fork(rejFn(y))));

Cmd.fromIO = (resFn, io) => Cmd(fork => io.fork(x => fork(resFn(x))));

export default Cmd;
