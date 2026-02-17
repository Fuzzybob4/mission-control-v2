# Night Bot Path Reference Notes

## Status
As of February 16, 2026 - No night bot files were found in the mission-control-v2 directory.

## Path Migration Checklist
If night bot files exist outside this repository or are added later, ensure the following path updates are made:

### Common Path References to Update
1. **Hardcoded paths in scripts:**
   - Change `~/mission-control/` to `~/mission-control-v2/`
   - Change `./mission-control/` to `./mission-control-v2/`
   - Change `C:\mission-control\` to `C:\mission-control-v2\`

2. **Cron job paths:**
   ```bash
   # Old
   0 2 * * * cd /home/user/mission-control && python night_bot.py
   
   # New
   0 2 * * * cd /home/user/mission-control-v2 && python night_bot.py
   ```

3. **Configuration files:**
   - `.env` files
   - Service configuration files
   - Docker compose files
   - systemd service files

4. **Import statements:**
   ```python
   # Old
   from mission_control.config import settings
   
   # New
   from mission_control_v2.config import settings
   ```

## Verification Script
When night bot files are added, run this verification:
```bash
grep -r "mission-control[^-]" --include="*.py" --include="*.sh" --include="*.ps1" .
grep -r "mission_control[^_v2]" --include="*.py" .
```

## Current Repository Structure
```
mission-control-v2/
├── app/
├── components/
│   ├── tabs/
│   ├── ui/
│   ├── api-key-vault.tsx
│   └── skill-registry.tsx
├── docs/
│   └── skills/
│       └── telegram-bot-api.md
├── lib/
└── [other files]
```

## Note
If night bot functionality is needed, consider implementing it as:
1. A scheduled Supabase Edge Function
2. A Vercel Cron Job
3. A GitHub Action workflow
4. A local scheduled task with updated paths
