import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null); // Para controlar la validez

  //Controla el token de expiracion
  useEffect(() => {
    if (tokenExpiry) {
      const now = new Date().getTime();
      const timeout = tokenExpiry - now;
      if (timeout > 0) {
        const timer = setTimeout(() => {
          setAccessToken(null);
          setTokenExpiry(null);
        }, timeout);
        return () => clearTimeout(timer);
      } else {
        setAccessToken(null);
        setTokenExpiry(null);
      }
    }
  }, [tokenExpiry]);
 //Obtiene el tiempo de expiracion en expiresInSeconds
  const login = (token, expiresInSeconds) => {
    setAccessToken(token);
    const expiryTime = new Date().getTime() + expiresInSeconds * 1000;
    setTokenExpiry(expiryTime);
  };
  //Para cerrado de sesion (borra el token y la fecha de expiracion)
  const logout = () => {
    setAccessToken(null);
    setTokenExpiry(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
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
