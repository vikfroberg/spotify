import React, { Fragment } from "react";
import Search from "./pages/search";
import Artist from "./pages/artist";
import Album from "./pages/album";
import Label from "./pages/label";
import List from "./pages/list";
import NotFound from "./pages/not-found";
import Login from "./pages/login";
import AccessToken from "./pages/access-token";
import RemoteData from "./data/remote-data";
import LocalStorage from "./components/local-storage";
import qs from "query-string";
import * as R from "ramda";
import { pipe } from "./utils/helpers";
import { trace } from "./utils/debug";
import "./index.css";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
} from "react-router-dom";

const psyList = {
  id: 1,
  name: "Darkpsy",
  artistIds: [],
  labels: [],
};

const initialState = {
  lists: [psyList],
  remoteToken: RemoteData.NotAsked,
};

class App extends React.Component {
  tokenSuccess = token => {
    this.props.setStore({
      remoteToken: RemoteData.Success(token),
    });
  };
  tokenFailure = err => {
    this.props.setStore({
      remoteToken: RemoteData.Failure(err),
    });
  };
  tokenExpired = () => {
    this.props.setStore({
      remoteToken: RemoteData.NotAsked,
    });
  };
  artistAddListClick = (listId, artistId) => {
    this.props.setStore(state => ({
      lists: state.lists.map(
        R.when(R.propEq("id", listId), list => ({
          ...list,
          artistIds: [...list.artistIds, artistId],
        })),
      ),
    }));
  };
  artistRemoveListClick = (listId, artistId) => {
    this.props.setStore(state => ({
      lists: state.lists.map(
        R.when(R.propEq("id", listId), list => ({
          ...list,
          artistIds: list.artistIds.filter(x => x !== artistId),
        })),
      ),
    }));
  };
  labelAddListClick = (listId, label) => {
    this.props.setStore(state => ({
      lists: state.lists.map(
        R.when(R.propEq("id", listId), list => ({
          ...list,
          labels: [...list.labels, label],
        })),
      ),
    }));
  };
  labelRemoveListClick = (listId, label) => {
    this.props.setStore(state => ({
      lists: state.lists.map(
        R.when(R.propEq("id", listId), list => ({
          ...list,
          labels: list.labels.filter(x => x !== label),
        })),
      ),
    }));
  };
  render() {
    return (
      <Router>
        {pipe(this.props.store.remoteToken, [
          RemoteData.fold({
            Success: token => (
              <Fragment>
                <Link to="/search">Search</Link>
                {this.props.store.lists.map(list => (
                  <Link key={list.id} to={`/lists/${list.id}`}>
                    {list.name}
                  </Link>
                ))}
                <Switch>
                  <Redirect exact from="/" to="/search" />
                  <Route
                    path="/lists/:id"
                    render={props => (
                      <List
                        list={this.props.store.lists.find(
                          l => l.id === parseInt(props.match.params.id, 10),
                        )}
                        token={token}
                        onTokenExpire={this.tokenExpired}
                      />
                    )}
                  />
                  <Route
                    path="/search"
                    render={props => (
                      <Search token={token} onTokenExpire={this.tokenExpired} />
                    )}
                  />
                  <Route
                    path="/artists/:id"
                    render={props => (
                      <Artist
                        id={props.match.params.id}
                        token={token}
                        lists={this.props.store.lists}
                        onTokenExpire={this.tokenExpired}
                        onAddListClick={this.artistAddListClick}
                        onRemoveListClick={this.artistRemoveListClick}
                      />
                    )}
                  />
                  <Route
                    path="/albums/:id"
                    render={props => (
                      <Album
                        id={props.match.params.id}
                        token={token}
                        onTokenExpire={this.tokenExpired}
                      />
                    )}
                  />
                  <Route
                    path="/label"
                    render={props => (
                      <Label
                        name={qs.parse(props.location.search)["name"]}
                        token={token}
                        onTokenExpire={this.tokenExpired}
                        lists={this.props.store.lists}
                        onAddListClick={this.labelAddListClick}
                        onRemoveListClick={this.labelRemoveListClick}
                      />
                    )}
                  />
                  <Route component={NotFound} />
                </Switch>
              </Fragment>
            ),
            _: () => (
              <Switch>
                <Route
                  exact
                  path="/access-token"
                  render={props => (
                    <AccessToken
                      onSuccess={this.tokenSuccess}
                      onFailure={this.tokenFailure}
                      location={props.location}
                    />
                  )}
                />
                <Route exact path="/login" render={props => <Login />} />
                <Redirect to="/login" />
              </Switch>
            ),
          }),
        ])}
      </Router>
    );
  }
}

export default props => (
  <LocalStorage initialState={initialState}>
    {props => <App {...props} />}
  </LocalStorage>
);
