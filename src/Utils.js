export function pipe(x, fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

export const trace = x => {
  console.log(x);
  return x;
};
