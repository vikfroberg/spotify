import * as R from "ramda";

export const map = fn => promise =>
  new Promise((res, rej) => promise.then(R.pipe(fn, res)).catch(rej));

export const flatMap = fn => promise => promise.then(fn);

export const fail = msg => new Promise((res, rej) => rej(msg));

export const fold = res => rej => p => p.then(res).catch(rej);
