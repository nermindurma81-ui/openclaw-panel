// ===== OpenClaw Gateway API Client =====
// Connects via the backend proxy (/api/) to OpenClaw gateway

class OpenClawAPI {
  constructor(options = {}) {
    // Use proxy path if running through the backend server
    this.baseUrl = options.baseUrl || '/api';
    this.token = options.token || '';
    this.connected = false;
    this.listeners = {};
  }

  // ===== Core Fetch =====
  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API ${res.status}: ${err}`);
      }

      const text = await res.text();
      try { return JSON.parse(text); } catch { return text; }
    } catch (err) {
      console.error(`API Error [${path}]:`, err.message);
      this.emit('error', { path, error: err.message });
      throw err;
    }
  }

  // ===== Config =====
  async getConfig() {
    return this.request('/config');
  }

  async updateConfig(patch) {
    return this.request('/config', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  async restartGateway() {
    return this.request('/restart', { method: 'POST' });
  }

  // ===== Sessions =====
  async getSessions() {
    return this.request('/sessions');
  }

  async getSession(key) {
    return this.request(`/sessions/${encodeURIComponent(key)}`);
  }

  async getSessionHistory(key, limit = 50) {
    return this.request(`/sessions/${encodeURIComponent(key)}/history?limit=${limit}`);
  }

  async createSession(options = {}) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async deleteSession(key) {
    return this.request(`/sessions/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  async sendMessage(sessionKey, message) {
    return this.request(`/sessions/${encodeURIComponent(sessionKey)}/send`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ===== Cron Jobs =====
  async getCronJobs() {
    return this.request('/cron');
  }

  async createCronJob(job) {
    return this.request('/cron', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateCronJob(id, patch) {
    return this.request(`/cron/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  async deleteCronJob(id) {
    return this.request(`/cron/${id}`, { method: 'DELETE' });
  }

  async runCronJob(id) {
    return this.request(`/cron/${id}/run`, { method: 'POST' });
  }

  async getCronJobRuns(id) {
    return this.request(`/cron/${id}/runs`);
  }

  // ===== Skills =====
  async getSkills() {
    return this.request('/skills');
  }

  async installSkill(slug, version) {
    return this.request('/skills/install', {
      method: 'POST',
      body: JSON.stringify({ slug, version }),
    });
  }

  async uninstallSkill(slug) {
    return this.request(`/skills/${slug}`, { method: 'DELETE' });
  }

  // ===== Status & Health =====
  async getStatus() {
    return this.request('/status');
  }

  async getHealth() {
    return this.request('/health');
  }

  // ===== Models =====
  async getModels() {
    return this.request('/models');
  }

  // ===== Gateway Auth =====
  async authenticate(token) {
    this.token = token;
    try {
      const status = await this.getStatus();
      this.connected = true;
      this.emit('connected', status);
      return status;
    } catch (err) {
      this.connected = false;
      this.emit('disconnected', err);
      throw err;
    }
  }

  // ===== WebSocket (for live updates) =====
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.emit('ws-connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (e) {
        console.log('WS message:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.emit('ws-disconnected');
      // Auto-reconnect after 5s
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  // ===== Event Emitter =====
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
}

// Export for use in app.js
window.OpenClawAPI = OpenClawAPI;
