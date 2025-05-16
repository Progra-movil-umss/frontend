import { useState, useEffect, useRef } from 'react';

export function useFetch(url, token, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!url) {
      setError('URL no proporcionada');
      setLoading(false);
      return;
    }
    if (!token) {
      setError('Token de autenticación no proporcionado');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setData(null);

    fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          let json;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          throw {
            status: response.status,
            statusText: response.statusText,
            body: json || text,
          };
        }
        return response.json();
      })
      .then(json => setData(json))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Petición cancelada');
          setError('Petición cancelada');
        } else {
          setError(err);
        }
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [url, token]);

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setError('Petición cancelada manualmente');
      setLoading(false);
    }
  };

  return { data, loading, error, cancelRequest };
}
