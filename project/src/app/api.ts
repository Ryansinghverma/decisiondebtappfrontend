import axios from 'axios';

// ─── AXIOS INSTANCE ──────────────────────────────────────────
// This creates a single axios instance the whole app uses
// Think of it like a pre-configured version of fetch with
// the base URL and token already set up

const api = axios.create({
  baseURL: 'https://decision-debt-backend.onrender.com/api',
});

// ─── INTERCEPTOR ─────────────────────────────────────────────
// This runs automatically before EVERY request
// It grabs the token from localStorage and attaches it
// So you never have to manually add the token in each function

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ─────────────────────────────────────────────────────
// With axios, the actual data is in res.data (not res itself)
// That was the bug — fetch returns res.json() but axios wraps in res.data

export const loginUser = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // <-- this is the fix, axios wraps response in .data
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// ─── DECISIONS ────────────────────────────────────────────────

export const getDecisions = async () => {
  const res = await api.get('/decisions');
  return res.data;
};

export const getStats = async () => {
  const res = await api.get('/decisions/stats');
  return res.data;
};

export const createDecision = async (data: {
  title: string;
  category: string;
  mood: string;
  timeOfDay: string;
  expectedOutcome?: string;
  debtScore?: number;
  reviewAfterDays?: number;
  notes?: string;
}) => {
  const res = await api.post('/decisions', data);
  return res.data;
};

export const reviewDecision = async (id: string, regretScore: number) => {
  const res = await api.patch(`/decisions/${id}/review`, { regretScore });
  return res.data;
};

export const predictMood = async (activities: string[], timeOfDay: string) => {
  const res = await api.post('/decisions/predict', { activities, timeOfDay });
  return res.data;
};

// ─── STREAKS ──────────────────────────────────────────────────

export const getStreaks = async () => {
  const res = await api.get('/streaks');
  return res.data;
};

export const createStreak = async (habitName: string, icon: string) => {
  const res = await api.post('/streaks', { habitName, icon });
  return res.data;
};

export const logStreak = async (id: string) => {
  const res = await api.post(`/streaks/${id}/log`);
  return res.data;
};
