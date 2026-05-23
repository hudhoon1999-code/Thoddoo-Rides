import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { tokens } from '../../src/theme/tokens';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,244,236,0.96)' }]} />
          ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="home"       options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home"       focused={focused} /> }} />
      <Tabs.Screen name="events"     options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎉" label="Events"     focused={focused} /> }} />
      <Tabs.Screen name="activities" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌊" label="Activities" focused={focused} /> }} />
      <Tabs.Screen name="profile"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile"    focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', backgroundColor: 'transparent',
    borderTopWidth: 0, elevation: 0,
    height: Platform.OS === 'ios' ? 82 : 68,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 },
  },
  tabItem:      { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  iconWrap:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: 'rgba(28, 199, 193, 0.12)' },
  emoji:        { fontSize: 22 },
  label:        { fontSize: 10, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  labelActive:  { color: '#1CC7C1', fontWeight: '700' },
});
