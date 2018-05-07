import * as R from "ramda";

export const map = fn => promise =>
  new Promise((res, rej) => promise.then(R.pipe(fn, res)).catch(rej));

export const do_ = fn => promise =>
  new Promise((res, rej) =>
    promise
      .then(r => {
        fn(r);
        res(r);
      })
      .catch(rej),
  );

export const flatMap = fn => promise =>
  new Promise((res, rej) =>
    promise
      .then(fn)
      .then(res)
      .catch(rej),
  );

export const fail = msg => new Promise((res, rej) => rej(msg));

export const perform = res => p => p.then(res);
export const attempt = (rej, res) => p => p.then(res).catch(rej);
