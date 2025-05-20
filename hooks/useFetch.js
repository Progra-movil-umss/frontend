import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../core/api';

export function useFetch(url, options = {}) {
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

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    apiFetch(url.replace(/^https?:\/\/[^/]+/, ''), {
      ...options,
      signal: abortControllerRef.current?.signal,
    })
      .then(({ ok, data }) => {
        if (!ok) throw data;
        if (!cancelled) setData(data);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [url, JSON.stringify(options)]);

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setError('Petición cancelada manualmente');
      setLoading(false);
    }
  };

  return { data, loading, error, cancelRequest };
}
