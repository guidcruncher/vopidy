CREATE TABLE IF NOT EXISTS playlist (
    playlist_id INTEGER PRIMARY_KEY,
    uri TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS playlist_items (
    id INTEGER PRIMARY_KEY,
    playlist TEXT NOT NULL,
    uri TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS playback_history (
  id INTEGER PRIMARY_KEY,
  source TEXT NOT NULL,
  uri TEXT NOT NULL,
  image TEXT NOT NULL,
  album TEXT NOT NULL,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  type TEXT NOT NULL,
  created DATETIME DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY_KEY,
  Source TEXT NOT NULL,
  uri TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  created DATETIME DEFAULT current_timestamp
);
