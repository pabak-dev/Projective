import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// **এই অংশটি যোগ করুন**
// এটি প্রতিবার API রিকোয়েস্ট করার আগে লোকাল স্টোরেজ থেকে টোকেন নেবে।
const token = localStorage.getItem('auth_token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// **অতিরিক্ত: একটি ইন্টারসেপ্টর যোগ করা একটি উন্নত পদ্ধতি**
// এটি লগইন বা লগআউট করার পর টোকেন ডায়নামিকভাবে আপডেট করতে সাহায্য করে।
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});