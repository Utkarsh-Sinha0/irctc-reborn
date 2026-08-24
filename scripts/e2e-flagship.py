"""E2E verification of the flagship README demo: scenario threading + recovery + ticket gate.

NOTE: uses raw urllib.request.urlopen with a manual Cookie header.
(Deliberately NOT build_opener/CookieJar: Python's jar mangles localhost cookies and
default handlers can clobber a manually-set header. curl/browsers are unaffected.)
"""
import json
import sys
import time
import urllib.error
import urllib.request
import uuid

sys.stdout.reconfigure(encoding="utf-8")
BASE = "http://localhost:3113"
SC = "pay-fail-recover"
KEY = str(uuid.uuid4())
BID = str(uuid.uuid4())
COOKIE: dict[str, str] = {}


def call(path, obj=None):
    """Returns (status:int, body:dict|str). Captures Set-Cookie on every response."""
    headers = {"content-type": "application/json"}
    if COOKIE:
        headers["Cookie"] = "; ".join(f"{k}={v}" for k, v in COOKIE.items())
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(obj).encode() if obj is not None else None,
        headers=headers,
        method="POST" if obj is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            status, raw = r.status, r.read().decode()
            setc_list = r.headers.get_all("Set-Cookie") or []
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode()
        setc_list = e.headers.get_all("Set-Cookie") or []
    for setc in setc_list:  # read ALL Set-Cookie lines; later ones supersede earlier
        kv = setc.split(";", 1)[0]
        k, _, v = kv.partition("=")
        COOKIE[k.strip()] = v.strip()
    try:
        return status, json.loads(raw)
    except json.JSONDecodeError:
        return status, raw


ok = True

# 1. auth sets session cookie
s, body = call("/api/auth", {"personaId": "priya"})
print("auth:", s, body["data"]["personaId"], "| cookie captured:", "yatra_session" in COOKIE)
ok &= s == 200 and "yatra_session" in COOKIE

# 2. search with scenario threaded through
s, d = call(f"/api/search?from=PUNE&to=NDLS&date=2026-09-15&quota=TQ&scenario={SC}")
groups = d["data"]["groups"]
train = groups[0]["train"]["number"]
cls = groups[0]["availabilities"][0]["travelClass"]
print(f"search: {len(groups)} train(s); first={train} class={cls} bands={[a['confirmBandPct'] for a in groups[0]['availabilities']]}")
ok &= len(groups) > 0

# 3. fare page SSRs cleanly (audit-2 F2 fixed — no location-at-render crash)
s, html = call(f"/book/fare?persona=priya&train={train}&cls={cls}&date=2026-09-15&quota=TQ&ids=px1,px2&key={KEY}&scenario={SC}")
fare_ok = isinstance(html, str) and "Your fare, in full daylight" in html and 'id="cancelslider"' in html
print("fare page renders:", fare_ok)
ok &= fare_ok

# 4. payment attempt 1 under scripted scenario → AMBIGUOUS (F1 fix proven)
s, d = call(f"/api/pay?scenario={SC}", {"bookingId": BID, "idempotencyKey": KEY, "method": "IPAY"})
st1 = d["data"]["status"]
print("pay attempt 1:", st1)
ok &= st1 == "AMBIGUOUS"

# 5. sweep → TICKET_ISSUED
s, d = call(f"/api/pay/sweep?bookingId={BID}&idempotencyKey={KEY}")
st2 = d["data"]["status"]
print("sweep:", st2)
ok &= st2 == "TICKET_ISSUED"

# 6. ticket page celebrates only because cookie machine is TICKET_ISSUED (F4 fix)
time.sleep(0.2)
s, html = call(f"/book/ticket?persona=priya&key={KEY}&bookingId={BID}&ids=px1,px2&scenario={SC}")
celebrates = isinstance(html, str) and "CONFIRMED" in html and "Add to calendar" in html
print("ticket page celebrates:", celebrates)
ok &= celebrates

# 7. bogus booking → honest gate instead of fabricated celebration (F4)
s, html = call("/book/ticket?persona=x&key=nope&bookingId=bogus&ids=y")
gated = isinstance(html, str) and "No completed booking here yet" in html
print("ticket gate blocks bogus booking:", gated)
ok &= gated

print()
print("ALL E2E CHECKS PASS ✅" if ok else "FAILURES PRESENT ❌")
sys.exit(0 if ok else 1)
