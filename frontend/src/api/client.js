import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});


// automatically signs JWT to each request if token is in the memory
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default apiClient;