# Mission Control v2

Atlas AI Operations Center - Business focused dashboard for managing Lone Star Lighting, RedFox CRM, and Heroes of the Meta.

## Features

- **Overview**: All 3 businesses at a glance
- **Lone Star Lighting**: Holiday lighting business - leads, revenue, pipeline
- **RedFox CRM**: SaaS development tracker
- **Heroes of the Meta**: Trading cards (on hold)
- **Agent Network**: 13-agent hierarchy
- **Analytics**: Usage metrics
- **Systems**: Infrastructure status

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase

## Deployment

Connect to v0 or deploy directly to Vercel.

## Credential Vault & Telegram Ingestion

The `skills/credential-vault` module stores encrypted credentials in Supabase and now ships with a Telegram ingestion bot. Run it locally with:

```bash
pnpm telegram:ingest
```

Required environment variables:

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` – write access for the vault tables
- `TELEGRAM_BOT_TOKEN` – token for @KalObsidian_bot
- `TELEGRAM_ALLOWED_USER_IDS` (comma list) and optionally `TELEGRAM_ALLOWED_USERNAME`
- `VAULT_PIN` (defaults to 2846)

Flow:
1. Send `/addkey` to the bot
2. Provide provider name, account/environment, then `field=value` lines
3. Send `/done` to encrypt + store the credential bundle in Supabase

Scripts for setting up the Supabase tables live in `scripts/008_create_vault_tables.sql`.
