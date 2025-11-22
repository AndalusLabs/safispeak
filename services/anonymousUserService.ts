import * as Crypto from 'expo-crypto';
import { createClient } from '@supabase/supabase-js';
import Purchases from 'react-native-purchases';
import { supabaseAnonKey, supabaseUrl } from '../config/supabase';

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * Generates a UUID v4 compatible string
 */
function generateUUID(): string {
  // Generate random hex string
  const randomHex = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${randomHex()}${randomHex()}-${randomHex()}-4${randomHex().substring(1)}-${(Math.floor(Math.random() * 4) + 8).toString(16)}${randomHex().substring(1)}-${randomHex()}${randomHex()}${randomHex()}`;
}

/**
 * Creates an anonymous user and logs them into RevenueCat
 * @returns The generated anonymous userId
 */
export async function createAnonymousUser(): Promise<string> {
  try {
    // 1. Generate a random userId (UUID v4 format)
    const userId = generateUUID();

    // 2. Log in to RevenueCat with this userId
    await Purchases.logIn(userId);
    console.log('Logged into RevenueCat with userId:', userId);
    
    // Get RevenueCat customer info for verification
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('RevenueCat customer info:', {
      originalAppUserId: customerInfo.originalAppUserId,
      entitlements: Object.keys(customerInfo.entitlements.active),
    });

    // 3. Save user anonymously in profiles table
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        is_anonymous: true,
        display_name: null,
        username: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating anonymous user in Supabase:', error);
      throw error;
    }

    console.log('Anonymous user created successfully in profiles:', userId);
    return userId;
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    throw error;
  }
}

