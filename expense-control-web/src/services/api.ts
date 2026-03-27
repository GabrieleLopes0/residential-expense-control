import axios from 'axios';

// Base URL da API
export const api = axios.create({
  baseURL: 'http://localhost:5285/api',
});