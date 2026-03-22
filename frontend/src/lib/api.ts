const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getToken() {
  return localStorage.getItem('mv_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; doctor: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: any) =>
    request<{ token: string; doctor: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<{ doctor: any }>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  // Patients
  getPatients: (search?: string) =>
    request<{ patients: any[] }>(`/patients${search ? `?search=${search}` : ''}`),
  getPatient: (id: string) => request<{ patient: any }>(`/patients/${id}`),
  createPatient: (data: any) =>
    request<{ patient: any }>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) =>
    request<{ patient: any }>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Visits
  getVisits: (params?: { status?: string; patientId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ visits: any[] }>(`/visits${qs}`);
  },
  createVisit: (data: { patientId: string; rawNote: string; audioUrl?: string }) =>
    request<{ visit: any; report: any }>('/visits', { method: 'POST', body: JSON.stringify(data) }),
  updateReport: (visitId: string, data: any) =>
    request<{ report: any }>(`/visits/${visitId}/report`, { method: 'PATCH', body: JSON.stringify(data) }),
  signReport: (visitId: string) =>
    request<{ visit: any }>(`/visits/${visitId}/sign`, { method: 'POST' }),
  deleteVisit: (visitId: string) =>
    request<{ success: boolean }>(`/visits/${visitId}`, { method: 'DELETE' }),

  // Reports
  getReports: (params?: { status?: string; search?: string }) => {
    const clean: Record<string, string> = {};
    if (params?.status) clean.status = params.status;
    if (params?.search) clean.search = params.search;
    const qs = Object.keys(clean).length ? '?' + new URLSearchParams(clean).toString() : '';
    return request<{ reports: any[] }>(`/reports${qs}`);
  },
};
