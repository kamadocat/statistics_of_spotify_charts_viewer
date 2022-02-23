import os
from pathlib import Path
from spotify_api import SpotifyAPI
import json
from datetime import date
import time

MAX_TRIAL = 3



if __name__ == "__main__":
    SPOTIFY_API_CLIENT_ID = os.environ["SPOTIFY_API_CLIENT_ID"]
    SPOTIFY_API_CLIENT_SECRET = os.environ["SPOTIFY_API_CLIENT_SECRET"]
    CONF_FILE_NAME = "playlists_config.json"
    DAILY_CONF_PATH = Path(__file__).resolve().parent.parent.joinpath("config", "daily", CONF_FILE_NAME)
    WEEKLY_CONF_PATH = Path(__file__).resolve().parent.parent.joinpath("config", "weekly", CONF_FILE_NAME)
    TODAY = str(date.today())

    api = SpotifyAPI(
        client_id=SPOTIFY_API_CLIENT_ID,
        client_secret=SPOTIFY_API_CLIENT_SECRET
    )
    for config_path in [DAILY_CONF_PATH, WEEKLY_CONF_PATH]:
        # if config_path == WEEKLY_CONF_PATH and not(date.today().weekday() == 4): # もし金曜日以外だったらWEEKLYはとばす｡
        #     continue
        config_list = None
        with open(config_path, mode='r') as f:
            config_list = json.load(f)

        for config in config_list:
            __id = config["id"]
            __url = config["url"]
            __name = config["name"]
            _country = config["Country"]
            res = None
            for _ in range(MAX_TRIAL):
                try:
                    res = api.get_meta_from_playlist(playlist_id=__id)
                    break
                except Exception as e:
                    print(e)
                    time.sleep(1)
                    continue
            if res is None:
                raise RuntimeError
            file_name = __id + ".json"
            if not os.path.isdir(Path(__file__).resolve().parent.parent.joinpath("data", TODAY)):
                os.mkdir(Path(__file__).resolve().parent.parent.joinpath("data", TODAY))
            with open(Path(__file__).resolve().parent.parent.joinpath("data", TODAY, file_name), mode='w') as f:
                json.dump(res, f, indent=4)
            with open(Path(__file__).resolve().parent.parent.joinpath("data", "latest", file_name), mode='w') as f:
                json.dump(res, f, indent=4)