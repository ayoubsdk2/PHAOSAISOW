UPDATE auth.users
SET encrypted_password = crypt('Evangelizor1981!', gen_salt('bf')),
    updated_at = now()
WHERE lower(email) = 'daniel@phaosai.com';