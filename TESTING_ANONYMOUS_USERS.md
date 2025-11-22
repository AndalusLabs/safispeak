# Testing Anonymous Users

## Test Flow

### Stap 1: Start de app
```bash
npm start
# Of: expo start
```

### Stap 2: Volg deze flow in de app

1. **Start Les 1** (via onboarding flow)
2. **Voltooi alle flashcards** (swipe door alle flashcards)
3. **Voltooi alle vragen** (beantwoord alle quiz vragen)
4. **Na het einde van les 1** → Je ziet de **AccountPromptScreen**
5. **Klik op "Continue without account"** → Paywall wordt getoond
6. **Accepteer de paywall** (koop een subscription in RevenueCat test mode)

### Stap 3: Check de console logs

In je terminal/simulator console zou je moeten zien:

```
Anonymous user created and logged into RevenueCat: <uuid>
Logged into RevenueCat with userId: <uuid>
RevenueCat customer info: { originalAppUserId: '<uuid>', entitlements: [...] }
Anonymous user created successfully in profiles: <uuid>
```

### Stap 4: Verifieer in Supabase

1. Ga naar je Supabase Dashboard
2. Open **Table Editor** → **profiles**
3. Zoek naar een record met:
   - `is_anonymous = true`
   - `id` = de UUID die je in de console zag
   - `created_at` = recent timestamp

**SQL Query om te checken:**
```sql
SELECT * FROM profiles 
WHERE is_anonymous = true 
ORDER BY created_at DESC 
LIMIT 5;
```

### Stap 5: Verifieer in RevenueCat

1. Ga naar je RevenueCat Dashboard
2. Open **Customers**
3. Zoek naar de UUID die je in de console zag
4. Check of de customer bestaat en premium entitlements heeft

## Troubleshooting

### Geen anonieme gebruiker aangemaakt?

**Check:**
- ✅ Is `skippedAccount = true`? (check console logs)
- ✅ Is `isAuthenticated = false`? (check console logs)
- ✅ Is de paywall succesvol geaccepteerd? (`purchased = true`)
- ✅ Zijn er errors in de console?

### Error: "Error creating anonymous user in Supabase"

**Mogelijke oorzaken:**
1. **RLS Policy probleem**: Check of de migratie `004_add_anonymous_support_to_profiles.sql` correct is uitgevoerd
2. **Foreign key constraint**: Check of de foreign key constraint is verwijderd
3. **Network error**: Check je internet connectie

**Fix:**
```sql
-- Check of de foreign key constraint bestaat
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- Als de constraint nog bestaat, verwijder hem:
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
```

### Error: "RevenueCat login failed"

**Mogelijke oorzaken:**
1. RevenueCat SDK niet correct geconfigureerd
2. Network error

**Fix:**
- Check of `RevenueCatSetup` component wordt geladen in `app/_layout.tsx`
- Check of de API keys correct zijn in `revenuecat.js`

## Test Checklist

- [ ] App start zonder errors
- [ ] Les 1 kan worden voltooid
- [ ] AccountPromptScreen verschijnt na les 1
- [ ] "Continue without account" werkt
- [ ] Paywall wordt getoond
- [ ] Paywall kan worden geaccepteerd
- [ ] Console logs tonen anonieme gebruiker creatie
- [ ] Supabase `profiles` tabel bevat nieuwe record met `is_anonymous = true`
- [ ] RevenueCat dashboard toont nieuwe customer
- [ ] Geen errors in console


