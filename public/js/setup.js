// ===== Setup & Connection Manager =====

class SetupManager {
  constructor() {
    this.config = this.loadConfig();
    this.api = null;
  }

  loadConfig() {
    const saved = localStorage.getItem('openclaw-config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      gatewayToken: '',
      autoConnect: true,
      theme: 'dark',
      refreshInterval: 30000,
    };
  }

  saveConfig() {
    localStorage.setItem('openclaw-config', JSON.stringify(this.config));
  }

  async init() {
    // Create API client - uses /api proxy by default
    this.api = new OpenClawAPI({
      baseUrl: '/api',
      token: this.config.gatewayToken,
    });

    // Try auto-connect
    try {
      const health = await fetch('/health').then(r => r.json());
      if (health.status === 'healthy') {
        console.log('Gateway reachable');
        return true;
      }
    } catch {}

    // Gateway might not be reachable yet, but UI still works
    return true;
  }

  showSetupWizard() {
    openModal('⚙️ Gateway Connection', `
      <div class="setup-form">
        <div class="form-group">
          <label>Gateway Token (optional)</label>
          <input type="password" id="setupGatewayToken" class="form-input" 
                 placeholder="your-gateway-token" 
                 value="${this.config.gatewayToken || ''}">
          <p class="form-hint">Leave empty if using trusted-proxy auth</p>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="setupAutoConnect" ${this.config.autoConnect ? 'checked' : ''}>
            Auto-connect on startup
          </label>
        </div>
        <div id="setupStatus" class="setup-status"></div>
      </div>
    `, `
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="setupManager.testConnection()">Test</button>
      <button class="btn-primary" onclick="setupManager.saveAndConnect()">Save</button>
    `);
  }

  async testConnection() {
    const status = document.getElementById('setupStatus');
    status.innerHTML = '<span class="loading">⏳ Testing connection...</span>';

    try {
      const health = await fetch('/health').then(r => r.json());
      if (health.status === 'healthy') {
        status.innerHTML = `<span style="color: var(--green);">✅ Gateway reachable!</span>`;
      } else {
        status.innerHTML = `<span style="color: var(--orange);">⚠️ Gateway: ${health.gateway} (${health.error || 'unknown'})</span>`;
      }
    } catch (err) {
      status.innerHTML = `<span style="color: var(--red);">❌ Failed: ${err.message}</span>`;
    }
  }

  async saveAndConnect() {
    this.config.gatewayToken = document.getElementById('setupGatewayToken').value;
    this.config.autoConnect = document.getElementById('setupAutoConnect').checked;
    this.saveConfig();

    this.api = new OpenClawAPI({
      baseUrl: '/api',
      token: this.config.gatewayToken,
    });

    closeModal();
    showToast('Settings saved!', 'success');
    
    if (window.app) {
      await window.app.loadAllData();
    }
  }

  openSettings() {
    openModal('⚙️ Settings', `
      <div class="settings-form">
        <h4>Gateway Connection</h4>
        <div class="form-group">
          <label>Gateway Token</label>
          <input type="password" id="settingsGatewayToken" class="form-input" 
                 value="${this.config.gatewayToken || ''}">
          <p class="form-hint">Leave empty if using trusted-proxy auth</p>
        </div>

        <h4 style="margin-top: 20px;">Preferences</h4>
        <div class="form-group">
          <label>Auto-refresh interval (seconds)</label>
          <input type="number" id="settingsRefreshInterval" class="form-input" 
                 value="${(this.config.refreshInterval || 30000) / 1000}" min="5" max="300">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="settingsAutoConnect" ${this.config.autoConnect ? 'checked' : ''}>
            Auto-connect on startup
          </label>
        </div>

        <h4 style="margin-top: 20px;">System</h4>
        <div class="form-group">
          <button class="btn-secondary" onclick="setupManager.checkHealth()">Check Health</button>
          <div id="healthStatus" style="margin-top: 8px;"></div>
        </div>
      </div>
    `, `
      <button class="btn-danger" onclick="setupManager.resetConfig()">Reset</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="setupManager.saveSettings()">Save</button>
    `);
  }

  async checkHealth() {
    const el = document.getElementById('healthStatus');
    el.innerHTML = '<span class="loading">⏳ Checking...</span>';

    try {
      const health = await fetch('/health').then(r => r.json());
      if (health.status === 'healthy') {
        el.innerHTML = `<span style="color: var(--green);">✅ Gateway: reachable</span>`;
      } else {
        el.innerHTML = `<span style="color: var(--orange);">⚠️ ${health.gateway}: ${health.error || 'unknown'}</span>`;
      }
    } catch (err) {
      el.innerHTML = `<span style="color: var(--red);">❌ ${err.message}</span>`;
    }
  }

  saveSettings() {
    this.config.gatewayToken = document.getElementById('settingsGatewayToken').value;
    this.config.autoConnect = document.getElementById('settingsAutoConnect').checked;
    this.config.refreshInterval = parseInt(document.getElementById('settingsRefreshInterval').value) * 1000;
    this.saveConfig();

    this.api = new OpenClawAPI({
      baseUrl: '/api',
      token: this.config.gatewayToken,
    });

    closeModal();
    showToast('Settings saved!', 'success');
  }

  resetConfig() {
    if (!confirm('Reset all settings?')) return;
    localStorage.removeItem('openclaw-config');
    this.config = this.loadConfig();
    closeModal();
    showToast('Settings reset', 'info');
  }
}

// Form styles
const setupStyles = document.createElement('style');
setupStyles.textContent = `
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--text-secondary); }
  .form-input { width: 100%; padding: 8px 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: 13px; outline: none; transition: var(--transition); }
  .form-input:focus { border-color: var(--accent); }
  .form-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  .form-group input[type="checkbox"] { margin-right: 6px; }
  .setup-status { padding: 8px 0; font-size: 12px; }
  .setup-form h4, .settings-form h4 { font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--accent); }
`;
document.head.appendChild(setupStyles);

window.setupManager = new SetupManager();
