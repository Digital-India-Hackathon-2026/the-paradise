// src/services/hospitalService.js
import axios from 'axios';

// ============================================
// Calculate distance between coordinates
// ============================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat2 || !lon2) return 999;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

// ============================================
// Search hospitals using Overpass API
// ============================================
export const searchAllHospitals = async (lat, lng, radiusMeters = 10000) => {
  console.log('📍 Searching for stroke-ready hospitals near:', lat, lng);
  
  try {
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"]["healthcare:speciality"~"neurology|stroke|neurosurgery|neuro"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"]["healthcare:speciality"~"neurology|stroke|neurosurgery|neuro"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="hospital"]["healthcare:speciality"~"neurology|stroke|neurosurgery|neuro"](around:${radiusMeters},${lat},${lng});
      );
      out body 20;
    `;
    
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      { 
        headers: { 'Content-Type': 'text/plain' },
        timeout: 10000
      }
    );
    
    if (response.data.elements && response.data.elements.length > 0) {
      const hospitals = response.data.elements.map((element) => ({
        id: element.id,
        name: element.tags?.name || 'Unnamed Hospital',
        address: element.tags?.['addr:full'] || 
                 element.tags?.['addr:street'] || 
                 'Address not available',
        lat: element.lat || element.center?.lat,
        lng: element.lon || element.center?.lon,
        distance: calculateDistance(
          lat, lng, 
          element.lat || element.center?.lat, 
          element.lon || element.center?.lon
        ),
        phone: element.tags?.phone || element.tags?.['contact:phone'] || 'Contact via 108',
        website: element.tags?.website,
        emergency: '24/7 Stroke Ready',
        type: 'Private',
        specialty: element.tags?.['healthcare:speciality'] || 'Neurology',
        beds: 300,
        icu_beds: 50
      }));
      
      const validHospitals = hospitals
        .filter(h => h.lat && h.lng && h.name !== 'Unnamed Hospital')
        .sort((a, b) => a.distance - b.distance);
      
      if (validHospitals.length > 0) {
        return validHospitals;
      }
    }
    
    return getHyderabadStrokeCenters(lat, lng);
    
  } catch (error) {
    console.error('📍 API Error:', error);
    return getHyderabadStrokeCenters(lat, lng);
  }
};

// ============================================
// Get city name from coordinates
// ============================================
export const getCityFromCoordinates = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `zoom=10`,
      {
        headers: {
          'User-Agent': 'NeuroGuardian/1.0'
        }
      }
    );
    
    const address = response.data.address;
    return address.city || address.town || address.village || address.state_district || 'Hyderabad';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Hyderabad';
  }
};

// ============================================
// SNIST Nearby Stroke Centers Database (UPDATED)
// SNIST Coordinates: 17.4500°N, 78.6600°E
// ============================================
export const getHyderabadStrokeCenters = (lat, lng) => {
  const strokeCenters = [
    {
      id: 1,
      name: 'Spark Hospitals',
      address: 'Pankaj Towers, Beside Axis Bank, Plot No. 2&3, Warangal Highway Main Road, Peerzadiguda, Uppal, Hyderabad, Telangana - 500039',
      lat: 17.416821,
      lng: 78.583542,
      phone: '040 2720 6777',
      emergency: '24/7 Stroke Ready',
      type: 'Private',
      specialty: 'Neurology, Neurosurgery & Emergency Care',
      stroke_team: '24/7 Stroke & Neuro Critical Care Team',
      ambulance: '04027206777 / 108',
      beds: 100,
      icu_beds: 40
    },
    {
      id: 2,
      name: 'Aditya Hospital',
      address: 'Survey No 93/2 & 125, Opp. Bharath Petrol Pump, Warangal Highway Main Road, Shanthi Nagar, Uppal, Hyderabad, Telangana - 500039',
      lat: 17.402245,
      lng: 78.563512,
      phone: '040 3385 5555',
      emergency: '24/7 Emergency & ICU Care',
      type: 'Private',
      specialty: 'Neurology, Critical Care & Multi-Specialty',
      stroke_team: 'Consultant Neurologists & On-call Neuro Surgeon',
      ambulance: '9100405555 / 108',
      beds: 150,
      icu_beds: 35
    },
    {
      id: 3,
      name: 'TX Hospitals',
      address: '# 2-6-71, Bharath Nagar Colony, Near Uppal Bus Stand, Beerappagadda, Uppal, Hyderabad, Telangana - 500039',
      lat: 17.401189,
      lng: 78.560492,
      phone: '040 4310 8108',
      emergency: '24/7 Stroke & Trauma Emergency',
      type: 'Private',
      specialty: 'Neurology, Advanced Surgical & Critical Care',
      stroke_team: 'Round-the-clock Neuro Sciences & Stroke Team',
      ambulance: '91445 14459 / 108',
      beds: 200,
      icu_beds: 45
    },
    {
      id: 4,
      name: 'Kamineni Hospitals',
      address: 'Inner Ring Road, Central Bank Colony, LB Nagar, Hyderabad, Telangana - 500074',
      lat: 17.348621,
      lng: 78.549187,
      phone: '040 2402 2222',
      emergency: '24/7 Comprehensive Stroke Center',
      type: 'Private',
      specialty: 'Neurology, Neurosurgery & Neuro-Intervention',
      stroke_team: 'Dedicated 24/7 Neuro-Intervention & Stroke Team',
      ambulance: '040 2402 2222 / 108',
      beds: 450,
      icu_beds: 80
    }
  ];
  
  return strokeCenters.map(hospital => ({
    ...hospital,
    distance: calculateDistance(lat, lng, hospital.lat, hospital.lng)
  })).sort((a, b) => a.distance - b.distance);
};