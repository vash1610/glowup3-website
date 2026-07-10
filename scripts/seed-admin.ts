/**
 * Create or update an admin_credentials row directly against Supabase.
 *
 * This replaces the old `/api/admin/setup-password` HTTP endpoint, which had
 * no authentication at all — anyone who found the URL could overwrite the
 * admin password. Creating/rotating the admin password is now a local-only
 * operation run with your own service-role key, never exposed over the network.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... EXPO_PUBLIC_SUPABASE_URL=... \
 *     npx tsx scripts/seed-admin.ts admin@example.com 'a-strong-password'
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/seed-admin.ts <email> <password>');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment before running this script.'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const passkeyHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase().trim();

  const { error } = await supabase
    .from('admin_credentials')
    .upsert(
      { email: normalizedEmail, passkey_hash: passkeyHash, is_active: true },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('Failed to seed admin credentials:', error.message);
    process.exit(1);
  }

  console.log(`Admin credentials set for ${normalizedEmail}.`);
}

main();
