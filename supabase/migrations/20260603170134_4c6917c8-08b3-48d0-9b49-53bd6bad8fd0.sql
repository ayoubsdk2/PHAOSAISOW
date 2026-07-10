CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE auth.users
SET encrypted_password = extensions.crypt('Ayoub123??', extensions.gen_salt('bf')),
    updated_at = now()
WHERE lower(email) = 'seddayoub77@gmail.com';