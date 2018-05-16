import React from "react";
import * as R from "ramda";

export const liftAll = (f, [fx, ...fs]) =>
  fs.reduce((acc, fy) => acc.ap(fy), fx.map(f));

export const concatN = (n, xs) => ys =>
  n > 1 ? concatN(n - 1, [...xs, ...ys]) : [...xs, ...ys];

export function pipe(x, fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

export const renderToHoc = R.curry((RenderComponent, ComposedComponent) => {
  return props => (
    <RenderComponent>
      {renderProps => <ComposedComponent {...renderProps} {...props} />}
    </RenderComponent>
  );
});
