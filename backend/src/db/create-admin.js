import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--email") args.email = argv[i + 1];
    if (argv[i] === "--password") args.password = argv[i + 1];
  }
  return args;
}

async function main() {
  const { email, password } = parseArgs(process.argv.slice(2));

  if (!email || !password) {
    console.error("Usage: npm run create-admin -- --email you@example.com --password a-strong-password");
    process.exitCode = 1;
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("That does not look like a valid email address.");
    process.exitCode = 1;
    return;
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await pool.query(
      `INSERT INTO admins (email, password_hash) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [email.toLowerCase().trim(), passwordHash]
    );
    console.log(`Admin account ready for ${email}.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("create-admin failed:", err);
  process.exit(1);
});
