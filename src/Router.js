import React from "react";
import * as Login from "./Login";
import { Type } from "burk";
import { pipe } from "./Utils";
import { Cmd } from "./Elm";

// MSG

const Msg = Type("Router.Msg", {
  Login: ["msg"],
  // Artists: ["msg"],
  // Tracks: ["msg"],
});

const Page = Type("Router.Model", {
  Login: ["model"],
  // Artists: ["model"],
  // Tracks: ["model"],
});

// MODEL
const mapBoth = (page, msg, x) => [page(x[0]), Cmd.map(msg, x[1])];

export const init = () => {
  const login = Login.init();
  return mapBoth(Page.Login, Page.Msg, login);
};

// UPDATE

export const update = ([model, commands]) =>
  Msg.fold({
    Login: subMsg =>
      pipe(
        model,
        Page.fold({
          Login: subModel => {
            const [loginModel, loginCommands, maybeToken] = Login.update(
              [subModel, commands],
              subMsg,
            );
            return mapBoth(Page.Login, Msg.Login, [loginModel, loginCommands]);
          },
          _: () => [model, commands],
        }),
      ),
  });

// VIEW

export function View({ model }) {
  return (
    <div>
      {pipe(model, [
        Page.fold({
          Login: model => <Login.View model={model} />,
        }),
      ])}
    </div>
  );
}
