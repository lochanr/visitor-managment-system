import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export const sendOtp = (phone: string) => api.post('/otp/send', { phone });
export const verifyOtp = (phone: string, otp: string) => api.post('/otp/verify', { phone, otp });

export const createVisit = (data: object) => api.post('/visits', data);
export const getVisits = () => api.get('/visits');
export const getVisitById = (visitId: string) => api.get(`/visits/${visitId}`);
export const approveVisit = (id: number) => api.patch(`/visits/${id}/approve`);
export const rejectVisit = (id: number) => api.patch(`/visits/${id}/reject`);

export const scanQr = (visitId: string) => api.post('/scan', { visitId });
