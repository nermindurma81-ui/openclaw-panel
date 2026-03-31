/* ===== OpenClaw Control UI — Live API (no mock data) ===== */

// ===== State =====
let state = {
  sessions: [],
  cronJobs: [],
  skills: [],
  config: null,
  activeTab: 'dashboard',
  activeChatSession: null,
};

let app = null;

// ===== App Bootstrap =====
document.addEventListener('DOMContentLoaded', async () => {
  await setupManager.init();
  app = new AppController(setupManager.api);

  initTerminal();
  updateClock();
  setInterval(updateClock, 1000);

  await app.loadAllData();

  // Periodic refresh every 30s
  setInterval(() => app.refreshData(), setupManager.config.refreshInterval || 30000);
});

// ===== App Controller =====
class AppController {
  constructor(api) {
    this.api = api;
  }

  async loadAllData() {
    await Promise.allSettled([
      this.loadStatus(),
      this.loadSessions(),
      this.loadCronJobs(),
      this.loadSkills(),
      this.loadConfig(),
    ]);
  }

  async refreshData() {
    await Promise.allSettled([this.loadSessions(), this.loadStatus()]);
  }

  async loadStatus() {
    try {
      const status = await this.api.getStatus();
      this.updateGatewayStatus(status);
    } catch {}
  }

  async loadConfig() {
    try {
      const config = await this.api.getConfig();
      if (config) {
        state.config = config;
        const ta = document.getElementById('configTextarea');
        if (ta) ta.value = JSON.stringify(config, null, 2);
      }
    } catch (err) {
      console.warn('Config load failed:', err.message);
    }
  }

  async loadSessions() {
    try {
      const data = await this.api.getSessions();
      const sessions = Array.isArray(data) ? data : (data?.sessions || []);
      state.sessions = sessions.map(s => ({
        id: s.key || s.id,
        name: s.label || s.name || s.key || s.id,
        icon: s.channel === 'telegram' ? '📱' : s.channel === 'discord' ? '💬' : '🖥️',
        status: s.active ? 'active' : 'idle',
        lastActive: s.lastActive || s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString() : '—',
        messages: s.messageCount || 0,
        channel: s.channel || 'api',
        model: s.model || '',
      }));
      renderChatList();
      renderSessionsList();
    } catch (err) {
      console.warn('Sessions load failed:', err.message);
      showEmptyState('sessionsList', 'No sessions — gateway may be offline');
      showEmptyState('chatList', 'No sessions');
    }
  }

  async loadCronJobs() {
    try {
      const data = await this.api.getCronJobs();
      const jobs = Array.isArray(data) ? data : (data?.jobs || data?.cron || []);
      state.cronJobs = jobs.map(j => ({
        id: j.id,
        name: j.name || j.id,
        schedule: j.schedule?.expr || j.schedule || j.cron || '—',
        description: j.prompt || j.payload?.message || j.payload?.kind || j.message || '',
        enabled: j.enabled !== false,
        lastRun: j.lastRun || j.last_run || 'never',
        sessionKey: j.sessionKey || j.session || '',
      }));
      renderCronList();
    } catch (err) {
      console.warn('Cron load failed:', err.message);
      showEmptyState('cronList', 'No cron jobs');
    }
  }

  async loadSkills() {
    try {
      const data = await this.api.getSkills();
      const skills = Array.isArray(data) ? data : (data?.skills || []);
      state.skills = skills.map(s => ({
        name: s.name || s.slug,
        icon: s.icon || skillIcon(s.name),
        desc: s.description || '',
        version: s.version || '1.0',
        slug: s.slug || s.name,
      }));
      renderSkillsList();
    } catch (err) {
      console.warn('Skills load failed:', err.message);
      showEmptyState('skillsList', 'No skills installed');
    }
  }

  updateGatewayStatus(status) {
    const remoteBtn = document.querySelector('.remote-btn');
    if (remoteBtn && status) {
      remoteBtn.innerHTML = `<span>Gateway ${status.version || 'v?'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
    }
    // Update status dot if exists
    const dot = document.querySelector('.status-dot-live');
    if (dot) { dot.style.background = 'var(--green)'; dot.title = 'Gateway online'; }
  }
}

// ===== Rendering =====

function showEmptyState(listId, msg) {
  const el = document.getElementById(listId);
  if (el) el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">${msg}</div>`;
}

function skillIcon(name) {
  const map = { weather: '🌤', github: '🐙', web: '🌐', memory: '🧠', files: '📁', search: '🔍', mail: '📧', calendar: '📅', code: '💻', math: '🔢', cron: '⏰', health: '❤️', session: '💬' };
  for (const [k, v] of Object.entries(map)) if ((name || '').toLowerCase().includes(k)) return v;
  return '🧩';
}

function renderChatList() {
  const list = document.getElementById('chatList');
  if (!list) return;
  if (!state.sessions.length) {
    list.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">No sessions</div>`;
    return;
  }
  list.innerHTML = state.sessions.map(s => `
    <div class="chat-item ${state.activeChatSession === s.id ? 'active' : ''}" onclick="selectSession('${s.id}')">
      <span class="chat-item-icon">${s.icon}</span>
      <div class="chat-item-info">
        <div class="chat-item-name">${esc(s.name)}</div>
        <div class="chat-item-preview">${s.messages} msgs · ${esc(s.channel)}</div>
      </div>
      <span class="chat-item-time">${esc(s.lastActive)}</span>
    </div>
  `).join('');
}

function renderSessionsList() {
  const list = document.getElementById('sessionsList');
  if (!list) return;
  if (!state.sessions.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">No sessions found.<br><small>Start a session via Telegram or API.</small></div>`;
    return;
  }
  list.innerHTML = state.sessions.map(s => `
    <div class="session-card" onclick="selectSession('${s.id}')">
      <div class="session-card-icon">${s.icon}</div>
      <div class="session-card-info">
        <div class="session-card-title">${esc(s.name)}</div>
        <div class="session-card-meta">
          <span>💬 ${s.messages} messages</span>
          <span>📡 ${esc(s.channel)}</span>
          <span>🕐 ${esc(s.lastActive)}</span>
          ${s.model ? `<span>🤖 ${esc(s.model)}</span>` : ''}
        </div>
      </div>
      <span class="session-card-badge ${s.status}">${s.status}</span>
    </div>
  `).join('');
}

function renderCronList() {
  const list = document.getElementById('cronList');
  if (!list) return;
  if (!state.cronJobs.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">No cron jobs configured.</div>`;
    return;
  }
  list.innerHTML = state.cronJobs.map(job => `
    <div class="cron-card">
      <div class="cron-card-header">
        <span class="cron-card-name">${job.enabled ? '✅' : '⏸️'} ${esc(job.name)}</span>
        <span class="cron-card-schedule">${esc(job.schedule)}</span>
      </div>
      <div class="cron-card-body">
        ${job.description ? `<div style="margin-bottom:4px;color:var(--text-secondary);font-size:12px;">${esc(job.description)}</div>` : ''}
        ${job.sessionKey ? `<div style="font-size:11px;color:var(--text-muted);">Session: ${esc(job.sessionKey)}</div>` : ''}
        <div style="margin-top:4px;color:var(--text-muted);font-size:11px;">Last run: ${esc(String(job.lastRun))}</div>
      </div>
      <div class="cron-card-actions">
        <button class="btn-secondary btn-small" onclick="runCronJob('${job.id}')">▶ Run</button>
        <button class="btn-secondary btn-small" onclick="toggleCronJob('${job.id}', ${!job.enabled})">${job.enabled ? '⏸ Pause' : '▶ Enable'}</button>
        <button class="btn-danger btn-small" onclick="deleteCronJob('${job.id}')">🗑 Delete</button>
      </div>
    </div>
  `).join('');
}

function renderSkillsList() {
  const list = document.getElementById('skillsList');
  if (!list) return;
  if (!state.skills.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">No skills installed.</div>`;
    return;
  }
  list.innerHTML = state.skills.map(s => `
    <div class="skill-card">
      <div class="skill-card-icon">${s.icon}</div>
      <div class="skill-card-info">
        <div class="skill-card-name">${esc(s.name)}</div>
        <div class="skill-card-desc">${esc(s.desc)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="skill-card-version">v${esc(s.version)}</span>
        <button class="btn-danger btn-small" onclick="uninstallSkill('${esc(s.slug || s.name)}')">✕</button>
      </div>
    </div>
  `).join('');
}

// ===== Session Actions =====

async function selectSession(id) {
  state.activeChatSession = id;
  renderChatList();
  // Load history into chat panel
  try {
    const data = await setupManager.api.getSessionHistory(id, 50);
    const msgs = Array.isArray(data) ? data : (data?.messages || data?.history || []);
    const chatPanel = document.querySelector('.chat-messages') || document.getElementById('chatMessages');
    if (chatPanel) {
      if (!msgs.length) {
        chatPanel.innerHTML = `<div style="padding:16px;color:var(--text-muted);font-size:12px;">No messages yet.</div>`;
      } else {
        chatPanel.innerHTML = msgs.map(m => {
          const role = m.role || 'user';
          const content = typeof m.content === 'string' ? m.content :
            Array.isArray(m.content) ? m.content.map(c => c.text || '').join('') :
            JSON.stringify(m.content);
          return `<div class="chat-message ${role}">
            <div class="chat-message-role">${role}</div>
            <div class="chat-message-text">${esc(content)}</div>
          </div>`;
        }).join('');
        chatPanel.scrollTop = chatPanel.scrollHeight;
      }
    }
  } catch (err) {
    showToast(`Could not load history: ${err.message}`, 'error');
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatMessageInput');
  const msg = input?.value?.trim();
  if (!msg) return;
  if (!state.activeChatSession) { showToast('Select a session first', 'warning'); return; }
  input.value = '';
  try {
    await setupManager.api.sendMessage(state.activeChatSession, msg);
    showToast('Message sent', 'success');
    setTimeout(() => selectSession(state.activeChatSession), 1500);
  } catch (err) {
    showToast(`Send failed: ${err.message}`, 'error');
  }
}

async function createSession() {
  const name = prompt('Session key (no spaces):');
  if (!name) return;
  try {
    await setupManager.api.createSession({ key: name });
    showToast(`Session "${name}" created`, 'success');
    await app.loadSessions();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function deleteSession(id) {
  if (!id && state.activeChatSession) id = state.activeChatSession;
  if (!id || !confirm(`Delete session "${id}"?`)) return;
  try {
    await setupManager.api.deleteSession(id);
    showToast('Session deleted', 'success');
    if (state.activeChatSession === id) state.activeChatSession = null;
    await app.loadSessions();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ===== Cron Actions =====

async function createCronJob() {
  const name = prompt('Job name:');
  if (!name) return;
  const schedule = prompt('Cron schedule:', '*/30 * * * *');
  if (!schedule) return;
  const sessionKey = prompt('Session key:', 'main');
  const prompt_ = prompt('Prompt (what to ask agent):');
  try {
    await setupManager.api.createCronJob({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      schedule,
      sessionKey,
      prompt: prompt_,
      enabled: true,
    });
    showToast('Cron job created', 'success');
    await app.loadCronJobs();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function runCronJob(id) {
  try {
    await setupManager.api.runCronJob(id);
    showToast(`Job "${id}" triggered`, 'success');
    termPrint(`[cron] manually triggered: ${id}`);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function toggleCronJob(id, enabled) {
  try {
    await setupManager.api.updateCronJob(id, { enabled });
    showToast(`Job ${enabled ? 'enabled' : 'paused'}`, 'success');
    await app.loadCronJobs();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function deleteCronJob(id) {
  if (!confirm(`Delete cron job "${id}"?`)) return;
  try {
    await setupManager.api.deleteCronJob(id);
    showToast('Cron job deleted', 'success');
    await app.loadCronJobs();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ===== Skill Actions =====

async function installSkill() {
  const name = prompt('Skill name or URL:');
  if (!name) return;
  try {
    await setupManager.api.installSkill(name);
    showToast(`Skill "${name}" installed`, 'success');
    await app.loadSkills();
  } catch (err) {
    showToast(`Install failed: ${err.message}`, 'error');
  }
}

async function uninstallSkill(slug) {
  if (!confirm(`Uninstall skill "${slug}"?`)) return;
  try {
    await setupManager.api.uninstallSkill(slug);
    showToast(`Skill "${slug}" uninstalled`, 'success');
    await app.loadSkills();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ===== Config =====

async function loadConfig() {
  if (app) await app.loadConfig();
}

function showConfigSection(section) {
  document.querySelectorAll('.config-sections li').forEach(el => el.classList.remove('active'));
  if (event?.target) event.target.classList.add('active');
  if (!state.config) return;
  const data = section === 'full' ? state.config : (state.config[section] || {});
  document.getElementById('configTextarea').value = JSON.stringify(data, null, 2);
}

function validateConfig() {
  try {
    JSON.parse(document.getElementById('configTextarea').value);
    showToast('✅ Valid JSON', 'success');
  } catch (e) {
    showToast('❌ Invalid JSON: ' + e.message, 'error');
  }
}

async function saveConfig() {
  try {
    const val = JSON.parse(document.getElementById('configTextarea').value);
    await setupManager.api.updateConfig(val);
    state.config = val;
    showToast('Config saved ✓', 'success');
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

// ===== Sidebar / Crates =====
// Crates = sessions in sidebar (no mock)
function initCrates() {
  // Filled by renderChatList from loadSessions
}

function filterCrates(query) {
  document.querySelectorAll('.crate-item').forEach(item => {
    const name = item.querySelector('.crate-item-name')?.textContent?.toLowerCase() || '';
    item.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
  });
}

function createNewCrate() { createSession(); }

// ===== Refresh =====
async function refreshAll() {
  showToast('Refreshing...', 'info');
  await app.loadAllData();
  showToast('Refreshed', 'success');
}

// ===== Tab Navigation =====
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.toggle('active', el.id === `tab-${tab}`));
  document.querySelectorAll('.bottombar-app').forEach((btn, i) => {
    const tabs = ['dashboard', 'sessions', 'config', 'remote', 'skills'];
    btn.classList.toggle('active', tabs[i] === tab);
  });
  // Lazy load config when switching to config tab
  if (tab === 'config' && !state.config) loadConfig();
}

// ===== Terminal =====
let termHistory = [];
let termCursor = 0;

function initTerminal() {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  output.innerHTML = `<span style="color:var(--text-muted)">OpenClaw Terminal — type 'help' for commands
──────────────────────────────────────────────────────────────
</span>`;
  setInterval(() => {
    const cursor = document.getElementById('termCursor');
    if (cursor) cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
  }, 530);
}

function termPrint(text, color) {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  const span = document.createElement('span');
  span.style.color = color || 'var(--text-secondary)';
  span.textContent = text + '\n';
  output.appendChild(span);
  output.scrollTop = output.scrollHeight;
}

function handleTerminalInput(e) {
  if (e.key === 'Enter') {
    const cmd = e.target.value.trim();
    e.target.value = '';
    if (!cmd) return;
    termHistory.push(cmd);
    termCursor = termHistory.length;
    processTerminalCommand(cmd);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (termCursor > 0) { termCursor--; e.target.value = termHistory[termCursor] || ''; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (termCursor < termHistory.length) { termCursor++; e.target.value = termHistory[termCursor] || ''; }
  }
}

async function processTerminalCommand(cmd) {
  const output = document.getElementById('terminalOutput');
  // Echo command
  const cmdLine = document.createElement('div');
  cmdLine.innerHTML = `<span style="color:var(--accent)">$ </span><span style="color:var(--text-primary)">${esc(cmd)}</span>`;
  output.appendChild(cmdLine);

  const parts = cmd.trim().split(/\s+/);
  const c = parts[0].toLowerCase();

  const respond = (text, color) => {
    const el = document.createElement('pre');
    el.style.color = color || 'var(--text-secondary)';
    el.style.margin = '2px 0 6px';
    el.style.fontFamily = 'inherit';
    el.style.fontSize = 'inherit';
    el.style.whiteSpace = 'pre-wrap';
    el.textContent = text;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  };

  try {
    switch (c) {
      case 'help':
        respond(`Commands:
  status    — Gateway health
  sessions  — List sessions
  config    — Show config
  skills    — List skills
  cron      — List cron jobs
  send <session> <msg> — Send message
  refresh   — Reload all data
  clear     — Clear terminal
  uptime    — Gateway uptime`);
        break;

      case 'status': {
        const s = await setupManager.api.getStatus();
        respond(JSON.stringify(s, null, 2), 'var(--green)');
        break;
      }

      case 'sessions':
        if (!state.sessions.length) { respond('No sessions'); break; }
        respond(state.sessions.map(s => `  ${s.icon} ${s.id}  [${s.status}]  ${s.channel}  ${s.messages} msgs`).join('\n'));
        break;

      case 'config': {
        const cfg = await setupManager.api.getConfig();
        respond(JSON.stringify(cfg, null, 2).slice(0, 2000) + (JSON.stringify(cfg).length > 2000 ? '\n...(truncated)' : ''));
        break;
      }

      case 'skills':
        if (!state.skills.length) { respond('No skills installed'); break; }
        respond(state.skills.map(s => `  ${s.icon} ${s.name}  v${s.version}  ${s.desc}`).join('\n'));
        break;

      case 'cron':
        if (!state.cronJobs.length) { respond('No cron jobs'); break; }
        respond(state.cronJobs.map(j => `  ${j.enabled ? '✓' : '✗'} ${j.id}  ${j.schedule}  ${j.description || ''}`).join('\n'));
        break;

      case 'send': {
        const sessionKey = parts[1];
        const message = parts.slice(2).join(' ');
        if (!sessionKey || !message) { respond('Usage: send <session-key> <message>', 'var(--orange)'); break; }
        await setupManager.api.sendMessage(sessionKey, message);
        respond(`Sent to "${sessionKey}"`, 'var(--green)');
        break;
      }

      case 'refresh':
        respond('Refreshing...');
        await app.loadAllData();
        respond('Done.', 'var(--green)');
        break;

      case 'uptime': {
        const st = await setupManager.api.getStatus();
        respond(`Uptime: ${st.uptime || st.uptimeSeconds || '—'}  Version: ${st.version || '—'}`);
        break;
      }

      case 'clear':
        output.innerHTML = '';
        break;

      default:
        respond(`bash: ${esc(c)}: command not found`, 'var(--red)');
    }
  } catch (err) {
    respond(`Error: ${err.message}`, 'var(--red)');
  }
}

// ===== Utilities =====
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateClock() {
  const el = document.getElementById('clockDisplay');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  showToast('Theme toggled', 'info');
}

// ===== Notifications =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('notifBtn')?.addEventListener('click', () => {
    openModal('Notifications', `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:32px;margin-bottom:8px;">🔔</p>
        <p>No new notifications</p>
      </div>
    `, '<button class="btn-secondary" onclick="closeModal()">Close</button>');
  });
});

// ===== Toast =====
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// ===== Modal =====
function openModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalFooter').innerHTML = footerHtml;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('active');
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); document.getElementById('searchInput')?.focus(); }
  if (e.ctrlKey && e.key === 's' && state.activeTab === 'config') { e.preventDefault(); saveConfig(); }
  if (e.key === 'Escape') closeModal();
  if (e.altKey && e.key >= '1' && e.key <= '5') {
    e.preventDefault();
    switchTab(['dashboard', 'sessions', 'config', 'cron', 'skills'][parseInt(e.key) - 1]);
  }
});
