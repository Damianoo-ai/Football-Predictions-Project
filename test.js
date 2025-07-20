import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.SPORTMONKS_API_KEY;

if (!apiKey) {
  console.error('❌ ERRORE: SPORTMONKS_API_KEY non trovata');
  process.exit(1);
} else {
  console.log('✅ SPORTMONKS_API_KEY caricata correttamente:');
  console.log(apiKey);
}
