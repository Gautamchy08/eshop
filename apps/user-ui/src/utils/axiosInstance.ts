import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ,
  withCredentials: true, // to send cookies with requests
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// handle logout and prevent infinite loop

const handleLogout = () => {
    if(window.location.pathname !== '/login'){
        window.location.href = '/login';
    }
}

// handle adding a new access token to queued requests

const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}

// execute all queued requests after token refresh

const onRefreshed = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
}

// handle api requests

axiosInstance.interceptors.request.use(
    (config)=>config,
    (error)=>Promise.reject(error));

    // handle expired tokens and refresh logic

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // prevent infinite loops

        if(error.response?.status === 401 && !originalRequest._retry){

            console.log('401 intercepted from response');

            if(isRefreshing){
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                });
            } 
            
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('trying to refresh the token....');
                await axiosInstance.post('/api/refresh-token',{},{withCredentials:true});
                isRefreshing = false;
                onRefreshed();
                return axiosInstance(originalRequest);
            } catch (err) {
                console.log('token refresh failed', err);
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(err);
            }  
        }

        // return Promise.reject(error);
    });
export default axiosInstance;

// {    
//     USER MAKES REQUEST
//     ↓
// Request Interceptor
//   (Add auth headers)
//     ↓
// Request sent to backend
//     ↓
// ┌─────────────────────────────────────────┐
// │   Response Interceptor receives response │
// └─────────────────────────────────────────┘
//     ↓
// Is status 200-299 (success)?
//   YES → Return response to user ✅
//   NO  → Continue...
//     ↓
// Is status 401 (token expired)?
//   NO  → Return error to user ❌
//   YES → Continue...
//     ↓
// Has this request been retried already?
//   YES → Return error to user ❌
//   NO  → Continue...
//     ↓
// Is token currently being refreshed?
//   YES → Queue this request, wait for refresh ⏳
//   NO  → Continue...
//     ↓
// START REFRESHING TOKEN
//     ↓
// ┌─────────────────────────────────────────┐
// │ POST to /refresh-token-user              │
// │ (backend gives new access token)         │
// └─────────────────────────────────────────┘
//     ↓
// Did refresh succeed?
//   NO  → Logout user & show login page ❌
//   YES → Continue...
//     ↓
// RETRY ALL QUEUED REQUESTS with new token
//     ↓
// Clear queue
//     ↓
// Return updated data to user ✅
// }  

//  real example of axios interceptors for handling token refresh logic

// {
//     TIME 0:00
// └─ User logs in successfully
//    └─ Backend sends: access_token (expires in 15 min)

// TIME 0:15 → REQUEST 1: GET /api/profile
// └─ Request sent with access_token
// └─ Backend: "Token expired! 401"
// └─ Response Interceptor catches it
//    └─ isRefreshing = false
//    └─ Start refresh process
//    └─ POST /refresh-token-user
//    └─ Backend: "Here's your new token"
//    └─ isRefreshing = false
//    └─ Retry: GET /api/profile (with NEW token)
//    └─ Backend: "200 OK - here's your profile"
//    └─ User gets data ✅

// TIME 0:15:01 → REQUEST 2: GET /api/settings
// └─ Request sent with old token
// └─ Backend: "Token expired! 401"
// └─ Response Interceptor catches it
//    └─ isRefreshing = true (from REQUEST 1)
//    └─ Queue this request: () => axiosInstance(req2)
//    └─ Wait...
//    └─ (REQUEST 1 finishes refresh)
//    └─ onRefreshed() called
//    └─ Execute queued request with NEW token
//    └─ Retry: GET /api/settings
//    └─ Backend: "200 OK - here's your settings"
//    └─ User gets data ✅
// }