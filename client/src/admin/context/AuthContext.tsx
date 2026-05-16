import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'HOST';
  mustChangePassword: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (t: string) => {
    const r = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } });
    setUser(r.data);
  };

  useEffect(() => {
    localStorage.removeItem('vms_token');
    const stored = sessionStorage.getItem('vms_token');
    if (!stored) { setLoading(false); return; }
    fetchMe(stored)
      .then(() => setToken(stored))
      .catch(() => { sessionStorage.removeItem('vms_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await axios.post('/api/auth/login', { email, password });
    const { token: t, user: u } = r.data;
    sessionStorage.setItem('vms_token', t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    sessionStorage.removeItem('vms_token');
    localStorage.removeItem('vms_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const t = sessionStorage.getItem('vms_token');
    if (t) await fetchMe(t);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
