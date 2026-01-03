import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';
const API_URL = isProduction
  ? 'https://fundacionesperanzatogo.tg/edtManager/react-flutter-fusion/api'
  : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.establishmentCode) {
          config.headers['x-etablissement-code'] = user.establishmentCode;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      console.error('Détails erreur API:', error.response.data);
    } else {
      console.error('Erreur API:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;