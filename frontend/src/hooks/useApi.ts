import { useState } from 'react';
import apiClient from '../utils/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const post = async (url: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(url, data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const put = async (url: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const del = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { get, post, put, del, loading, error };
};
