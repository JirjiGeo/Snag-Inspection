const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const outputPath = process.env.SUPABASE_CONFIG_OUTPUT || path.join(__dirname, '..', 'supabase-config.js');

if (!supabaseUrl || !supabaseAnonKey) {
  if (fs.existsSync(outputPath)) {
    console.log('Supabase config already exists. Skipping generated config.');
    process.exit(0);
  }

  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');
  process.exit(1);
}

const config = `window.SUPABASE_CONFIG = {\n  url: ${JSON.stringify(supabaseUrl)},\n  anonKey: ${JSON.stringify(supabaseAnonKey)}\n};\n\nlet supabaseClient = null;\n\nfunction initializeSupabaseClient() {\n  if (typeof supabase !== 'undefined' && supabase.createClient) {\n    const { createClient } = supabase;\n    supabaseClient = window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey\n      ? createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)\n      : null;\n    window.supabaseClient = supabaseClient;\n    return true;\n  }\n\n  return false;\n}\n\nif (!initializeSupabaseClient()) {\n  const checkLibrary = setInterval(() => {\n    if (initializeSupabaseClient()) {\n      clearInterval(checkLibrary);\n    }\n  }, 100);\n}\n`;

fs.writeFileSync(outputPath, config, 'utf8');
console.log(`Created Supabase config at ${outputPath}`);