#!/bin/zsh
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd /Users/christian/.openclaw/workspace/mission-control-v2
set -a
source /Users/christian/.openclaw/workspace/mission-control-v2/.env.local
set +a
exec /opt/homebrew/bin/npx tsx bots/iris-discord-bridge.ts
