import { useState } from 'react';

export function useFetchPost(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (url, bodyData, isFormData = false) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: isFormData ? bodyData : JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
        throw { status: response.status, body: json || text };
      }

      const json = await response.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, post };
}
