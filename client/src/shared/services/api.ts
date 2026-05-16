import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('vms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// OTP
export const sendOtp = (phone: string) => api.post('/otp/send', { phone });
export const verifyOtp = (phone: string, otp: string) => api.post('/otp/verify', { phone, otp });

// Visitors
export const getVisitorByPhone = (phone: string) => api.get(`/visits/visitors/phone/${encodeURIComponent(phone)}`);

// Hosts dropdown (public)
export const getHosts = () => api.get('/visits/hosts');

// Visits
export const createVisit = (data: object) => api.post('/visits', data);
export const getVisitStatus = (id: number) => api.get(`/visits/status/${id}`);
export const getVisitPass = (visitId: string) => api.get(`/visits/pass/${visitId}`);
export const getVisits = () => api.get('/visits');
export const getVisitById = (visitId: string) => api.get(`/visits/${visitId}`);
export const approveVisit = (id: number) => api.patch(`/visits/${id}/approve`);
export const rejectVisit = (id: number) => api.patch(`/visits/${id}/reject`);
export const scanQr = (visitId: string) => api.post('/scan', { visitId });
export const recoverPass = (phone: string) => api.get(`/visits/recover/${encodeURIComponent(phone)}`);

// Auth
export const changePassword = (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data);

// Host management (OWNER only)
export const getHostUsers = () => api.get('/users/hosts');
export const createHostUser = (data: { name: string; email: string }) => api.post('/users/hosts', data);
export const deactivateHost = (id: number) => api.patch(`/users/hosts/${id}/deactivate`);
export const reactivateHost = (id: number) => api.patch(`/users/hosts/${id}/reactivate`);
export const resetHostPassword = (id: number) => api.patch(`/users/hosts/${id}/reset-password`);
