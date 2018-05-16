import React from "react";
import * as R from "ramda";

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
