// API Service for communicating with FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const apiFetch = (url, options = {}) => fetch(url, { ...options, credentials: 'include' });

// Dashboard API
export const dashboardAPI = {
  getSummary: async (year = null) => {
    try {
      const url = new URL(`${API_BASE_URL}/dashboard/summary`);
      if (year) {
        url.searchParams.append('year', year);
      }
      
      const response = await apiFetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }
};

// Members API
export const membersAPI = {
  getAll: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/members`);
      
      // Add query parameters
      if (params.page) url.searchParams.append('page', params.page);
      if (params.page_size) url.searchParams.append('page_size', params.page_size);
      if (params.patient_id) url.searchParams.append('patient_id', params.patient_id);
      if (params.flag_status) url.searchParams.append('flag_status', params.flag_status);
      if (params.review_status) url.searchParams.append('review_status', params.review_status);
      if (params.sex) url.searchParams.append('sex', params.sex);
      if (params.min_age) url.searchParams.append('min_age', params.min_age);
      if (params.max_age) url.searchParams.append('max_age', params.max_age);
      
      const response = await apiFetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  getHistory: async (patientId) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/members/${patientId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Patient ${patientId} not found`);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching member history:', error);
      throw error;
    }
  },

  markForReview: async (patientId) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/members/${patientId}/mark-for-review`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking member for review:', error);
      throw error;
    }
  },

  submitDecision: async (patientId, decision, source) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/members/${patientId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: decision, source })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Decision Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting member decision:', error);
      throw error;
    }
  }
};

// Auth API (if needed for future)
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await apiFetch(`${AUTH_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const error = new Error(`Login failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  logout: async () => {
    const response = await apiFetch(`${AUTH_BASE_URL}/api/auth/logout`, { method: 'POST' });
    if (!response.ok) throw new Error(`Logout failed: ${response.status}`);
    return response.json();
  },

  me: async () => {
    const response = await apiFetch(`${AUTH_BASE_URL}/api/auth/me`);
    if (!response.ok) throw new Error(`Session check failed: ${response.status}`);
    return response.json();
  }
};

// HCC Mapping & Ingestion API
export const hccAPI = {
  uploadCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch(`${API_BASE_URL}/hcc-mapping/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Upload Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading CSV and mapping HCC:', error);
      throw error;
    }
  },

  getResults: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/hcc-mapping/results`);
      
      // Add query parameters
      if (params.page) url.searchParams.append('page', params.page);
      if (params.page_size) url.searchParams.append('page_size', params.page_size);
      if (params.mapping_status) url.searchParams.append('mapping_status', params.mapping_status);
      if (params.patient_id) url.searchParams.append('patient_id', params.patient_id);

      const response = await apiFetch(url.toString());

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HCC results:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/hcc-mapping/stats`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching HCC stats:', error);
      throw error;
    }
  },

  classifyMembers: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/hcc-mapping/classify-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Classification Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error classifying members:', error);
      throw error;
    }
  },

  assignForAgent: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/hcc-mapping/assign-for-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Assignment Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning for agent:', error);
      throw error;
    }
  },

  assignForML: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/hcc-mapping/assign-for-ml`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Assignment Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning for ML:', error);
      throw error;
    }
  }
};

// ML & Agent API
export const mlAgentAPI = {
  /**
   * Fetch FLAGGED members from members_2025 for the Agent Analysis page.
   * Returns { members: [...], total: N }
   */
  getFlaggedMembers: async (page = 1, limit = 5) => {
    try {
      const url = new URL(`${API_BASE_URL}/ml-agent/flagged-members`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      const response = await apiFetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching flagged members:', error);
      throw error;
    }
  },

  /**
   * Fetch UNFLAGGED members from members_2025 for the ML Prediction page.
   * Returns { members: [...], total: N }
   */
  getUnflaggedMembers: async (page = 1, limit = 5) => {
    try {
      const url = new URL(`${API_BASE_URL}/ml-agent/unflagged-members`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      const response = await apiFetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching unflagged members:', error);
      throw error;
    }
  }
};
