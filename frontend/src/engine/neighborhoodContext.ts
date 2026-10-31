import type { UrbanArchetype, MicroMarketInfo } from '../types';

interface HubDefinition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  keywords: string[];
  archetype: UrbanArchetype;
  typicalFloorsMin: number;
  typicalFloorsMax: number;
  typicalFAR: string;
  description: string;
  landmarkNames: string[];
}

export const HYDERABAD_HUBS: HubDefinition[] = [
  {
    id: 'kokapet',
    name: 'Kokapet Neopolis Golden Mile',
    lat: 17.4125,
    lng: 78.3312,
    radiusKm: 2.8,
    keywords: ['kokapet', 'neopolis', 'golden mile', 'gandipet', 'sez'],
    archetype: 'SKYSCRAPERS',
    typicalFloorsMin: 32,
    typicalFloorsMax: 54,
    typicalFAR: 'Unlimited / 6.0 – 9.0',
    description: 'Ultra High-Rise Special Economic Zone & Mega Commercial Glass Towers',
    landmarkNames: ['SAS Crown 54F', 'Neopolis Apex 48F', 'Golden Mile One 42F', 'Kokapet Tower 36F'],
  },
  {
    id: 'financial_district',
    name: 'Financial District & Nanakramguda',
    lat: 17.4190,
    lng: 78.3440,
    radiusKm: 2.2,
    keywords: ['financial district', 'nanakramguda', 'waverock', 'us consulate'],
    archetype: 'SKYSCRAPERS',
    typicalFloorsMin: 26,
    typicalFloorsMax: 44,
    typicalFAR: '5.0 – 7.5',
    description: 'Global Financial Hub & High-Density Corporate Banking Headquarters',
    landmarkNames: ['WaveRock 28F', 'ICICI Regional HQ 34F', 'Amazon Tower 36F', 'US Consulate Enclave'],
  },
  {
    id: 'hitec_city',
    name: 'HITEC City Cyber Hub',
    lat: 17.4485,
    lng: 78.3772,
    radiusKm: 2.5,
    keywords: ['hitec', 'madhapur', 'cyber towers', 'mindspace', 'inorbit', 'knowledge city'],
    archetype: 'TECH_CAMPUS',
    typicalFloorsMin: 16,
    typicalFloorsMax: 28,
    typicalFAR: '3.5 – 5.0',
    description: 'Corporate IT Parks with Wide Floorplates, Atriums & Sky-Bridges',
    landmarkNames: ['Mindspace B7 24F', 'Cyber Gateway 18F', 'Google Campus 22F', 'T-Hub Hub 16F'],
  },
  {
    id: 'gachibowli',
    name: 'Gachibowli Tech Corridor',
    lat: 17.4401,
    lng: 78.3489,
    radiusKm: 2.2,
    keywords: ['gachibowli', 'iiit', 'mumbai highway', 'stadium', 'dlf'],
    archetype: 'TECH_CAMPUS',
    typicalFloorsMin: 14,
    typicalFloorsMax: 24,
    typicalFAR: '3.0 – 4.5',
    description: 'Mixed Tech Parks, High-Rise Commercial Hubs & Hospitality Corridors',
    landmarkNames: ['DLF Cybercity 20F', 'IIIT Academic Hub', 'Gachibowli Heights 22F', 'Radisson Tower 18F'],
  },
  {
    id: 'jubilee_hills',
    name: 'Jubilee Hills Road 36 Enclave',
    lat: 17.4328,
    lng: 78.4072,
    radiusKm: 3.2,
    keywords: ['jubilee', 'banjara', 'road 36', 'road no 36', 'film nagar', 'kavuri'],
    archetype: 'LOW_RISE_VILLAS',
    typicalFloorsMin: 2,
    typicalFloorsMax: 4,
    typicalFAR: '1.2 – 1.8 (Strict Low-Rise)',
    description: 'Low-Rise Luxury Private Villas, Courtyards, Private Pools & Lush Green Canopies',
    landmarkNames: ['Road 36 Villa G+2', 'Jubilee Enclave G+3', 'Banjara Manor G+2', 'Boutique Galleria G+3'],
  },
  {
    id: 'tellapur',
    name: 'Tellapur Township Growth Corridor',
    lat: 17.4721,
    lng: 78.2985,
    radiusKm: 3.8,
    keywords: ['tellapur', 'kollur', 'gopanpally', 'orr exit', 'my home', 'aparna'],
    archetype: 'TOWNSHIP_CLUSTERS',
    typicalFloorsMin: 18,
    typicalFloorsMax: 32,
    typicalFAR: '3.0 – 4.2',
    description: 'Master-Planned Gated Township Residential Towers & Clubhouse Parks',
    landmarkNames: ['Aparna Greens 28F', 'Tellapur Square 24F', 'ORR Heights 30F', 'Township Club 4F'],
  },
  {
    id: 'kondapur',
    name: 'Kondapur Residential Sector',
    lat: 17.4642,
    lng: 78.3582,
    radiusKm: 2.5,
    keywords: ['kondapur', 'hafeezpet', 'kothaguda', 'botanical'],
    archetype: 'TOWNSHIP_CLUSTERS',
    typicalFloorsMin: 14,
    typicalFloorsMax: 22,
    typicalFAR: '2.8 – 3.8',
    description: 'Dense Residential High-Rises & Commercial Retail Podiums',
    landmarkNames: ['Botanical Heights 20F', 'Kondapur Towers 18F', 'Aparna Sarovar 22F', 'Commercial Podium 4F'],
  },
  {
    id: 'central_hyderabad',
    name: 'Central Hyderabad Commercial Arterial',
    lat: 17.4340,
    lng: 78.4680,
    radiusKm: 4.5,
    keywords: ['begumpet', 'panjagutta', 'somajiguda', 'khairatabad', 'secunderabad', 'ameerpet'],
    archetype: 'COMMERCIAL',
    typicalFloorsMin: 8,
    typicalFloorsMax: 16,
    typicalFAR: '2.5 – 3.5',
    description: 'High-Density Traditional Commercial Streetfronts & Mid-Rise Offices',
    landmarkNames: ['Metro Plaza 14F', 'Somajiguda Commercial 12F', 'Begumpet Hub 16F', 'City Center 10F'],
  },
];

/** Calculate distance between two coordinates in km using Haversine formula */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Intelligent Hyderabad Micro-Market Classifier
 * Resolves micro-market archetype from coordinates and address text.
 * Falls back to deterministic coordinate grid hashing if outside primary hubs.
 */
export function resolveMicroMarket(
  coordinates: { lat: number; lng: number },
  address = '',
  forcedArchetype: UrbanArchetype = 'AUTO'
): MicroMarketInfo {
  // If user explicitly selected an archetype (not AUTO), respect it
  if (forcedArchetype && forcedArchetype !== 'AUTO') {
    const hub = HYDERABAD_HUBS.find((h) => h.archetype === forcedArchetype);
    if (hub) {
      return {
        id: hub.id,
        name: hub.name,
        archetype: hub.archetype,
        typicalFloorsMin: hub.typicalFloorsMin,
        typicalFloorsMax: hub.typicalFloorsMax,
        typicalFAR: hub.typicalFAR,
        description: hub.description,
        landmarkNames: hub.landmarkNames,
      };
    }
  }

  const addrLower = (address || '').toLowerCase();

  // 1. First check explicit keyword matches in address
  for (const hub of HYDERABAD_HUBS) {
    for (const kw of hub.keywords) {
      if (addrLower.includes(kw)) {
        return {
          id: hub.id,
          name: hub.name,
          archetype: hub.archetype,
          typicalFloorsMin: hub.typicalFloorsMin,
          typicalFloorsMax: hub.typicalFloorsMax,
          typicalFAR: hub.typicalFAR,
          description: hub.description,
          landmarkNames: hub.landmarkNames,
        };
      }
    }
  }

  // 2. Proximity calculation against all hubs
  let closestHub: HubDefinition | null = null;
  let minDistance = Infinity;

  for (const hub of HYDERABAD_HUBS) {
    const dist = getDistanceKm(coordinates.lat, coordinates.lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  // If within radius of the closest hub, assign that micro-market
  if (closestHub && minDistance <= closestHub.radiusKm * 1.5) {
    return {
      id: closestHub.id,
      name: closestHub.name,
      archetype: closestHub.archetype,
      typicalFloorsMin: closestHub.typicalFloorsMin,
      typicalFloorsMax: closestHub.typicalFloorsMax,
      typicalFAR: closestHub.typicalFAR,
      description: closestHub.description,
      landmarkNames: closestHub.landmarkNames,
    };
  }

  // 3. Fallback: Procedural coordinate-derived sector for outer or custom coordinates
  const latFactor = Math.abs(coordinates.lat * 100) % 10;
  const isHighDensity = latFactor > 5;

  const dynamicArchetype: UrbanArchetype = isHighDensity ? 'SKYSCRAPERS' : 'TOWNSHIP_CLUSTERS';
  const minF = isHighDensity ? 22 : 12;
  const maxF = isHighDensity ? 38 : 24;

  return {
    id: `sector-${coordinates.lat.toFixed(3)}-${coordinates.lng.toFixed(3)}`,
    name: `Hyderabad Growth Corridor (${coordinates.lat.toFixed(3)}°N, ${coordinates.lng.toFixed(3)}°E)`,
    archetype: dynamicArchetype,
    typicalFloorsMin: minF,
    typicalFloorsMax: maxF,
    typicalFAR: '3.0 – 5.5',
    description: `Dynamic procedural urban sector based on coordinates (${minDistance.toFixed(1)} km from nearest hub)`,
    landmarkNames: [
      `Tower Alpha ${maxF}F`,
      `Commercial Block ${minF + 4}F`,
      `Tech Center ${maxF - 6}F`,
      `Residences ${minF}F`,
    ],
  };
}
