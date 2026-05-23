// shared/constants/thoddoo-locations.ts
// ============================================================
// ALL NAMED LOCATIONS ON THODDOO ISLAND
// Source: Official Thoddoo Council Map (PDF)
// Center: 4.1603°N, 72.9949°E  |  Island: ~1.3km × 0.9km
// N is top-right on council map; harbor is on the EAST side
// ============================================================

import { ThoddooLocation, LocationCategory, GeoPoint } from '../types';

export const THODDOO_CENTER: GeoPoint = {
  latitude: 4.1603,
  longitude: 72.9949,
};

// Refined boundary from PDF — oval island with harbor bulge on EAST side
export const THODDOO_BOUNDARY: GeoPoint[] = [
  { latitude: 4.1662, longitude: 72.9905 }, // NW (farmland begins)
  { latitude: 4.1670, longitude: 72.9930 }, // N peak
  { latitude: 4.1665, longitude: 72.9958 }, // NE
  { latitude: 4.1648, longitude: 72.9982 }, // E upper
  { latitude: 4.1622, longitude: 73.0002 }, // E — harbor starts
  { latitude: 4.1598, longitude: 73.0012 }, // Harbor east tip
  { latitude: 4.1572, longitude: 73.0005 }, // Harbor south
  { latitude: 4.1558, longitude: 72.9982 }, // SE
  { latitude: 4.1550, longitude: 72.9958 }, // South tip
  { latitude: 4.1558, longitude: 72.9928 }, // SW
  { latitude: 4.1575, longitude: 72.9908 }, // W
  { latitude: 4.1600, longitude: 72.9898 }, // NW lower
  { latitude: 4.1635, longitude: 72.9898 }, // NW upper
  { latitude: 4.1662, longitude: 72.9905 }, // close
];

export const THODDOO_MAP_CONFIG = {
  center: THODDOO_CENTER,
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
};

// ─── KEY LOCATIONS ───────────────────────────────────────────

export const THODDOO_KEY_LOCATIONS: ThoddooLocation[] = [
  // Ferry / Harbor — EAST side of island (blue area in PDF)
  {
    id: 'ferry-jetty',
    nameEn: 'Ferry Terminal',
    nameDv: 'ފެރީ ޖެޓީ',
    coordinates: { latitude: 4.1585, longitude: 73.0005 },
    category: LocationCategory.FERRY_JETTY,
    isPopular: true,
    icon: 'ferry',
  },
  // School — upper north area
  {
    id: 'thoddoo-school',
    nameEn: 'Thoddoo School',
    nameDv: 'ތޮއްޑޫ ސްކޫލް',
    coordinates: { latitude: 4.1648, longitude: 72.9938 },
    category: LocationCategory.SCHOOL,
    isPopular: true,
    icon: 'school',
  },
  // Health Centre
  {
    id: 'health-center',
    nameEn: 'Health Centre',
    nameDv: 'ޞިއްޙީ މަރުކަޒު',
    coordinates: { latitude: 4.1600, longitude: 72.9952 },
    category: LocationCategory.HEALTH,
    isPopular: true,
    icon: 'medical',
  },
  // Island Council
  {
    id: 'council',
    nameEn: 'Island Council',
    nameDv: 'ކައުންސިލް',
    coordinates: { latitude: 4.1598, longitude: 72.9945 },
    category: LocationCategory.GOVERNMENT,
    isPopular: true,
    icon: 'government',
  },
  // Magistrate Court
  {
    id: 'magistrate-court',
    nameEn: 'Magistrate Court',
    nameDv: 'މެޖިސްޓްރޭޓް ކޯޓް',
    coordinates: { latitude: 4.1596, longitude: 72.9950 },
    category: LocationCategory.GOVERNMENT,
    icon: 'court',
  },
  // Council Preschool
  {
    id: 'preschool',
    nameEn: 'Council Preschool',
    nameDv: 'ކައުންސިލް ޕްރީ ސްކޫލް',
    coordinates: { latitude: 4.1594, longitude: 72.9942 },
    category: LocationCategory.SCHOOL,
    icon: 'school',
  },
  // Main football field (large green rectangle, upper-center-left on PDF)
  {
    id: 'football-field',
    nameEn: 'Football Field',
    nameDv: 'ދަނޑުވެރިންގެ ދަނޑު',
    coordinates: { latitude: 4.1638, longitude: 72.9920 },
    category: LocationCategory.OTHER,
    icon: 'sports',
  },
  // Official Sports Field #56 (upper-right on PDF)
  {
    id: 'sports-field-official',
    nameEn: 'Official Sports Field',
    nameDv: 'ރަސްމީ ބޯޅަދަނޑު',
    coordinates: { latitude: 4.1642, longitude: 72.9978 },
    category: LocationCategory.OTHER,
    isPopular: true,
    icon: 'sports',
  },
  // Volleyball Court / Soasan Club
  {
    id: 'volleyball-court',
    nameEn: 'Volleyball Court / Soasan Club',
    nameDv: 'ވޮލީ ކޯޓް / ސޯސަން ކްލަބް',
    coordinates: { latitude: 4.1620, longitude: 72.9955 },
    category: LocationCategory.OTHER,
    icon: 'sports',
  },
  // Power Station
  {
    id: 'power-station',
    nameEn: 'Power Station',
    nameDv: 'ތޮއްޑޫ އިންޖީނުގެ',
    coordinates: { latitude: 4.1570, longitude: 72.9938 },
    category: LocationCategory.OTHER,
    icon: 'facility',
  },
  // Waste Management
  {
    id: 'waste-management',
    nameEn: 'Waste Management Centre',
    nameDv: 'ވޭސްޓްމެނޭޖްމަންޓް ސެންޓަރ',
    coordinates: { latitude: 4.1562, longitude: 72.9918 },
    category: LocationCategory.OTHER,
    icon: 'facility',
  },
  // Outdoor Gym
  {
    id: 'outdoor-gym',
    nameEn: 'Outdoor Gym',
    nameDv: 'ޖިމް އައުޓްޑޯ ސައިޓް',
    coordinates: { latitude: 4.1590, longitude: 72.9978 },
    category: LocationCategory.OTHER,
    icon: 'sports',
  },
  // Dhiraagu telecom
  {
    id: 'dhiraagu',
    nameEn: 'Dhiraagu Site',
    nameDv: 'ދިރާގު ސައިޓް',
    coordinates: { latitude: 4.1612, longitude: 72.9963 },
    category: LocationCategory.OTHER,
    icon: 'facility',
  },
  // Ooredoo telecom
  {
    id: 'ooredoo',
    nameEn: 'Ooredoo Site',
    nameDv: 'އުރީދޫ',
    coordinates: { latitude: 4.1623, longitude: 72.9968 },
    category: LocationCategory.OTHER,
    icon: 'facility',
  },
  // Cemetery 1 (NW area, labeled #66 #67 in PDF)
  {
    id: 'cemetery-1',
    nameEn: 'Cemetery',
    nameDv: 'ޤަބުރުސްތާނު',
    coordinates: { latitude: 4.1626, longitude: 72.9908 },
    category: LocationCategory.OTHER,
    icon: 'cemetery',
  },
  // Cemetery 2
  {
    id: 'cemetery-2',
    nameEn: 'Cemetery',
    nameDv: 'ޤަބުރުސްތާނު',
    coordinates: { latitude: 4.1608, longitude: 72.9912 },
    category: LocationCategory.OTHER,
    icon: 'cemetery',
  },
];

// ─── MOSQUES ─────────────────────────────────────────────────
// Three mosques visible on PDF

export const THODDOO_MOSQUES: ThoddooLocation[] = [
  {
    id: 'masjid-aaisha',
    nameEn: 'Masjid Al Aaisha',
    nameDv: 'މަސްޖިދުލް ޢާއިޝާ',
    coordinates: { latitude: 4.1618, longitude: 72.9942 },
    category: LocationCategory.MOSQUE,
    isPopular: true,
    icon: 'mosque',
  },
  {
    id: 'maa-miskit',
    nameEn: 'Maa Mosque',
    nameDv: 'މާ މިސްކިތް',
    coordinates: { latitude: 4.1602, longitude: 72.9938 },
    category: LocationCategory.MOSQUE,
    isPopular: true,
    icon: 'mosque',
  },
  {
    id: 'masjid-south',
    nameEn: 'South Mosque',
    nameDv: 'މަސްޖިދުލް',
    coordinates: { latitude: 4.1575, longitude: 72.9958 },
    category: LocationCategory.MOSQUE,
    icon: 'mosque',
  },
];

// ─── GUESTHOUSES ─────────────────────────────────────────────
// All guesthouses from official council map PDF
// Residential area: lat 4.155–4.164°N, lon 72.989–72.999°E

export const THODDOO_GUESTHOUSES: ThoddooLocation[] = [
  // -- Popular / Featured --
  { id: 'hiriga-lodge',    nameEn: 'Hiriga Lodge',    nameDv: 'ހިރިގާ ލޮޖް',        coordinates: { latitude: 4.1615, longitude: 72.9948 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'lemongrass',      nameEn: 'Lemongrass',      nameDv: 'ލެމަންގްރާސް',       coordinates: { latitude: 4.1618, longitude: 72.9955 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'happy-rest',      nameEn: 'Happy Rest',      nameDv: 'ހެޕީ ރެސްޓް',       coordinates: { latitude: 4.1622, longitude: 72.9960 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'rest-point',      nameEn: 'Rest Point',      nameDv: 'ރެސްޓްޕޮއިންޓް',    coordinates: { latitude: 4.1604, longitude: 72.9958 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'mahmal-lodge',    nameEn: 'Mahmal Lodge',    nameDv: 'މަޙްމާ ލޮޖް',       coordinates: { latitude: 4.1592, longitude: 72.9968 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'blue-heaven',     nameEn: 'Blue Heaven',     nameDv: 'ބުލޫ ހެވަން',       coordinates: { latitude: 4.1582, longitude: 72.9975 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'summit',          nameEn: 'Summit',          nameDv: 'ސަމިޓް',             coordinates: { latitude: 4.1610, longitude: 72.9972 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },
  { id: 'sp-villa',        nameEn: 'SP Villa',        nameDv: 'އެސްޕީ ވިލާ',       coordinates: { latitude: 4.1595, longitude: 72.9960 }, category: LocationCategory.GUESTHOUSE, isPopular: true,  icon: 'guesthouse' },

  // -- Standard guesthouses from PDF --
  { id: 'lilac',           nameEn: 'Lilac',           nameDv: 'ލިލަކް',             coordinates: { latitude: 4.1625, longitude: 72.9950 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'starlite',        nameEn: 'Starlite',        nameDv: 'ސްޓާ ލައިޓް',       coordinates: { latitude: 4.1628, longitude: 72.9945 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'hiri',            nameEn: 'Hiri',            nameDv: 'ހިރި',               coordinates: { latitude: 4.1630, longitude: 72.9942 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'rasfannu',        nameEn: 'Rasfannu',        nameDv: 'ރަސްފަންނު',         coordinates: { latitude: 4.1625, longitude: 72.9958 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'muraka',          nameEn: 'Muraka',          nameDv: 'މުރަކަ',             coordinates: { latitude: 4.1622, longitude: 72.9952 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'hope',            nameEn: 'Hope',            nameDv: 'ހޯޕް',               coordinates: { latitude: 4.1618, longitude: 72.9948 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'thari',           nameEn: 'Thari (Star)',    nameDv: 'ތަރި',               coordinates: { latitude: 4.1615, longitude: 72.9940 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'tasnim',          nameEn: 'Tasnim',          nameDv: 'ތަސްނީމް',           coordinates: { latitude: 4.1612, longitude: 72.9945 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'noo-muraka',      nameEn: 'Noo Muraka',      nameDv: 'ނޫ މުރަކަ',          coordinates: { latitude: 4.1608, longitude: 72.9948 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'lavenderly',      nameEn: 'Lavenderly',      nameDv: 'ލެވެންޑް ލީ',        coordinates: { latitude: 4.1605, longitude: 72.9942 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'water-lily',      nameEn: 'Water Lily',      nameDv: 'ވޯޓަރ ލިލީ',        coordinates: { latitude: 4.1600, longitude: 72.9965 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'dhoafannu',       nameEn: 'Dhoafannu',       nameDv: 'ދޯ ފަންނު',          coordinates: { latitude: 4.1598, longitude: 72.9970 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'shooting-star',   nameEn: 'Shooting Star',   nameDv: 'ޝޫޓިން ސްޓާ',       coordinates: { latitude: 4.1595, longitude: 72.9975 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'heaven',          nameEn: 'Heaven',          nameDv: 'ހެއިވެން',           coordinates: { latitude: 4.1592, longitude: 72.9978 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'waterfall',       nameEn: 'Waterfall',       nameDv: 'ވޯޓަރ ފޯލް',        coordinates: { latitude: 4.1588, longitude: 72.9972 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'golden-moon',     nameEn: 'Golden Moon',     nameDv: 'ގޯލްޑަން މޫން',     coordinates: { latitude: 4.1585, longitude: 72.9965 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'unique',          nameEn: 'Unique',          nameDv: 'ޔުނިކް',             coordinates: { latitude: 4.1582, longitude: 72.9960 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'senaka',          nameEn: 'Senaka',          nameDv: 'ސެނަކަ',             coordinates: { latitude: 4.1580, longitude: 72.9955 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'moonlight',       nameEn: 'Moonlight',       nameDv: 'މޫންލައިޓް',         coordinates: { latitude: 4.1578, longitude: 72.9950 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'white-villa',     nameEn: 'White Villa',     nameDv: 'ވައިޓް ވިލާ',       coordinates: { latitude: 4.1576, longitude: 72.9945 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-grass',      nameEn: 'Blue Grass',      nameDv: 'ބުލޫ ގްރާސް',       coordinates: { latitude: 4.1612, longitude: 72.9935 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'daylight',        nameEn: 'Daylight',        nameDv: 'ޑޭ ލައިޓް',         coordinates: { latitude: 4.1608, longitude: 72.9930 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'daisy-villa',     nameEn: 'Daisy Villa',     nameDv: 'ޑޭ ޒީ ވިލާ',        coordinates: { latitude: 4.1605, longitude: 72.9935 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'ocean-villa',     nameEn: 'Ocean Villa',     nameDv: 'އޯޝަން ވިލާ',       coordinates: { latitude: 4.1602, longitude: 72.9940 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-moon',       nameEn: 'Blue Moon',       nameDv: 'ބުލޫ މޫން',          coordinates: { latitude: 4.1598, longitude: 72.9935 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'cool-breeze',     nameEn: 'Cool Breeze',     nameDv: 'ކޫލް ބްރީޒް',       coordinates: { latitude: 4.1595, longitude: 72.9932 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'neel-villa',      nameEn: 'Neel Villa',      nameDv: 'ނީލް ވިލާ',         coordinates: { latitude: 4.1592, longitude: 72.9928 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'teal-villa',      nameEn: 'Teal Villa',      nameDv: 'ޓީލް ވިލާ',         coordinates: { latitude: 4.1588, longitude: 72.9932 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'beach-villa',     nameEn: 'Beach Villa',     nameDv: 'ބީޗް ވިލާ',         coordinates: { latitude: 4.1582, longitude: 72.9938 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'blue-berry',      nameEn: 'Blue Berry',      nameDv: 'ބުލޫ ބެރީ',         coordinates: { latitude: 4.1578, longitude: 72.9942 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'tulip',           nameEn: 'Tulip',           nameDv: 'ޓިއުލިޕް',           coordinates: { latitude: 4.1574, longitude: 72.9948 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'rose-villa',      nameEn: 'Rose Villa',      nameDv: 'ރޯސް ވިލާ',         coordinates: { latitude: 4.1572, longitude: 72.9955 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'bina',            nameEn: 'Bina',            nameDv: 'ބިނާ',               coordinates: { latitude: 4.1570, longitude: 72.9962 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'green-house',     nameEn: 'Green House',     nameDv: 'ގްރީން ހައުސް',     coordinates: { latitude: 4.1568, longitude: 72.9968 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'wasil',           nameEn: 'Wasil',           nameDv: 'ވާސިލް',             coordinates: { latitude: 4.1565, longitude: 72.9975 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
  { id: 'faruma',          nameEn: 'Faruma',          nameDv: 'ފަރުމާ',             coordinates: { latitude: 4.1563, longitude: 72.9960 }, category: LocationCategory.GUESTHOUSE, icon: 'guesthouse' },
];

// ─── BEACHES ─────────────────────────────────────────────────
// NORTH coast of Thoddoo (top of island in PDF)

export const THODDOO_BEACHES: ThoddooLocation[] = [
  {
    id: 'main-beach',
    nameEn: 'Main Beach',
    nameDv: 'ހުދުވެލި ތުނޑި',
    nameRu: 'Главный пляж',
    coordinates: { latitude: 4.1670, longitude: 72.9928 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
  {
    id: 'tourist-beach',
    nameEn: 'Tourist Beach',
    nameDv: 'ފަތުރުވެރިންގެ ތުނޑި',
    nameRu: 'Туристический пляж',
    coordinates: { latitude: 4.1668, longitude: 72.9952 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
  {
    id: 'bikini-beach',
    nameEn: 'Bikini Beach',
    nameDv: 'ތުނިތުނި ތުނޑި',
    nameRu: 'Пляж Бикини',
    coordinates: { latitude: 4.1664, longitude: 72.9965 },
    category: LocationCategory.BEACH,
    isPopular: true,
    icon: 'beach',
  },
];

// ─── ALL LOCATIONS ────────────────────────────────────────────

export const ALL_THODDOO_LOCATIONS: ThoddooLocation[] = [
  ...THODDOO_KEY_LOCATIONS,
  ...THODDOO_MOSQUES,
  ...THODDOO_GUESTHOUSES,
  ...THODDOO_BEACHES,
];

export const POPULAR_LOCATIONS = ALL_THODDOO_LOCATIONS.filter(l => l.isPopular);

export const HOME_SHORTCUTS = [
  { id: 'ferry-jetty',       label: 'Ferry Jetty',  icon: '⛴️' },
  { id: 'main-beach',        label: 'Beach',        icon: '🏖️' },
  { id: 'thoddoo-school',    label: 'School',       icon: '🏫' },
  { id: 'health-center',     label: 'Health',       icon: '🏥' },
];

export function searchLocations(query: string, language: 'en' | 'ru' = 'en'): ThoddooLocation[] {
  const q = query.toLowerCase().trim();
  if (!q) return POPULAR_LOCATIONS;
  return ALL_THODDOO_LOCATIONS.filter(loc => {
    if (language === 'ru' && loc.nameRu) {
      return loc.nameRu.toLowerCase().includes(q) || loc.nameEn.toLowerCase().includes(q);
    }
    return loc.nameEn.toLowerCase().includes(q) ||
      (loc.nameDv?.includes(q) ?? false);
  });
}
