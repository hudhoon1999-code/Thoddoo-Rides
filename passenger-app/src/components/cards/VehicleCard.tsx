// passenger-app/src/components/cards/VehicleCard.tsx
// ============================================================
// VEHICLE CARD — Animated selection card for ride type
// ============================================================

import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { VehicleType } from '../../types';

interface VehicleInfo {
  type: VehicleType;
  label: string;
  seats: string;
  priceRange: string;
  eta: string;
  emoji: string;
  tagline: string;
}

interface VehicleCardProps {
  vehicle: VehicleInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    onSelect();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isSelected ? Shadows.tealGlow : Shadows.sm,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {isSelected && (
          <LinearGradient
            colors={['rgba(28,199,193,0.08)', 'rgba(14,116,144,0.05)']}
            style={StyleSheet.absoluteFill}
            borderRadius={Radii.card}
          />
        )}

        <View style={styles.content}>
          {/* Left: emoji + info */}
          <View style={styles.left}>
            <View style={[styles.emojiContainer, isSelected && styles.emojiContainerSelected]}>
              <Text style={styles.emoji}>{vehicle.emoji}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.label}>{vehicle.label}</Text>
              <Text style={styles.seats}>{vehicle.seats}</Text>
              <Text style={styles.tagline}>{vehicle.tagline}</Text>
            </View>
          </View>

          {/* Right: price + ETA */}
          <View style={styles.right}>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              {vehicle.priceRange}
            </Text>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>⏱ {vehicle.eta}</Text>
            </View>
          </View>
        </View>

        {/* Selected indicator */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: Colors.lagoonTeal,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainerSelected: {
    backgroundColor: 'rgba(28,199,193,0.12)',
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  label: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  seats: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagline: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.xs,
    color: Colors.lagoonTeal,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  price: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  priceSelected: {
    color: Colors.deepOcean,
  },
  etaBadge: {
    backgroundColor: 'rgba(28,199,193,0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  etaText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.xs,
    color: Colors.deepOcean,
  },
  selectedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.lagoonTeal,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  selectedText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: Colors.white,
  },
});
