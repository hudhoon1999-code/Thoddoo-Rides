import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useDriverStore } from '../src/store/driverStore';

export default function Index() {
  const router = useRouter();
  const { driver, isApproved, isPendingApproval } = useDriverStore();

  useEffect(() => {
    const user = auth().currentUser;

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (!driver) {
      router.replace('/registration/profile');
      return;
    }

    if (isPendingApproval) {
      router.replace('/registration/pending');
      return;
    }

    if (isApproved) {
      router.replace('/(tabs)/home');
      return;
    }

    router.replace('/auth');
  }, [driver, isApproved, isPendingApproval]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1CC7C1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F4EC',
  },
});
