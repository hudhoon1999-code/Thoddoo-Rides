// shared/constants/thoddoo-locations.ts
// ============================================================
// ALL NAMED LOCATIONS ON THODDOO ISLAND
// Sourced from: Official Thoddoo Council Map (PDF)
// Coordinates are approximate (island is ~1km x 0.5km)
// Center: 4.1603° N, 72.9949° E
// ============================================================

import { ThoddooLocation, LocationCategory, GeoPoint } from '../types';

// Island center reference
export const THODDOO_CENTER: GeoPoint = {
  latitude: 4.1603,
  longitude: 72.9949,
};

// Island boundary polygon (approximate)
export const THODDOO_BOUNDARY: GeoPoint[] = [
  { latitude: 4.1635, longitude: 72.9910 },
  { latitude: 4.1640, longitude: 72.9940 },
  { latitude: 4.1638, longitude: 72.9975 },
  { latitude: 4.1628, longitude: 72.9998 },
  { latitude: 4.1610, longitude: 73.0010 },
  { latitude: 4.1585, longitude: 73.0008 },
  { latitude: 4.1570, longitude: 72.9990 },
  { latitude: 4.1565, longitude: 72.9960 },
  { latitude: 4.1572, longitude: 72.9930 },
  { latitude: 4.1590, longitude: 72.9912 },
  { latitude: 4.1615, longitude: 72.9908 },
  { latitude: 4.1635, longitude: 72.9910 },
];

// Map zoom level optimized for Thoddoo island scale
export const THODDOO_MAP_CONFIG = {
  center: THODDOO_CENTER,
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  // Custom map style ID for tropical aesthetic (set in Google Cloud Console)
  googleMapStyleId: 'YOUR_STYLE_ID',
  // Mapbox style alternative
  mapboxStyleUrl: 'mapbox://styles/YOUR_USERNAME/YOUR_STYLE_ID',
};

// ─── KEY LOCATIONS ───────────────────────────────────────────
// These appear as quick-select shortcuts in the passenger app

export const THODDOO_KEY_LOCATIONS: ThoddooLocation[] = [
  {
    id: 'ferry-jetty',
    nameEn: 'Ferry Jetty',
    nameDv: 'ފެރީ ޖެޓީ',
    nameRu: 'Паром',
    coordinates: { latitude: 4.1638, longitude: 72.9940 },
    category: LocationCategory.FERRY_JETTY,
    isPopular: true,
    icon: 'ferry',
  },
  {
    id: 'thoddoo-school',
    nameEn: 'Thoddoo School',
    nameDv: 'ތޮއްޑޫ ސްކޫލް',
    coordinates: { latitude: 4.1605, longitude: 72.9952 },
    category: LocationCategory.SCHOOL,
    isPopular: true,
    icon: 'school',
  },
  {
    id: 'health-center',
    nameEn: 'Health Centre',
    nameDv: 'ޞިއްޙީމަރުކަޒު',
    coordinates: { latitude: 4.1598, longitude: 72.9960 },
    category: LocationCategory.HEALTH,
    isPopular: true,
    icon: 'medical',
  },
  {
    id: 'council',
    nameEn: 'Island Council',
    nameDv: 'ކައުންސިލް',
    coordinates: { latitude: 4.1600, longitude: 72.9945 },
    category: LocationCategory.GOVERNMENT,
    isPopular: true,
    icon: 'government',
  },
  {
    id: 'magistrate-court',
    nameEn: 'Magistrate Court',
    nameDv: 'މެޖިސްޓްރޭޓް ކޯޓް',
    coordinates: { latitude: 4.1595, longitude: 72.9958 },
    category: LocationCategory.GOVERNMENT,
    icon: 'court',
  },
  {
    id: 'sports-field',
    nameEn: 'Sports Field',
    nameDv: 'ރަސްމީ ބޯޅަދަނޑު',
    coordinates: { latitude: 4.1610, longitude: 72.9965 },
    category: LocationCategory.OTHER,
    icon: 'sports',
  },
  {
    id: 'volleyball-court',
    nameEn: 'Volleyball Court',
    nameDv: 'ވޮލީ ކޯޓް',
    coordinates: { latitude: 4.1608, longitude: 72.9968 },
    category: LocationCategory.OTHER,
    icon: 'sports',
  },
  {
    id: 'waste-management',
    nameEn: 'Waste Management Centre',
    nameDv: 'ވޭސްޓްމެނޭޖްމަންޓް ސެންޓަރ',
    coordinates: { latitude: 4.1580, longitude: 72.9930 },
    category: LocationCategory.OTHER,
    icon: 'facility',
  },
];

// ─── GUESTHOUSES ─────────────────────────────────────────────
// All guesthouses from official map — these are key passenger pickup points

export const THODDOO_GUESTHOUSES: ThoddooLocation[] = [
  // Popular/Featured guesthouses (shown first)
  { id: 'palm-leaf', nameEn: 'Palm Leaf Guesthouse', coordinates: { latitude: 4.1612, longitude: 72.9948 }, category: LocationCategory.GUESTHOUSE, isPopular: true, icon: 'guesthouse' },
  { id: 'hiriga-lodge', nameEn: 'Hiriga Lodge', nameDv: 'ހިރިގާ ލޮޖް', coordinates: { latitude: 4.1615, longitude: 72.9952 }, category: LocationCategory.GUESTHOUSE, isPopular: true, icon: 'guesthouse' },
  { id: 'lemongrass', nameEn: 'Lemongrass', nameDv: 'ލެމަންގްރާސް', coordinates: { latitude: 4.1618, longitude: 72.9955 }, category: LocationCategory.GUESTHOUSE, isPopular: true, icon: 'guesthouse' },
  { id: 'mahmal-lodge', nameEn: 'Mahmal Lodge', nameDv: 'މަހްމާ ލޮޖް', coordinates: { latitude: 4.1600, longitude: 72.9942 }, category: LocationCategory.GUESTHOUSE, isPopular: true, icon: 'guesthouse' },
  { id: 'blue-heaven', nameEn: 'Blue Heaven', nameDv: 'ބުލޫހެވަން', coordinates: { latitude: 4.1590, longitude: 72.9962 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'rest-point', nameEn: 'Rest Point', nameDv: 'ރެސްޓްޕޮއިންޓް', coordinates: { latitude: 4.1602, longitude: 72.9956 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'ocean-villa', nameEn: 'Ocean Villa', nameDv: 'އޯޝަންވިލާ', coordinates: { latitude: 4.1608, longitude: 72.9944 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-moon', nameEn: 'Blue Moon', nameDv: 'ބުލޫމޫން', coordinates: { latitude: 4.1596, longitude: 72.9950 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'sp-villa', nameEn: 'SP Villa', nameDv: 'އެސްޕީވިލާ', coordinates: { latitude: 4.1604, longitude: 72.9960 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'green-house', nameEn: 'Green House', nameDv: 'ގްރީންހައުސް', coordinates: { latitude: 4.1614, longitude: 72.9940 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-grass', nameEn: 'Blue Grass', nameDv: 'ބުލޫގްރާސް', coordinates: { latitude: 4.1622, longitude: 72.9946 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'moonlight', nameEn: 'Moonlight', nameDv: 'މޫންލައިޓް', coordinates: { latitude: 4.1588, longitude: 72.9970 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'white-villa', nameEn: 'White Villa', nameDv: 'ވައިޓްވިލާ', coordinates: { latitude: 4.1592, longitude: 72.9966 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'daylight', nameEn: 'Daylight', nameDv: 'ޑޭލައިޓް', coordinates: { latitude: 4.1606, longitude: 72.9938 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'happy-rest', nameEn: 'Happy Rest', nameDv: 'ހެޕީރެސްޓް', coordinates: { latitude: 4.1620, longitude: 72.9958 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'golden-moon', nameEn: 'Golden Moon', nameDv: 'ގޯލްޑަންމޫން', coordinates: { latitude: 4.1594, longitude: 72.9958 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'summit', nameEn: 'Summit', nameDv: 'ސަމިޓް', coordinates: { latitude: 4.1610, longitude: 72.9970 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'aroma', nameEn: 'Aroma', nameDv: 'އެރޯމާ', coordinates: { latitude: 4.1616, longitude: 72.9962 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'starlight', nameEn: 'Starlight', nameDv: 'ސްޓާރލައިޓް', coordinates: { latitude: 4.1586, longitude: 72.9974 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'daisy-villa', nameEn: 'Daisy Villa', nameDv: 'ޑޭޒީވިލާ', coordinates: { latitude: 4.1598, longitude: 72.9940 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  // Additional from map
  { id: 'teal-villa', nameEn: 'Teal Villa', nameDv: 'ޓީލްވިލާ', coordinates: { latitude: 4.1584, longitude: 72.9980 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'beach-villa', nameEn: 'Beach Villa', nameDv: 'ބީޗްވިލާ', coordinates: { latitude: 4.1582, longitude: 72.9984 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-berry', nameEn: 'Blue Berry', nameDv: 'ބުލޫބެރީ', coordinates: { latitude: 4.1588, longitude: 72.9966 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
];

// ─── BEACHES ─────────────────────────────────────────────────

export const THODDOO_BEACHES: ThoddooLocation[] = [
  {
    id: 'main-beach',
    nameEn: 'Main Beach',
    nameRu: 'Главный пляж',
    coordinates: { latitude: 4.1640, longitude: 72.9949 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
  {
    id: 'tourist-beach',
    nameEn: 'Tourist Beach',
    nameRu: 'Туристический пляж',
    coordinates: { latitude: 4.1635, longitude: 72.9960 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
  {
    id: 'bikini-beach',
    nameEn: 'Bikini Beach',
    nameRu: 'Бикини-пляж',
    coordinates: { latitude: 4.1630, longitude: 72.9970 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
];

// ─── ACTIVITY VENUES ─────────────────────────────────────────

export const THODDOO_VENUES: ThoddooLocation[] = [
  {
    id: 'tropical-beach-club',
    nameEn: 'Tropical Beach Club',
    nameRu: 'Тропический Пляжный Клуб',
    coordinates: { latitude: 4.1628, longitude: 72.9955 },
    category: LocationCategory.ACTIVITY_VENUE,
    isPopular: true,
    icon: 'venue',
  },
  {
    id: 'sky-blue-resort',
    nameEn: 'Sky Blue Resort',
    nameRu: 'Курорт Скай Блю',
    coordinates: { latitude: 4.1620, longitude: 72.9945 },
    category: LocationCategory.RESORT,
    isPopular: true,
    icon: 'resort',
  },
  {
    id: 'thilana-lounge',
    nameEn: 'Thilana Lounge',
    nameDv: 'ތިލަނާ ލައުންޖް',
    coordinates: { latitude: 4.1615, longitude: 72.9938 },
    category: LocationCategory.ACTIVITY_VENUE,
    isPopular: true,
    icon: 'venue',
  },
];

// ─── ALL LOCATIONS (merged) ───────────────────────────────────

export const ALL_THODDOO_LOCATIONS: ThoddooLocation[] = [
  ...THODDOO_KEY_LOCATIONS,
  ...THODDOO_GUESTHOUSES,
  ...THODDOO_BEACHES,
  ...THODDOO_VENUES,
];

export const POPULAR_LOCATIONS = ALL_THODDOO_LOCATIONS.filter(l => l.isPopular);

// Quick-access shortcuts for passenger home screen
export const HOME_SHORTCUTS = [
  { id: 'ferry-jetty', label: 'Ferry Jetty', icon: '⛴️' },
  { id: 'main-beach', label: 'Beach', icon: '🏖️' },
  { id: 'tropical-beach-club', label: 'Beach Club', icon: '🎵' },
  { id: 'thoddoo-school', label: 'School', icon: '🏫' },
];

// Search function for location lookup
export function searchLocations(query: string, language: 'en' | 'ru' = 'en'): ThoddooLocation[] {
  const q = query.toLowerCase().trim();
  if (!q) return POPULAR_LOCATIONS;
  
  return ALL_THODDOO_LOCATIONS.filter(loc => {
    if (language === 'ru' && loc.nameRu) {
      return loc.nameRu.toLowerCase().includes(q) || loc.nameEn.toLowerCase().includes(q);
    }
    return loc.nameEn.toLowerCase().includes(q);
  });
}
