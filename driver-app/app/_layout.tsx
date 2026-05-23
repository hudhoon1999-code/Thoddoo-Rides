import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import auth from '@react-native-firebase/auth';
import { useDriverStore } from '../src/store/driverStore';
import { fetchDriverProfile, checkDriverExists } from '../src/services/driverAuthService';

import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setDriver, reset } = useDriverStore();
  const [ready, setReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Jakarta': PlusJakartaSans_400Regular,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-SemiBold': PlusJakartaSans_600SemiBold,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Jakarta-ExtraBold': PlusJakartaSans_800ExtraBold,
    'Sora': Sora_400Regular,
    'Sora-SemiBold': Sora_600SemiBold,
    'Sora-Bold': Sora_700Bold,
    'Mono': JetBrainsMono_400Regular,
    'Mono-Medium': JetBrainsMono_500Medium,
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const exists = await checkDriverExists(user.uid);
        if (exists) {
          const profile = await fetchDriverProfile(user.uid);
          if (profile) setDriver(profile);
        }
      } else {
        reset();
      }
      setReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, ready]);

  if (!ready || (!fontsLoaded && !fontError)) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="registration/profile" />
        <Stack.Screen name="registration/documents" />
        <Stack.Screen name="registration/vehicle" />
        <Stack.Screen name="registration/pending" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
