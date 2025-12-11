-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Seed the User (Kayla Davis)
DO $$
DECLARE
  new_user_id uuid := uuid_generate_v4();
BEGIN
  -- Only insert if the user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lamar.com') THEN
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@lamar.com',
      crypt('password123', gen_salt('bf')), -- Hashes the password 'password123'
      now(), -- Auto-confirm the email
      '{"provider":"email","providers":["email"]}',
      '{"name":"Kayla Davis"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Create an identity for the user (required for Supabase Auth to work properly)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      format('{"sub":"%s","email":"admin@lamar.com"}', new_user_id)::jsonb,
      'email',
      new_user_id, -- For email provider, provider_id is usually the user_id
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'User admin@lamar.com created successfully.';
  ELSE
    RAISE NOTICE 'User admin@lamar.com already exists.';
  END IF;
END $$;
