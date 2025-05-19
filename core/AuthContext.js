import React, { createContext, useState, useEffect, useContext } from 'react';
import storage from './storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshExpiry, setRefreshExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const TOKEN_KEY = 'flora_token';
  const EXPIRY_KEY = 'flora_token_expiry';
  const REFRESH_KEY = 'flora_refresh_token';
  const REFRESH_EXPIRY_KEY = 'flora_refresh_token_expiry';

  // Restaurar tokens al iniciar (sin expiración local)
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        const expiry = await storage.getItem(EXPIRY_KEY);
        const refresh = await storage.getItem(REFRESH_KEY);
        const refreshExp = await storage.getItem(REFRESH_EXPIRY_KEY);
        setAccessToken(token || null);
        setTokenExpiry(expiry ? parseInt(expiry, 10) : null);
        setRefreshToken(refresh || null);
        setRefreshExpiry(refreshExp ? parseInt(refreshExp, 10) : null);
      } catch {}
      setLoading(false);
    };
    restoreToken();
  }, []);

  // Login: guarda ambos tokens y expiraciones
  const login = async (token, expiresInSeconds, refresh, refreshExpiresInSeconds) => {
    setAccessToken(token);
    setRefreshToken(refresh);
    const expiryTime = Date.now() + expiresInSeconds * 1000;
    const refreshExpTime = Date.now() + refreshExpiresInSeconds * 1000;
    setTokenExpiry(expiryTime);
    setRefreshExpiry(refreshExpTime);
    try {
      await storage.multiSet([
        [TOKEN_KEY, token],
        [EXPIRY_KEY, expiryTime.toString()],
        [REFRESH_KEY, refresh],
        [REFRESH_EXPIRY_KEY, refreshExpTime.toString()],
      ]);
    } catch {}
  };

  // Logout: limpia todo
  const logout = async () => {
    setAccessToken(null);
    setTokenExpiry(null);
    setRefreshToken(null);
    setRefreshExpiry(null);
    await storage.multiRemove([TOKEN_KEY, EXPIRY_KEY, REFRESH_KEY, REFRESH_EXPIRY_KEY]);
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
