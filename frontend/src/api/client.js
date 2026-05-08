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

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config.url;
            if (requestUrl && requestUrl.includes('token/')){
                return Promise.reject(error);
            }

            console.warn("Token is not valid. Redirecting to login page...");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default apiClient;