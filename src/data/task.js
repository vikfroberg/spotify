const noop = () => {};

const Task = (fork, cancel = noop) => ({
  fork: (resolve, reject) => {
    const execution = fork(resolve, reject);
    return { cancel: () => cancel(execution) };
  },
  ap: task => {
    return Task(
      (resolve, reject) => {
        const thatFork = task.fork;
        const thisFork = (resolve, reject) => {
          const execution = fork(resolve, reject);
          return { cancel: () => cancel(execution) };
        };

        let rejected = false;
        let func = null;
        let funcLoaded = false;
        let val = null;
        let valLoaded = false;

        const guardResolve = setter => x => {
          if (!rejected) {
            setter(x);
            if (funcLoaded && valLoaded) {
              return resolve(func(val));
            } else {
              return x;
            }
          }
        };

        const guardReject = err => {
          if (!rejected) {
            rejected = true;
            return reject(err);
          }
        };

        return [
          thisFork(
            guardResolve(x => {
              func = x;
              funcLoaded = true;
            }),
            guardReject,
          ),
          thatFork(
            guardResolve(x => {
              val = x;
              valLoaded = true;
            }),
            guardReject,
          ),
        ];
      },
      executions => executions.forEach(execution => execution.cancel()),
    );
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

const wait = ms => Task((res, rej) => setTimeout(res, ms), clearTimeout);
Task.debounce = (ms, task) => wait(ms).flatMap(() => task);

export default Task;
