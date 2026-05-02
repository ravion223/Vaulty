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

// unauthorized error handler for future authorization
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Token is not valid. Redirecting to login page...");
            localStorage.removeItem('access_token');
            // /login in future
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)

export default apiClient;