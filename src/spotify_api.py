import spotipy
from spotipy.oauth2 import SpotifyClientCredentials


class SpotifyAPI():


    def __init__(
        self,
        client_id: str,
        client_secret: str
    ) -> None:
        self.spotify_api = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(
            client_id=client_id,
            client_secret=client_secret
        ))



    def get_uri_list(
        self,
        track_items: dict
    ):
        res = []
        for tracks_item in track_items:
            res.append(tracks_item["track"]["uri"])
        return res



    def extract_meta(
        self,
        track_item: dict
    ):
        res = {}
        track = track_item["track"]
        res["url"] = track["external_urls"]["spotify"]
        res["id"] = track["id"]
        res["uri"] = track["uri"]
        res["title"] = track["name"]
        res["artists"] = track["artists"]
        res["images"] = track["album"]["images"]
        return res



    def get_meta_from_playlist(
        self,
        playlist_id: str
    ):
        res = []
        result = self.spotify_api.playlist(playlist_id=playlist_id, market="JP")
        tracks_items = result["tracks"]["items"]
        uri_list = self.get_uri_list(tracks_items)
        tracks_features = self.spotify_api.audio_features(tracks=uri_list)
        for track_item, track_features in zip(tracks_items, tracks_features):
            temp = self.extract_meta(track_item)
            temp["features"] = track_features
            res.append(temp)
        return res