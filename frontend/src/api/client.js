import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://vaulty-backend.onrender.com/api/',
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
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url && (originalRequest.url.includes('token/') || originalRequest.url.includes('token/refresh/'))) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const response = await apiClient.post('token/refresh/', {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.warn("Token is not valid. Redirecting to login page...");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                localStorage.removeItem('role_name');
                localStorage.removeItem('permissions');
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)

export default apiClient;