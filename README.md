# bugzeros-token-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/bugzeros/bugzeros-token-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/bugzeros/bugzeros-token-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar — a pre-token protocol launch radar. It reads the sealed DefiLlama snapshot (758 protocols, 2026-11-14), covers the whole 40-protocol watchlist, and adds 138 early pre-token protocols below the $50M floor. Every protocol is priced off the listed protocols in its own category (median FDV/TVL comparables computed from the snapshot on every run, never a flat multiple), adjusted for 7-day growth, age with no token, and chain count. Each row carries a concrete 6-step farm plan with cost and time. The dashboard is a static, no-network page: sortable board, search, category and chain filters, watchlist toggle, a detail view per protocol with the full model breakdown, and the comparables table the model is priced from.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=jw0ack1e&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
