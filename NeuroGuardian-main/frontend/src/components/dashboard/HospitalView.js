import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHospital, FaPhone, FaAmbulance, FaMapMarkerAlt, 
  FaClock, FaExclamationTriangle, FaDirections,
  FaStar, FaLocationArrow, FaSync, FaBuilding,
  FaInfoCircle, FaHeartbeat, FaBed, FaUserMd
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { searchAllHospitals, getCityFromCoordinates, getHyderabadStrokeCenters } from '../../services/hospitalService';

const HospitalView = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km
  const [refreshing, setRefreshing] = useState(false);
  const [usingSource, setUsingSource] = useState('');

  // Get user's location
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoading(false);
      // Fallback to Hyderabad coordinates
      fetchHospitals(17.3850, 78.4867, 'Hyderabad (Default)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get city name
        const city = await getCityFromCoordinates(latitude, longitude);
        
        setUserLocation({ lat: latitude, lng: longitude, city });
        fetchHospitals(latitude, longitude, city);
        
        toast.success(`📍 Located in ${city}`);
      },
      (error) => {
        console.error('Location error:', error);
        let errorMsg = 'Using Hyderabad as default location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions for accurate results.';
            break;
          default:
            errorMsg += 'Showing Hyderabad hospitals.';
        }
        
        setLocationError(errorMsg);
        toast.error(errorMsg);
        
        // Fallback to Hyderabad
        fetchHospitals(17.3850, 78.4867, 'Hyderabad');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Fetch hospitals using free APIs
  const fetchHospitals = async (lat, lng, cityName, radius = searchRadius) => {
    setLoading(true);
    setUsingSource(`Searching within ${radius}km...`);
    
    try {
      // Convert km to meters for the API
      const radiusMeters = radius * 1000;
      const results = await searchAllHospitals(lat, lng, radiusMeters);
      
      // FIX: Filter hospitals by distance AGAIN in frontend
      const filteredByRadius = results.filter(
        hospital => hospital.distance <= radius
      );
      
      console.log(`📍 Found ${results.length} total, ${filteredByRadius.length} within ${radius}km`);
      
      setHospitals(filteredByRadius);
      setUsingSource(`Found ${filteredByRadius.length} stroke-ready hospitals within ${radius}km`);
      
      if (filteredByRadius.length === 0) {
        toast.error(`No stroke centers found within ${radius}km. Try increasing the radius.`);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Could not fetch hospitals. Using sample data.');
      
      // Fallback - also filter by radius
      const fallbackData = getHyderabadStrokeCenters(lat, lng);
      const filteredFallback = fallbackData.filter(h => h.distance <= radius);
      setHospitals(filteredFallback);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (userLocation) {
      fetchHospitals(userLocation.lat, userLocation.lng, userLocation.city, searchRadius);
    } else {
      getUserLocation();
    }
  };

  const handleAmbulanceCall = () => {
    toast.success(
      <div>
        <div className="font-bold">🚑 Connecting to Emergency Services</div>
        <div className="text-sm mt-1">Dialing: 108</div>
        <div className="text-xs mt-2 text-gray-300">
          Ambulance will be dispatched to your location
        </div>
      </div>,
      { duration: 5000 }
    );
    window.location.href = 'tel:108';
  };

  const handleHospitalCall = (phone) => {
    if (phone && phone !== 'Contact via 108') {
      window.location.href = `tel:${phone.replace(/[^0-9]/g, '')}`;
    } else {
      handleAmbulanceCall();
    }
  };

  const handleDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = (hospital) => {
    const text = `🏥 ${hospital.name}\n📍 ${hospital.address}\n📞 ${hospital.phone}\n🚑 Emergency: 108\n🛏️ Beds: ${hospital.beds} (ICU: ${hospital.icu_beds})\n📏 Distance: ${hospital.distance} km`;
    navigator.clipboard.writeText(text);
    toast.success('Hospital info copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Detecting your location...</p>
          <p className="text-xs text-gray-500 mt-2">Finding stroke-ready hospitals near you</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FaHeartbeat className="text-red-400" />
              Stroke-Ready Hospitals Near You
            </h2>
            {userLocation?.city ? (
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <FaLocationArrow className="text-green-400" />
                {userLocation.city} • {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-gray-400 text-sm">📍 Hyderabad region</p>
            )}
            {locationError && (
              <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                <FaInfoCircle />
                {locationError}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">{usingSource}</p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchRadius}
              onChange={(e) => {
                const newRadius = Number(e.target.value);
                setSearchRadius(newRadius);
                if (userLocation) {
                  fetchHospitals(userLocation.lat, userLocation.lng, userLocation.city, newRadius);
                } else {
                  fetchHospitals(17.3850, 78.4867, 'Hyderabad', newRadius);
                }
              }}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              style={{ color: 'white', backgroundColor: '#1f2937' }}
            >
              <option value={5} style={{ color: 'white', backgroundColor: '#1f2937' }}>5 km radius</option>
              <option value={10} style={{ color: 'white', backgroundColor: '#1f2937' }}>10 km radius</option>
              <option value={15} style={{ color: 'white', backgroundColor: '#1f2937' }}>15 km radius</option>
              <option value={20} style={{ color: 'white', backgroundColor: '#1f2937' }}>20 km radius</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-white">{hospitals.length}</p>
          <p className="text-xs text-gray-400">Stroke Centers</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-400">
            {hospitals.reduce((sum, h) => sum + (h.beds || 0), 0)}
          </p>
          <p className="text-xs text-gray-400">Total Beds</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-400">
            {hospitals.reduce((sum, h) => sum + (h.icu_beds || 0), 0)}
          </p>
          <p className="text-xs text-gray-400">ICU Beds</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-400">
            {hospitals.filter(h => h.type === 'Government').length}
          </p>
          <p className="text-xs text-gray-400">Govt Hospitals</p>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="grid grid-cols-1 gap-6">
        {hospitals.length > 0 ? (
          hospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <FaHospital className="text-4xl text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-white">{hospital.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          hospital.type === 'Government' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {hospital.type}
                        </span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                          🧠 Stroke Center
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-purple-400 flex-shrink-0" />
                        {hospital.address}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FaBed className="text-blue-400" /> {hospital.beds} Beds
                        </p>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FaHeartbeat className="text-red-400" /> ICU: {hospital.icu_beds}
                        </p>
                      </div>
                      {hospital.phone && hospital.phone !== 'Contact via 108' && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          <FaPhone className="text-purple-400" />
                          {hospital.phone}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-gray-400">Distance</span>
                      <p className="text-2xl font-bold text-purple-400">{hospital.distance.toFixed(1)} km</p>
                      <p className="text-xs text-gray-500">ETA: {Math.ceil(hospital.distance * 3)} mins</p>
                    </div>
                  </div>

                  {/* Info Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                      <FaAmbulance /> 108 Ambulance
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                      <FaUserMd /> 24/7 Neurologist
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {hospital.specialty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAmbulanceCall}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition font-medium"
                >
                  <FaAmbulance />
                  <span>🚨 108 Ambulance</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleHospitalCall(hospital.phone)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                >
                  <FaPhone />
                  <span>Call Hospital</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDirections(hospital)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition"
                >
                  <FaDirections />
                  <span>Get Directions</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShare(hospital)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition"
                >
                  <FaInfoCircle />
                  <span>Share Info</span>
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <FaHospital className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No stroke centers found within {searchRadius}km</h3>
            <p className="text-gray-500">Try increasing the search radius or refresh</p>
            <button
              onClick={() => {
                setSearchRadius(15);
                if (userLocation) {
                  fetchHospitals(userLocation.lat, userLocation.lng, userLocation.city, 15);
                }
              }}
              className="mt-4 px-6 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg"
            >
              Try 15km radius
            </button>
          </div>
        )}
      </div>

      {/* Emergency Footer */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">🚨 24/7 Stroke Emergency</h3>
        <p className="text-gray-300">
          For immediate stroke emergency, call{' '}
          <a 
            href="tel:108" 
            className="text-red-400 font-bold text-lg hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = 'tel:108';
            }}
          >
            108 (National Ambulance)
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-4">
          🆓 Stroke-ready hospitals • 24/7 Neurologist available • No API key required
        </p>
      </div>
    </motion.div>
  );
};

export default HospitalView;