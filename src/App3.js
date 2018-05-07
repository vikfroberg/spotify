import React, { Fragment } from "react";
import { pipe } from "./Utils";
import { createProgram } from "amigos";
import { Type } from "burk";
import * as R from "ramda";
import * as Timeout from "./Timeout";
import Repos from "./Repos";
import Repo from "./Repo";

const Route = Type("Route", {
  Repos: [],
  Repo: ["repo"],
});

function init() {
  return {
    route: Route.Repos,
  };
}

const routeChange = route => model => ({
  ...model,
  route,
});

function View({ model, dispatch }) {
  return (
    <Timeout.Provider>
      {pipe(model.route, [
        Route.fold({
          Repos: () => (
            <Repos onRepoPress={R.pipe(Route.Repo, routeChange, dispatch)} />
          ),
          Repo: repo => <Repo url={repo.url} />,
        }),
      ])}
    </Timeout.Provider>
  );
}

export default createProgram(init, View);
