# Signup Flow Setup Instructions

This document explains how to set up the Supabase authentication flow for the SafiSpeak app.

## Prerequisites

1. **Supabase Project**: You need a Supabase project set up
2. **Environment Variables**: Ensure your `.env` file has the correct Supabase credentials

## Database Setup

### 1. Run the Migration

Execute the SQL migration file to create the profiles table:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/001_create_profiles_table.sql
```

This migration will:
- Create the `profiles` table with minimal user data
- Set up Row Level Security (RLS) policies
- Create triggers for automatic profile creation
- Add GDPR compliance comments

### 2. Configure Authentication Providers

In your Supabase dashboard:

1. Go to **Authentication > Providers**
2. Enable the following providers:
   - **Email** (already enabled)
   - **Google** (configure with Google OAuth credentials)
   - **Apple** (configure with Apple OAuth credentials)

### 3. Configure OAuth Redirects

For social login to work, add these redirect URLs in Supabase:
- `exp://localhost:8081` (development)
- `your-app-scheme://` (production)

## Features Implemented

### ✅ Authentication Methods
- **Email + Password**: Traditional signup with email verification
- **Magic Link**: Passwordless authentication via email
- **Google OAuth**: Social login with Google
- **Apple OAuth**: Social login with Apple (iOS)

### ✅ Data Storage
- **Minimal User Data**: Only stores email and provider in `auth.users`
- **Profile Table**: Separate table for user profiles with `display_name`
- **GDPR Compliant**: No unnecessary personal data collection

### ✅ Session Management
- **Persistent Sessions**: Uses AsyncStorage for session persistence
- **Auto Refresh**: Tokens automatically refresh
- **Secure Storage**: Sessions stored securely on device

### ✅ User Experience
- **Success Messages**: "🎉 Safi! Your progress is saved."
- **Error Handling**: Network issues, email in use, etc.
- **Seamless Flow**: Returns to learning after signup

## File Structure

```
├── services/
│   └── authService.ts          # Supabase auth service
├── contexts/
│   └── AuthContext.tsx         # React context for auth state
├── components/
│   └── SignupModal.tsx         # Signup modal component
├── supabase/
│   └── migrations/
│       └── 001_create_profiles_table.sql
└── app/
    ├── _layout.tsx             # AuthProvider wrapper
    └── [id].tsx                # Integrated signup flow
```

## Usage

### In Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  if (isAuthenticated) {
    return <Text>Welcome, {user?.email}!</Text>;
  }
  
  return <Text>Please sign in</Text>;
}
```

### Direct Auth Service Usage

```typescript
import { AuthService } from '../services/authService';

// Sign up with email
const { data, error } = await AuthService.signUpWithEmail(email, password);

// Sign up with magic link
const { data, error } = await AuthService.signUpWithMagicLink(email);

// Social login
const { data, error } = await AuthService.signInWithGoogle();
```

## Security Features

- **Row Level Security**: Users can only access their own data
- **Automatic Profile Creation**: Profiles created on user signup
- **Session Persistence**: Secure token storage
- **GDPR Compliance**: Minimal data collection

## Next Steps

1. **Test the Flow**: Try all authentication methods
2. **Configure OAuth**: Set up Google and Apple OAuth credentials
3. **Customize UI**: Adjust the signup modal styling if needed
4. **Add Premium Features**: Extend for subscription logic
5. **Terms & Privacy**: Add actual Terms and Privacy Policy links

## Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**: Check OAuth redirect URLs in Supabase
2. **"Email already in use"**: User already has an account
3. **"Network error"**: Check internet connection and Supabase URL
4. **"Profile not found"**: Check if RLS policies are correct

### Debug Mode

Enable debug logging by adding this to your auth service:

```typescript
console.log('Auth state changed:', event, session);
```

## Support

For issues with this implementation, check:
1. Supabase dashboard logs
2. React Native debugger
3. Network requests in developer tools

