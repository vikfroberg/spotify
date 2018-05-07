const noop = () => {};

const Task = (fork, cancel = noop) => ({
  fork: (resolve, reject) => {
    const execution = fork(resolve, reject);
    return { cancel: () => cancel(execution) };
  },
  map: fn =>
    Task((resolve, reject) => fork(x => resolve(fn(x)), reject), cancel),
  mapError: fn =>
    Task((resolve, reject) => fork(resolve, x => reject(fn(x))), cancel),
  flatMap: fn =>
    Task((res, rej) => fork(x => fn(x).fork(res, rej), rej), cancel),
});

Task.fail = x => Task((resolve, reject) => reject(x));

Task.succeed = x => Task((resolve, reject) => resolve(x));

Task.fromPromise = promise =>
  Task(
    (resolve, reject) => {
      let isCancelled = false;
      promise()
        .then(x => !isCancelled && resolve(x))
        .catch(y => !isCancelled && reject(y));
      return () => {
        isCancelled = true;
      };
    },
    cancel => cancel(),
  );

export default Task;
