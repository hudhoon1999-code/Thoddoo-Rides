import { useRouter } from 'expo-router';
import VehicleRegistrationScreen from '../../src/screens/Registration/VehicleRegistrationScreen';

export default function VehicleRoute() {
  const router = useRouter();
  return (
    <VehicleRegistrationScreen
      onComplete={() => router.replace('/registration/pending')}
    />
  );
}
