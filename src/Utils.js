export function pipe(x, fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}
