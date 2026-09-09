(() => {
  const config = window.SNAG_CLOUD_CONFIG || {};
  const configured = Boolean(config.url && config.anonKey);
  const stores = ['snagline-apartment-record', 'snagline-inspection-state', 'snagline-inspection-schedule', 'snagline-report-sections', 'snagline-linked-apartment'];
  const syncKey = 'snagline-cloud-last-sync';
  let client = null;
  let user = null;
  let saveTimer = null;
  let applyingRemote = false;
  let realtimeChannel = null;

  const readSnapshot = () => Object.fromEntries(stores.map((key) => [key, localStorage.getItem(key)]));
  const applySnapshot = (snapshot) => {
    applyingRemote = true;
    stores.forEach((key) => {
      if (snapshot?.[key] === null || snapshot?.[key] === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, snapshot[key]);
    });
    applyingRemote = false;
  };
  const saveSnapshot = async () => {
    if (!client || !user || applyingRemote) return;
    const snapshot = readSnapshot();
    const { error } = await client.from('snag_workspaces').upsert({ user_id: user.id, snapshot, updated_at: new Date().toISOString() });
    if (error) showToast(`Cloud save failed: ${error.message}`);
    else {
      localStorage.setItem(syncKey, new Date().toISOString());
      showToast('Saved to cloud');
    }
  };
  const queueSave = () => {
    if (!client || !user || applyingRemote) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveSnapshot, 700);
  };
  const showToast = (message) => {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const renderStatus = () => {
    const status = document.querySelector('#cloudStatus');
    if (status) status.textContent = user ? `Cloud: ${user.email}` : configured ? 'Cloud: signed out' : 'Cloud: not configured';
    const button = document.querySelector('#cloudAuthButton');
    if (button) button.textContent = user ? 'Sign out' : 'Cloud login';
  };
  const auth = async () => {
    if (!client) {
      const message = window.supabase ? 'Cloud login is still loading. Please click again.' : 'Supabase client could not load. Check your internet connection and refresh the page.';
      showToast(message);
      window.alert(message);
      return;
    }
    if (user) {
      await client.auth.signOut();
      user = null;
      renderStatus();
      return;
    }
    const email = window.prompt('Cloud account email:');
    const password = email && window.prompt('Cloud account password (minimum 6 characters):');
    if (!email || !password) return;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error && error.message.toLowerCase().includes('invalid login credentials')) {
      const create = window.confirm('No matching account. Create this cloud account now?');
      if (create) {
        const result = await client.auth.signUp({ email, password });
        if (result.error) return showToast(`Cloud signup failed: ${result.error.message}`);
        user = result.data.user;
      }
    } else if (error) return showToast(`Cloud login failed: ${error.message}`);
    else user = data.user;
    await loadSnapshot();
    renderStatus();
  };
  const loadSnapshot = async () => {
    if (!client || !user) return;
    const { data, error } = await client.from('snag_workspaces').select('snapshot, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) return showToast(`Cloud load failed: ${error.message}`);
    if (data?.snapshot) {
      applySnapshot(data.snapshot);
      const refreshKey = `snagline-cloud-refresh-complete-${user.id}`;
      if (sessionStorage.getItem(refreshKey) !== 'true') {
        sessionStorage.setItem(refreshKey, 'true');
        showToast('Loaded data from cloud. Refreshing once...');
        setTimeout(() => window.location.reload(), 500);
      } else {
        showToast('Cloud data loaded');
      }
    } else await saveSnapshot();
  };
  const subscribeToChanges = () => {
    if (!client || !user || realtimeChannel) return;
    realtimeChannel = client.channel(`snag-workspace-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'snag_workspaces', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new?.snapshot && !applyingRemote) {
          applySnapshot(payload.new.snapshot);
          showToast('Updated from another device');
        }
      })
      .subscribe();
  };
  const injectControls = () => {
    const container = document.querySelector('.sidebar-bottom');
    if (!container) return;
    let button = document.querySelector('#cloudAuthButton');
    if (!button) {
      const panel = document.createElement('div');
      panel.className = 'cloud-controls';
      panel.innerHTML = '<span id="cloudStatus">Cloud: checking...</span><button id="cloudAuthButton" type="button">Cloud login</button>';
      container.prepend(panel);
      button = document.querySelector('#cloudAuthButton');
    }
    button.onclick = auth;
    renderStatus();
  };
  const initialize = async () => {
    injectControls();
    if (!configured) return;
    if (!window.supabase) {
      renderStatus();
      return;
    }
    try {
      client = window.supabase.createClient(config.url, config.anonKey);
      const session = await client.auth.getSession();
      user = session.data.session?.user || null;
      renderStatus();
      if (user) { await loadSnapshot(); subscribeToChanges(); }
      client.auth.onAuthStateChange((_event, sessionState) => {
        user = sessionState?.user || null;
        renderStatus();
        if (user) subscribeToChanges();
      });
    } catch (error) {
      showToast(`Cloud setup error: ${error.message}`);
      renderStatus();
    }
  };
  window.snagCloudSave = queueSave;
  window.addEventListener('storage', (event) => { if (stores.includes(event.key)) queueSave(); });
  window.snagCloudAuth = auth;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
