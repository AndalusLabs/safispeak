# 🔒 Veilige Supabase Setup

## Stap 1: Maak een .env file

Maak een `.env` file in de root van je project:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://zgrdjsqvgckpfntwdhri.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=je-echte-anon-key-hier
```

## Stap 2: Update config/supabase.ts

Vervang de hardcoded waarden in `config/supabase.ts`:

```typescript
import Constants from 'expo-constants';

export const SUPABASE_CONFIG = {
  url: Constants.expoConfig?.extra?.supabaseUrl || 'https://zgrdjsqvgckpfntwdhri.supabase.co',
  anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || 'your-anon-key-here',
};
```

## Stap 3: Update app.json

Voeg environment variables toe aan je `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

## Stap 4: Veiligheid

✅ `.env` staat al in `.gitignore` - wordt niet gecommit  
✅ Anon key is publiek veilig (alleen voor client-side)  
✅ Voor productie: gebruik Row Level Security (RLS) in Supabase  

## Waar vind je je Supabase anon key?

1. Ga naar [supabase.com](https://supabase.com)
2. Open je project
3. Ga naar Settings → API
4. Kopieer de "anon public" key

## ⚠️ Belangrijk

- De anon key is veilig voor client-side gebruik
- Gebruik Row Level Security (RLS) voor database beveiliging
- Nooit de service_role key in client-side code!
