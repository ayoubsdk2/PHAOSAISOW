CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE auth.users
SET encrypted_password = extensions.crypt('Evangelizor1981!', extensions.gen_salt('bf')),
    updated_at = now()
WHERE lower(email) = 'daniel@phaosai.com';