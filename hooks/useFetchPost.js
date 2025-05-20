import { useState } from 'react';
import { useAuth } from '../AuthContext';

export function useFetchPost(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (url, body, isFormData = false, method = 'POST') => {
    setLoading(true);
    setError(null);

    try {
      const headers = new Headers();
      if (!isFormData) {
        headers.append('Content-Type', 'application/json');
      }
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }

      const options = {
        method,
        headers,
        body: isFormData ? body : JSON.stringify(body),
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw { status: response.status, body: errorBody };
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, post };
}
