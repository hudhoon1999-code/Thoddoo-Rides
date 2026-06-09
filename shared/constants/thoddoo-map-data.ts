// shared/constants/thoddoo-map-data.ts
// Real GPS data for Thoddoo Island from OSM export + council JSON files.
// Hotels, restaurants and attractions: sourced from local JSON exports.
// Roads: parsed from roads.geojson (OSM residential road network).
//
// Real island center: 4.4382°N, 72.9613°E
// (The older thoddoo-locations.ts used approximate/incorrect coordinates;
//  this file has the authoritative data for the react-native-maps layer.)

import { GeoPoint } from '../types/index';

// ─── Theme colors (from map_theme.json) ──────────────────────

export const MAP_THEME = {
  ocean:      '#43B5E8',
  land:       '#F5E8C7',
  road:       '#FFFFFF',
  hotel:      '#FFD700',
  restaurant: '#FF7043',
  attraction: '#8E44AD',
} as const;

// ─── Island center (real GPS) ─────────────────────────────────

export const THODDOO_REAL_CENTER: GeoPoint = {
  latitude:  4.4382,
  longitude: 72.9613,
};

export const THODDOO_REAL_BOUNDS = {
  minLat:  4.433,
  maxLat:  4.445,
  minLon:  72.954,
  maxLon:  72.967,
};

// ─── Hotels ──────────────────────────────────────────────────

export interface MapPOI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const HOTELS: MapPOI[] = [
  { id: 'serene-sky',       name: 'Serene Sky Guest House',    latitude: 4.4392519, longitude: 72.9605048 },
  { id: 'amazing-view-gh',  name: 'Amazing View Guest House',  latitude: 4.4388647, longitude: 72.9600958 },
  { id: 'thoddoo-ocean',    name: 'Thoddoo Ocean Front',       latitude: 4.4378239, longitude: 72.9593334 },
  { id: 'heavenly-retreat', name: 'Heavenly Retreat',           latitude: 4.4382454, longitude: 72.9598723 },
  { id: 'palm-garden-inn',  name: 'Palm Garden Thoddoo Inn',   latitude: 4.4377575, longitude: 72.9590809 },
  { id: 'holiday-cottage',  name: 'Holiday Cottage',            latitude: 4.4391489, longitude: 72.9606500 },
  { id: 'thoddoo-inn',      name: 'Thoddoo Inn',                latitude: 4.4363816, longitude: 72.9630084 },
  { id: 'relax-lodge',      name: 'Relax Lodge',                latitude: 4.4370122, longitude: 72.9611270 },
  { id: 'quorizon',         name: 'Quorizon Sandy Feet',        latitude: 4.4384136, longitude: 72.9626292 },
  { id: 'palm-garden',      name: 'Palm Garden',                latitude: 4.4376531, longitude: 72.9592311 },
  { id: 'coco-villa',       name: 'Coco Villa',                 latitude: 4.4381289, longitude: 72.9595560 },
  { id: 'summer-sky-inn',   name: 'Summer Sky Inn',             latitude: 4.4368994, longitude: 72.9592958 },
  { id: 'lunara',           name: 'Lunara Residence',           latitude: 4.4390321, longitude: 72.9602375 },
  { id: 'shoreline-grand',  name: 'Shoreline Grand',            latitude: 4.4388709, longitude: 72.9597774 },
  { id: 'aqua-blu',         name: 'Aqua Blu Thoddoo',           latitude: 4.4386884, longitude: 72.9635270 },
  { id: 'white-sand-inn',   name: 'White Sand Inn',             latitude: 4.4395094, longitude: 72.9600948 },
  { id: 'royal-stay',       name: 'Royal Stay Inn',             latitude: 4.4380200, longitude: 72.9590375 },
  { id: 'summer-sky-t',     name: 'Summer Sky Thoddoo',         latitude: 4.4384854, longitude: 72.9594649 },
  { id: 'brisa-fresca',     name: 'Brisa Fresca',               latitude: 4.4391108, longitude: 72.9608945 },
  { id: 'kingsway',         name: 'Kingsway Thoddoo',           latitude: 4.4370115, longitude: 72.9623919 },
  { id: 'manta-stay',       name: 'Manta Stay',                 latitude: 4.4393688, longitude: 72.9608828 },
  { id: 'lagoon-villa',     name: 'Lagoon Villa Maldives',      latitude: 4.4380367, longitude: 72.9596738 },
];

// ─── Restaurants ──────────────────────────────────────────────

export const RESTAURANTS: MapPOI[] = [
  { id: 'kavaab',       name: 'Kavaab Restaurant',             latitude: 4.4392666, longitude: 72.9616058 },
  { id: 'black-salt',   name: 'Black Salt',                    latitude: 4.4370612, longitude: 72.9611694 },
  { id: 'chinese-rest', name: 'Chinese Restaurant',            latitude: 4.4386007, longitude: 72.9616949 },
  { id: 'quorizon-r',   name: 'Quorizon Sandy Feet',           latitude: 4.4384151, longitude: 72.9625575 },
  { id: 'seli-poeli',   name: 'Seli Poeli',                    latitude: 4.4391675, longitude: 72.9605461 },
  { id: 'sun-sky',      name: 'Sun Sky Restaurant',            latitude: 4.4388428, longitude: 72.9625819 },
  { id: 'mango-house',  name: "Mango House Café & Restaurant", latitude: 4.4367485, longitude: 72.9619019 },
  { id: 'unimaa-cafe',  name: 'Unimaa Cafe',                   latitude: 4.4390679, longitude: 72.9621803 },
  { id: 'fishka',       name: 'Fishka',                        latitude: 4.4370937, longitude: 72.9602471 },
  { id: 'royal-panda',  name: 'Royal Panda',                   latitude: 4.4379200, longitude: 72.9589402 },
  { id: 'ice-tea',      name: 'Ice Tea',                       latitude: 4.4390036, longitude: 72.9608305 },
  { id: 'simply',       name: 'Simply',                        latitude: 4.4365922, longitude: 72.9603394 },
];

// ─── Attractions ──────────────────────────────────────────────

export const ATTRACTIONS: MapPOI[] = [
  { id: 'sto-pharmacy',  name: 'STO Pharmacy',              latitude: 4.4381898, longitude: 72.9621339 },
  { id: 'magistrate',    name: 'Thoddoo Magistrate Court',  latitude: 4.4380492, longitude: 72.9621054 },
  { id: 'diving-center', name: 'Thoddoo Diving Center',     latitude: 4.4388491, longitude: 72.9635880 },
  { id: 'dive-aetas',    name: 'Dive Aetas',                latitude: 4.4366893, longitude: 72.9609009 },
];

// ─── Roads (from roads.geojson) ───────────────────────────────
// GeoJSON coords are [lng, lat]; converted here to {latitude, longitude}.

export interface RoadSegment {
  name: string;
  coordinates: GeoPoint[];
}

const RAW_ROADS: { name: string; coords: [number, number][] }[] = [
  { name: 'Shaheedh Ali Hingun', coords: [[72.9586212,4.4367357],[72.9592192,4.4375664],[72.9592635,4.4376306],[72.9593272,4.4377182],[72.9597194,4.4382751],[72.9604007,4.4392466],[72.9608783,4.4398871],[72.961231,4.4403885],[72.9614554,4.4407367]] },
  { name: 'Blue Berry Moonlight Goalhi', coords: [[72.9609218,4.4374243],[72.9605302,4.4376947],[72.9603679,4.4378201],[72.9601152,4.43799],[72.9597194,4.4382751],[72.9593643,4.438536]] },
  { name: 'Boduthakurufaanu Magu', coords: [[72.9619195,4.4405254],[72.9612859,4.439626],[72.9611049,4.4393577],[72.9610214,4.4392262],[72.9608418,4.4389658],[72.9601152,4.43799],[72.9597238,4.4374251],[72.9597088,4.437405],[72.9590257,4.4364407],[72.958845,4.4361844],[72.9587538,4.4360613],[72.9585425,4.4357794]] },
  { name: '', coords: [[72.9593272,4.4377182],[72.9597238,4.4374251],[72.9597624,4.4373926],[72.9601421,4.4371111],[72.9605137,4.4368556]] },
  { name: 'Anehenun Magu', coords: [[72.9628058,4.4400498],[72.9623487,4.4402887],[72.9619195,4.4405254],[72.9614554,4.4407367],[72.9613866,4.4407848],[72.9610929,4.4409791],[72.9607827,4.4411842],[72.960642,4.4412773],[72.9570998,4.4434851]] },
  { name: 'Carnation Magu', coords: [[72.9616548,4.4384458],[72.9622213,4.4380877],[72.9624271,4.4379567],[72.9626724,4.4378006],[72.962898,4.4376569],[72.9629797,4.4376049],[72.9633807,4.4373497],[72.9638659,4.4370409],[72.9644354,4.4366783],[72.9652205,4.4361786]] },
  { name: 'Ghaazee Magu', coords: [[72.9616548,4.4384458],[72.9613226,4.4379829],[72.9610551,4.43761],[72.9609218,4.4374243],[72.960716,4.4371374],[72.9605972,4.4369719],[72.9605137,4.4368556],[72.9604,4.4366971],[72.960024,4.4361731],[72.9598133,4.4358795],[72.9597832,4.4358375],[72.9592161,4.4350472],[72.9579024,4.4332164]] },
  { name: '', coords: [[72.9604,4.4366971],[72.9605927,4.4365364],[72.9608751,4.4362863],[72.961287,4.4358731]] },
  { name: 'Chaandhanee Magu', coords: [[72.9617711,4.4386078],[72.9623203,4.4387135],[72.9627172,4.4387719],[72.962831,4.4387886],[72.9633905,4.4388708],[72.9638153,4.4389333],[72.9638622,4.4389402],[72.9644163,4.4390216]] },
  { name: 'Asuru Mage', coords: [[72.9618686,4.4376062],[72.9618237,4.4375561],[72.9617686,4.4375119],[72.9617473,4.4374948],[72.9617159,4.4374646],[72.9615255,4.4373077],[72.9613993,4.4372088],[72.961276,4.4371187],[72.9612117,4.4370659],[72.9610304,4.4369167],[72.9608539,4.4367576],[72.9605927,4.4365364],[72.9601919,4.4360381]] },
  { name: '', coords: [[72.9613993,4.4372088],[72.9617697,4.4368402],[72.9619176,4.4367663],[72.9622463,4.4365835],[72.962868,4.4361634],[72.9629378,4.4361703],[72.9629911,4.4362066]] },
  { name: '', coords: [[72.9608539,4.4367576],[72.961538,4.4362634]] },
  { name: '', coords: [[72.961538,4.4362634],[72.9617121,4.4365701],[72.9617054,4.4367332],[72.9617697,4.4368402]] },
  { name: '', coords: [[72.9623466,4.4374664],[72.9625063,4.437504],[72.9628686,4.4373207],[72.963282,4.4371243]] },
  { name: '', coords: [[72.9605302,4.4376947],[72.9601421,4.4371111]] },
  { name: '', coords: [[72.9622213,4.4380877],[72.9620856,4.4375622]] },
  { name: '', coords: [[72.9608751,4.4362863],[72.9604867,4.4357965]] },
  { name: '', coords: [[72.9622213,4.4380877],[72.9622753,4.4383507],[72.9623203,4.4387135]] },
  { name: '', coords: [[72.9622753,4.4383507],[72.962472,4.4383252],[72.9627287,4.4382926],[72.9629249,4.4382677]] },
  { name: '', coords: [[72.9627287,4.4382926],[72.962831,4.4387886]] },
  { name: '', coords: [[72.9633807,4.4373497],[72.963282,4.4371243]] },
  { name: '', coords: [[72.962472,4.4383252],[72.9624271,4.4379567]] },
  { name: 'Moonlight Goalhi', coords: [[72.9603679,4.4378201],[72.960881,4.438542],[72.9610638,4.4384159],[72.9612417,4.4387112]] },
  { name: '', coords: [[72.9610551,4.43761],[72.9613524,4.4374195],[72.9615028,4.4373224],[72.9615255,4.4373077]] },
  { name: '', coords: [[72.9633807,4.4373497],[72.9635173,4.4376054]] },
  { name: '', coords: [[72.9626749,4.4398674],[72.9629006,4.4397374],[72.963638,4.4397421],[72.9637265,4.4396766],[72.9638622,4.4389402]] },
  { name: '', coords: [[72.9630337,4.4378962],[72.9632464,4.4377666],[72.9635173,4.4376054],[72.9636376,4.4375331],[72.9640989,4.4372285],[72.9641841,4.4371695],[72.9643926,4.4370478],[72.9645718,4.4369353],[72.9644354,4.4366783]] },
  { name: '', coords: [[72.9632416,4.4382181],[72.9631441,4.4382499],[72.9629768,4.4383044],[72.9629249,4.4382677]] },
  { name: '', coords: [[72.9632416,4.4382181],[72.9634608,4.4380755]] },
  { name: '', coords: [[72.9623487,4.4402887],[72.961721,4.4393444],[72.9612417,4.4387112]] },
  { name: '', coords: [[72.9629797,4.4376049],[72.9628686,4.4373207]] },
  { name: '', coords: [[72.9632416,4.4382181],[72.9630337,4.4378962],[72.962898,4.4376569]] },
  { name: '', coords: [[72.961538,4.4362634],[72.9614473,4.4361176],[72.961287,4.4358731]] },
  { name: '', coords: [[72.9608539,4.4367576],[72.9605972,4.4369719]] },
  { name: 'Sosun Magu', coords: [[72.9629911,4.4362066],[72.9629098,4.4363563],[72.9625259,4.436948],[72.9623254,4.4371673],[72.962273,4.4372286],[72.9623466,4.4374664],[72.9620856,4.4375622],[72.9619616,4.4375974],[72.9619023,4.4376235],[72.9618686,4.4376062],[72.9613226,4.4379829]] },
  { name: '', coords: [[72.9627172,4.4387719],[72.9627694,4.4390336],[72.9629006,4.4397374]] },
  { name: 'Valhu Magu', coords: [[72.9554858,4.4424126],[72.9600431,4.4394742]] },
  { name: '', coords: [[72.9629249,4.4382677],[72.9626724,4.4378006],[72.9625063,4.437504]] },
  { name: '', coords: [[72.9632464,4.4377666],[72.9634608,4.4380755],[72.9635985,4.4382022]] },
  { name: '', coords: [[72.9635985,4.4382022],[72.963908,4.4379998],[72.9639449,4.4380169],[72.9640755,4.4380125],[72.9644948,4.4382709]] },
  { name: '', coords: [[72.9635985,4.4382022],[72.9637419,4.4386726],[72.9638153,4.4389333]] },
  { name: '', coords: [[72.9631441,4.4382499],[72.9633905,4.4388708]] },
  { name: '', coords: [[72.9636376,4.4375331],[72.963908,4.4379998]] },
  { name: '', coords: [[72.9622068,4.4392151],[72.9627694,4.4390336]] },
  { name: '', coords: [[72.961721,4.4393444],[72.9622068,4.4392151]] },
  { name: '', coords: [[72.9608783,4.4398871],[72.9610165,4.4398075],[72.9612859,4.439626],[72.961721,4.4393444]] },
  { name: '', coords: [[72.963282,4.4371243],[72.9629098,4.4363563]] },
  { name: '', coords: [[72.960716,4.4371374],[72.9610304,4.4369167]] },
  { name: '', coords: [[72.9635998,4.43654],[72.9639541,4.4363714]] },
  { name: '', coords: [[72.9623254,4.4371673],[72.9619176,4.4367663]] },
  { name: '', coords: [[72.9622463,4.4365835],[72.9619241,4.4358567],[72.9618117,4.4356512],[72.961287,4.4358731]] },
  { name: 'Ameenee Magu', coords: [[72.9582545,4.4369817],[72.9589649,4.4379766],[72.9593643,4.438536],[72.9600431,4.4394742],[72.9610929,4.4409791]] },
  { name: '', coords: [[72.9625259,4.436948],[72.9622463,4.4365835]] },
  { name: 'Asseyri Magu', coords: [[72.9629911,4.4362066],[72.9630615,4.4361673],[72.9630742,4.4360933],[72.9631261,4.4360143],[72.9632214,4.4359485],[72.9633009,4.4359942],[72.963338,4.4360456],[72.9635998,4.43654],[72.9638659,4.4370409]] },
  { name: 'Carnation Magu', coords: [[72.9600431,4.4394742],[72.9604007,4.4392466],[72.9608418,4.4389658],[72.9612417,4.4387112],[72.9616548,4.4384458]] },
  { name: 'Ghaazee Magu', coords: [[72.9634655,4.4409692],[72.9628058,4.4400498],[72.9626749,4.4398674],[72.9622068,4.4392151],[72.9617711,4.4386078],[72.9616548,4.4384458]] },
  { name: '', coords: [[72.9593272,4.4377182],[72.9589649,4.4379766]] },
];

export const ROAD_SEGMENTS: RoadSegment[] = RAW_ROADS.map((r) => ({
  name: r.name,
  coordinates: r.coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
}));

// Convenience: just the coordinate arrays for rendering polylines
export const ROAD_COORDINATES: GeoPoint[][] = ROAD_SEGMENTS.map((r) => r.coordinates);

// Named roads only (for overlays at lower zoom)
export const NAMED_ROADS: RoadSegment[] = ROAD_SEGMENTS.filter((r) => r.name.length > 0);
