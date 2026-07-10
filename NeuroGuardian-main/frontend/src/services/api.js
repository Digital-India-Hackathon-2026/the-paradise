import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`, config.data);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`📥 Response from ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code outside 2xx
            console.error('❌ Response error:', error.response.status, error.response.data);
            
            // Handle 401 Unauthorized - token expired
            if (error.response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('❌ No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('❌ Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ========== AUTHENTICATION API CALLS ==========

export const login = async (username, password) => {
    try {
        const response = await api.post('login/', { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('register/', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

// ========== PREDICTION API CALLS ==========

export const predictStroke = async (patientData) => {
    try {
        const response = await api.post('predict/', patientData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadScan = async (file) => {
    const formData = new FormData();
    formData.append('scan', file);
    
    try {
        const response = await api.post('upload-scan/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ========== HISTORY API CALLS ==========

export const getHistory = async () => {
    try {
        const response = await api.get('history/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getStats = async () => {
    try {
        const response = await api.get('stats/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ========== HEALTH CHECK ==========

export const checkHealth = async () => {
    try {
        const response = await api.get('health/');
        return response.data;
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
};

// ========== UTILITY FUNCTIONS ==========

export const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
        case 'low risk':
        case 'no risk':
        case 'normal':
            return '#4CAF50';
        case 'moderate risk':
            return '#FF9800';
        case 'high risk':
        case 'ischemic':
            return '#f44336';
        case 'critical risk':
        case 'hemorrhagic':
            return '#9C27B0';
        case 'analyzing':
            return '#2196f3';
        default:
            return '#666';
    }
};

export const getRiskLevelEmoji = (level) => {
    switch (level?.toLowerCase()) {
        case 'low risk':
        case 'no risk':
        case 'normal':
            return '🟢';
        case 'moderate risk':
            return '🟠';
        case 'high risk':
        case 'ischemic':
            return '🔴';
        case 'critical risk':
        case 'hemorrhagic':
            return '🟣';
        case 'analyzing':
            return '🔍';
        default:
            return '⚪';
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
};

export default api;