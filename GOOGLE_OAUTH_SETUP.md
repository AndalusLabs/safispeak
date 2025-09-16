# Google OAuth Setup voor Expo

## 1. Environment Variables

Voeg toe aan je `.env` bestand (of maak het aan):

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 2. Google Cloud Console Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Selecteer je project of maak een nieuwe aan
3. Ga naar **APIs & Services → Credentials**
4. Klik op **Create Credentials → OAuth 2.0 Client IDs**
5. Kies **Web application**
6. Voeg toe aan **Authorized redirect URIs**:
   - `https://auth.expo.io/@your-expo-username/safispeak`
   - (Vervang `your-expo-username` met je Expo username)

## 3. Expo Auth Proxy

De app gebruikt `useProxy: true` wat automatisch een `https://auth.expo.io` redirect URI genereert. Dit is de juiste manier voor Expo apps.

## 4. Test de Redirect URI

1. Start de app: `npx expo start`
2. Klik op "Continue with Google" 
3. Check de console logs voor de gegenereerde redirect URI
4. Kopieer die URI en voeg toe aan Google Cloud Console

## 5. Test

1. Start de app: `npx expo start`
2. Ga naar de motivation screen
3. Klik op "Continue with Google"
4. De Google login zou moeten openen in een browser
5. Na login kom je terug in de app

## Troubleshooting

- De redirect URI wordt automatisch gegenereerd door Expo
- Controleer de console logs voor de exacte redirect URI
- Zorg dat de Google Client ID correct is ingesteld
- Check dat de redirect URI exact overeenkomt in Google Cloud Console
