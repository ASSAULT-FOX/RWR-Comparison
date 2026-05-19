#!/usr/bin/env python3
import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_URL = "http://rwr.runningwithrifles.com/rwr_stats/view_players.php"
DATABASE = "pacific"
PAGE_SIZE = 100
PLAYER_FIELDS = [
    ("leaderboard_position", int),
    ("username", str),
    ("kills", int),
    ("deaths", int),
    ("score", int),
    ("kd_ratio", float),
    ("time_played", "time"),
    ("longest_kill_streak", int),
    ("targets_destroyed", int),
    ("vehicles_destroyed", int),
    ("soldiers_healed", int),
    ("teamkills", int),
    ("distance_moved", "distance"),
    ("shots_fired", int),
    ("throwables_thrown", int),
    ("xp", int),
]


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = []
        self._in_tr = False
        self._in_cell = False
        self._cell_parts = []
        self._row = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == "tr":
            self._in_tr = True
            self._row = []
        elif tag in ("td", "th") and self._in_tr:
            self._in_cell = True
            self._cell_parts = []

    def handle_data(self, data):
        if self._in_cell:
            self._cell_parts.append(data)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ("td", "th") and self._in_cell:
            text = "".join(self._cell_parts).strip()
            self._row.append(unescape(text))
            self._in_cell = False
            self._cell_parts = []
        elif tag == "tr" and self._in_tr:
            if self._row:
                self.rows.append(self._row)
            self._in_tr = False
            self._row = []


def parse_time(value):
    match = re.match(r"(?:(?P<h>\d+)h(?:\s+)?)?(?:(?P<m>\d+)m(?:in)?(?:\s+)?)?(?:(?P<s>\d+)s)?", value or "")
    if not match:
        return None
    parts = match.groupdict()
    return int(parts["s"] or 0) + int(parts["m"] or 0) * 60 + int(parts["h"] or 0) * 3600


def decode_username(value):
    try:
        raw = value.encode("iso-8859-1")
    except UnicodeEncodeError:
        return value
    raw = raw.replace(b"\xa0", b" ")
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError as error:
        decoded = raw.decode("utf-8", errors="replace")
        print(f"Warning: replaced invalid UTF-8 bytes in username {ascii(value)}: {error}", file=sys.stderr, flush=True)
        return decoded


def parse_value(value, kind):
    value = (value or "").strip()
    if kind is str:
        return decode_username(value)
    if not value or value == "-":
        return None
    if kind == "time":
        return parse_time(value)
    if kind == "distance":
        return float(value.replace("km", "").strip())
    if kind is int:
        return int(value.replace(",", ""))
    if kind is float:
        return float(value.replace(",", ""))
    return value


def decode_response(raw):
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError as error:
        decoded = raw.decode("utf-8", errors="replace")
        print(f"Warning: replaced invalid UTF-8 bytes in response body: {error}", file=sys.stderr, flush=True)
        return decoded


def fetch_page(start, size, timeout):
    query = urlencode({
        "db": DATABASE,
        "sort": "score",
        "start": start,
        "size": size,
    })
    url = f"{BASE_URL}?{query}"
    request = Request(url, headers={
        "User-Agent": "RWR-Parameters-Query-GitHub-Actions",
        "Connection": "close",
        "Accept-Encoding": "identity",
    })
    last_error = None
    for attempt in range(1, 4):
        try:
            with urlopen(request, timeout=timeout) as response:
                return decode_response(response.read())
        except Exception as error:
            last_error = error
            if attempt < 3:
                time.sleep(attempt * 2)
    raise last_error


def parse_players(html):
    parser = TableParser()
    parser.feed(html)
    players = []
    for row in parser.rows:
        if not row or not row[0].strip().lstrip("-").isdigit():
            continue
        if len(row) < len(PLAYER_FIELDS):
            continue
        player = {}
        for index, (name, kind) in enumerate(PLAYER_FIELDS):
            value = row[index] if name == "username" else " ".join(row[index].split())
            player[name] = parse_value(value, kind)
        players.append(player)
    return players


def self_test():
    cjk_name = "\u73a9\u5bb6\u6d4b\u8bd5\u7532\u7532QAQ"
    cjk_name_mojibake = cjk_name.encode("utf-8").decode("iso-8859-1")
    cedilla_name = "PLAYER D1KE\u00c7"
    cedilla_name_mojibake = cedilla_name.encode("utf-8").decode("iso-8859-1")
    samples = {
        cjk_name_mojibake: cjk_name,
        cedilla_name_mojibake: cedilla_name,
        "ASCII.NAME": "ASCII.NAME",
        "\u5df2\u7ecf\u662f Unicode": "\u5df2\u7ecf\u662f Unicode",
    }
    for source, expected in samples.items():
        actual = decode_username(source)
        if actual != expected:
            raise AssertionError(f"decode_username({source!r}) returned {actual!r}, expected {expected!r}")

    html = f"""
    <table>
      <tr><th>#</th><th>Username</th><th>Kills</th><th>Deaths</th><th>Score</th><th>K/D</th><th>Time</th><th>Streak</th><th>Targets</th><th>Vehicles</th><th>Healed</th><th>TK</th><th>Distance</th><th>Shots</th><th>Throwables</th><th>XP</th></tr>
      <tr><td>1</td><td>{cjk_name_mojibake} &amp; MR.&nbsp;A</td><td>1</td><td>2</td><td>3</td><td>0.5</td><td>1h 2min 3s</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9km</td><td>10</td><td>11</td><td>12</td></tr>
    </table>
    """
    player = parse_players(html)[0]
    if player["username"] != f"{cjk_name} & MR. A":
        raise AssertionError(f"username parse returned {player['username']!r}")
    if player["time_played"] != 3723 or player["distance_moved"] != 9.0:
        raise AssertionError("numeric parsing regression")


def fetch_all_players(max_pages=None, timeout=60, delay=0.25):
    players = []
    start = 0
    page = 0
    while True:
        print(f"Fetching offset {start}...", flush=True)
        page_players = parse_players(fetch_page(start, PAGE_SIZE, timeout))
        print(f"Fetched {len(page_players)} players at offset {start}", flush=True)
        if not page_players:
            break
        players.extend(page_players)
        if len(page_players) < PAGE_SIZE:
            break
        page += 1
        if max_pages is not None and page >= max_pages:
            break
        start += PAGE_SIZE
        if delay > 0:
            time.sleep(delay)
    return players


def main():
    parser = argparse.ArgumentParser(description="Fetch Pacific RWR player stats into a static JSON file.")
    parser.add_argument("--output", default="data/rwr-players-pacific.json")
    parser.add_argument("--max-pages", type=int, default=None)
    parser.add_argument("--timeout", type=float, default=120)
    parser.add_argument("--delay", type=float, default=0.5)
    parser.add_argument("--self-test", action="store_true", help="Run parser and username decoding checks without fetching.")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        print("Self-test passed")
        return 0

    players = fetch_all_players(max_pages=args.max_pages, timeout=args.timeout, delay=args.delay)
    output = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": f"{BASE_URL}?db={DATABASE}",
        "database": DATABASE,
        "count": len(players),
        "players": players,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {output_path} with {len(players)} Pacific players")
    return 0


if __name__ == "__main__":
    sys.exit(main())
