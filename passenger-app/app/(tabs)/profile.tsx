import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Image, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { tokens } from '../../src/theme/tokens';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: '📍', label: 'Saved Locations', screen: null },
      { icon: '🕒', label: 'Ride History',    screen: '/profile/history' },
      { icon: '🔔', label: 'Notifications',   screen: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: '💬', label: 'Help & Support',  screen: null },
      { icon: '🤝', label: 'Partner With Us', screen: null },
      { icon: '⭐', label: 'Rate the App',    screen: null },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: '📄', label: 'Terms of Service', screen: null },
      { icon: '🔒', label: 'Privacy Policy',   screen: null },
      { icon: 'ℹ️', label: 'About Thoddoo Rides', screen: null },
    ],
  },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [language, setLanguage] = useState('en');
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          clearUser();
          router.replace('/auth');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header gradient */}
        <LinearGradient
          colors={['#0E7490', '#1CC7C1']}
          style={styles.headerGradient}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name ? user.name[0].toUpperCase() : '👤'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.name || 'Island Traveller'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalRides ?? 0}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ 4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏝</Text>
              <Text style={styles.statLabel}>Thoddoo</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Language selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, language === lang.code && styles.langChipActive]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
                  {lang.label}
                </Text>
                {language === lang.code && (
                  <Text style={styles.langCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleIcon}>🔔</Text>
            <View>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.toggleSub}>Ride updates & event alerts</Text>
            </View>
          </View>
          <Switch
            value={notificationsOn}
            onValueChange={setNotificationsOn}
            trackColor={{ false: '#CBD5E0', true: tokens.colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => item.screen && router.push(item.screen as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </TouchableOpacity>
                  {i < section.items.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thoddoo Rides v1.0.0</Text>
          <Text style={styles.footerSub}>Made with 🌊 for Thoddoo Island</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F4EC' },

  headerGradient: { paddingBottom: 28, paddingHorizontal: 20, paddingTop: 8, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 32, color: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  editIcon: { fontSize: 12 },
  name:  { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },

  statsRow:    { flexDirection: 'row', alignItems: 'center', gap: 0 },
  statItem:    { alignItems: 'center', paddingHorizontal: 24 },
  statValue:   { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  section:      { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: tokens.colors.textMuted, letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },

  langRow:      { flexDirection: 'row', gap: 10 },
  langChip:     {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#E2E8F0',
  },
  langChipActive: { borderColor: tokens.colors.primary, backgroundColor: '#F0FFFE' },
  langFlag:        { fontSize: 20 },
  langLabel:       { fontSize: 14, fontWeight: '600', color: tokens.colors.textSecondary, flex: 1 },
  langLabelActive: { color: tokens.colors.primary },
  langCheck:       { fontSize: 14, color: tokens.colors.primary, fontWeight: '700' },

  toggleRow: {
    marginHorizontal: 20, marginTop: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon:  { fontSize: 22 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: tokens.colors.textPrimary },
  toggleSub:   { fontSize: 12, color: tokens.colors.textSecondary, marginTop: 2 },

  menuCard:    { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  menuIcon:    { fontSize: 18, width: 26, textAlign: 'center' },
  menuLabel:   { flex: 1, fontSize: 15, fontWeight: '500', color: tokens.colors.textPrimary },
  menuChevron: { fontSize: 20, color: tokens.colors.textMuted },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 56 },

  signOutBtn: {
    backgroundColor: '#FFF5F5', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FECDD3',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  footer:    { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 13, color: tokens.colors.textMuted },
  footerSub:  { fontSize: 12, color: tokens.colors.textMuted, marginTop: 4 },
});
