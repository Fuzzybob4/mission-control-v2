-- 001_create_extensions.sql
-- Step 1: Enable required PostgreSQL extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SELECT '✅ Extensions enabled' as status;
