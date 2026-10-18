#!/usr/bin/env bash
set -euo pipefail

test_root=$(mktemp -d)
export WEREAD_SMOKE_PROFILE="$test_root/profile"
export WEREAD_SMOKE_RESULTS="${WEREAD_SMOKE_RESULTS:-$PWD/menu-bar-test-results}"
mkdir -p "$WEREAD_SMOKE_RESULTS"

icewm > "$WEREAD_SMOKE_RESULTS/icewm.log" 2>&1 &
wm_pid=$!
cleanup() {
  kill "$wm_pid" 2>/dev/null || true
  rm -rf "$test_root"
}
trap cleanup EXIT

for attempt in $(seq 1 50); do
  if xprop -root _NET_SUPPORTING_WM_CHECK | grep -q 'window id'; then break; fi
  sleep 0.1
done
xprop -root _NET_SUPPORTING_WM_CHECK | grep -q 'window id'

for phase in default hidden shown; do
  export WEREAD_SMOKE_PHASE="$phase"
  timeout 70s node_modules/.bin/electron scripts/menu-bar-smoke.js \
    2>&1 | tee "$WEREAD_SMOKE_RESULTS/$phase.log"
done
