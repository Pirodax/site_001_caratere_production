import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Charger les variables d'environnement depuis .env.local
config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const userId = process.argv[2];
const newPassword = process.argv[3];

if (!userId || !newPassword) {
  console.log("Usage: node scripts/set-password.mjs <userId> <newPassword>");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey);

const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: newPassword,
});

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

console.log("OK. Updated user:", data.user.id);


//Utilisation :Caracteres2015?
//cd 001_app
//node scripts/set-password.mjs "<USER_UUID>" "NouveauMotDePasse123!"