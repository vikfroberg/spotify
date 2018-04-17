import axios from "axios";

// const CLIENT_SECRET = "0407c924f6684b10902887a85a4b54b8";

const CLIENT_ID = "ba714a6f875d4b329119327b37125d07";

const CLIENT_SCOPE = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
].join(" ");

const AUTH_QUERY = [
  "response_type=token",
  `client_id=${CLIENT_ID}`,
  `scope=${CLIENT_SCOPE}`,
  "redirect_uri=http://localhost:3000/",
].join("&");

export const AUTH_URL = "https://accounts.spotify.com/authorize?" + AUTH_QUERY;

export function getTopArtists(token) {
  return axios.get("https://api.spotify.com/v1/me/top/artists?limit=50", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
