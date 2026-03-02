# Mission Control v2

kal AI Operations Center - Business focused dashboard for managing Lone Star Lighting, RedFox CRM, and Heroes of the Meta.

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

## Environment Variables

Copy `.env.example` to `.env.local` and set the following secrets before running Mission Control:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public client for telemetry/realtime
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` – server-side admin key used by the vault API
- `VAULT_PIN` – 4+ digit PIN for unlocking the vault (default hidden)
- `VAULT_SESSION_TTL_HOURS` – optional session lifetime override (default 24h)

## Web Credential Vault Flow

1. Visit the **Systems → API Vault** view.
2. Enter the vault PIN to start a 24-hour encrypted session.
3. Add providers/accounts/fields; values are AES-256-GCM encrypted before storing in Supabase.
4. Use the reveal/copy/edit actions to retrieve credentials securely – everything is audited.
5. Click **Lock** to end the session immediately.

The new `/api/vault` route keeps the Supabase service role key on the server and never exposes decrypted values over the network without a valid session token.
