import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { useDriverStore } from '../../store/driverStore';

type VehicleType = 'motorcycle' | 'buggy';
type BuggySeats = 6 | 12;

const COLORS = {
  teal: '#1CC7C1',
  ocean: '#0E7490',
  coral: '#FF7A59',
  sand: '#F8F4EC',
  green: '#2F855A',
  white: '#FFFFFF',
  dark: '#0F172A',
  gray: '#64748B',
  lightGray: '#F1F5F9',
};

export default function VehicleRegistrationScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { driver } = useDriverStore();

  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [buggySeats, setBuggySeats] = useState<BuggySeats | null>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickVehiclePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) {
      setVehiclePhotoUri(result.assets[0].uri);
    }
  };

  const takeVehiclePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) {
      setVehiclePhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!vehicleType) return Alert.alert('Select a vehicle type');
    if (!plateNumber.trim()) return Alert.alert('Enter plate number');
    if (!vehicleModel.trim()) return Alert.alert('Enter vehicle model');
    if (vehicleType === 'buggy' && !buggySeats)
      return Alert.alert('Select buggy capacity');

    const uid = auth().currentUser?.uid;
    if (!uid) return;

    setIsLoading(true);
    try {
      let vehiclePhotoUrl = '';
      if (vehiclePhotoUri) {
        const ref = storage().ref(`drivers/${uid}/vehicle.jpg`);
        await ref.putFile(vehiclePhotoUri);
        vehiclePhotoUrl = await ref.getDownloadURL();
      }

      const vehicleData = {
        type: vehicleType,
        seats: vehicleType === 'buggy' ? buggySeats : 1,
        plateNumber: plateNumber.trim().toUpperCase(),
        model: vehicleModel.trim(),
        year: vehicleYear.trim(),
        color: vehicleColor.trim(),
        photo: vehiclePhotoUrl,
        approvalStatus: 'pending',
        registeredAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('drivers')
        .doc(uid)
        .update({ vehicle: vehicleData });

      onComplete();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Register Your Vehicle</Text>
        <Text style={styles.subtitle}>
          Add your vehicle details to start accepting rides
        </Text>
      </View>

      {/* Vehicle Type */}
      <Text style={styles.sectionLabel}>Vehicle Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeCard,
            vehicleType === 'motorcycle' && styles.typeCardActive,
          ]}
          onPress={() => {
            setVehicleType('motorcycle');
            setBuggySeats(null);
          }}
        >
          <Text style={styles.typeEmoji}>🛵</Text>
          <Text
            style={[
              styles.typeLabel,
              vehicleType === 'motorcycle' && styles.typeLabelActive,
            ]}
          >
            Motorcycle
          </Text>
          <Text style={styles.typeSubLabel}>1 passenger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeCard,
            vehicleType === 'buggy' && styles.typeCardActive,
          ]}
          onPress={() => setVehicleType('buggy')}
        >
          <Text style={styles.typeEmoji}>🚐</Text>
          <Text
            style={[
              styles.typeLabel,
              vehicleType === 'buggy' && styles.typeLabelActive,
            ]}
          >
            Golf Buggy
          </Text>
          <Text style={styles.typeSubLabel}>Multi-seat</Text>
        </TouchableOpacity>
      </View>

      {/* Buggy Seat Selection */}
      {vehicleType === 'buggy' && (
        <>
          <Text style={styles.sectionLabel}>Buggy Capacity</Text>
          <View style={styles.typeRow}>
            {([6, 12] as BuggySeats[]).map((seats) => (
              <TouchableOpacity
                key={seats}
                style={[
                  styles.seatCard,
                  buggySeats === seats && styles.seatCardActive,
                ]}
                onPress={() => setBuggySeats(seats)}
              >
                <Text style={styles.seatNumber}>{seats}</Text>
                <Text style={styles.seatLabel}>Seater</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Plate Number */}
      <Text style={styles.sectionLabel}>Plate Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. TH-1234"
        placeholderTextColor={COLORS.gray}
        value={plateNumber}
        onChangeText={setPlateNumber}
        autoCapitalize="characters"
      />

      {/* Model */}
      <Text style={styles.sectionLabel}>Vehicle Model</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Honda Wave 125"
        placeholderTextColor={COLORS.gray}
        value={vehicleModel}
        onChangeText={setVehicleModel}
      />

      {/* Year + Color row */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.sectionLabel}>Year</Text>
          <TextInput
            style={styles.input}
            placeholder="2022"
            placeholderTextColor={COLORS.gray}
            value={vehicleYear}
            onChangeText={setVehicleYear}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <View style={[styles.halfField, { marginLeft: 12 }]}>
          <Text style={styles.sectionLabel}>Color</Text>
          <TextInput
            style={styles.input}
            placeholder="White"
            placeholderTextColor={COLORS.gray}
            value={vehicleColor}
            onChangeText={setVehicleColor}
          />
        </View>
      </View>

      {/* Vehicle Photo */}
      <Text style={styles.sectionLabel}>Vehicle Photo</Text>
      {vehiclePhotoUri ? (
        <TouchableOpacity onPress={pickVehiclePhoto}>
          <Image
            source={{ uri: vehiclePhotoUri }}
            style={styles.vehiclePhoto}
            resizeMode="cover"
          />
          <Text style={styles.changePhoto}>Tap to change</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.photoButtons}>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={takeVehiclePhoto}
          >
            <Text style={styles.photoBtnIcon}>📸</Text>
            <Text style={styles.photoBtnLabel}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={pickVehiclePhoto}
          >
            <Text style={styles.photoBtnIcon}>🖼</Text>
            <Text style={styles.photoBtnLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          Your vehicle will be reviewed by Thoddoo Council before you can start
          accepting rides. This usually takes 1–2 hours.
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitLabel}>Register Vehicle →</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  typeCardActive: {
    borderColor: COLORS.teal,
    backgroundColor: '#F0FFFE',
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  typeLabelActive: {
    color: COLORS.teal,
  },
  typeSubLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  seatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  seatCardActive: {
    borderColor: COLORS.ocean,
    backgroundColor: '#EFF9FB',
  },
  seatNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ocean,
  },
  seatLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.dark,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
  },
  halfField: {
    flex: 1,
  },
  vehiclePhoto: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 6,
  },
  changePhoto: {
    textAlign: 'center',
    color: COLORS.teal,
    fontSize: 13,
    marginBottom: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderStyle: 'dashed',
  },
  photoBtnIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  photoBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.teal,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
