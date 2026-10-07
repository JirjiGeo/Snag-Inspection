(() => {
  const config = window.SNAG_CLOUD_CONFIG || {};
  const configured = Boolean(config.url && config.anonKey);
  const stores = ['snagline-apartment-record', 'snagline-inspection-state', 'snagline-inspection-schedule', 'snagline-report-sections', 'snagline-uploaded-reports', 'snagline-linked-apartment'];
  const syncKey = 'snagline-cloud-last-sync';
  let client = null;
  let user = null;
  let saveTimer = null;
  let applyingRemote = false;
  let realtimeChannel = null;
  let authDialog = null;
  let authSubmitting = false;

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
      return;
    }
    if (user) {
      const { error } = await client.auth.signOut();
      if (error) return showToast(`Sign out failed: ${error.message}`);
      user = null;
      if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      clearTimeout(saveTimer);
      renderStatus();
      return;
    }
    if (!authDialog.open) {
      authDialog.querySelector('form').reset();
      authDialog.querySelector('[role="alert"]').textContent = '';
      authDialog.showModal();
    }
  };
  const submitAuth = async (event) => {
    event.preventDefault();
    if (authSubmitting || !client) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const creating = event.submitter?.value === 'signup';
    const message = authDialog.querySelector('[role="alert"]');
    const credentials = { email: form.elements.email.value.trim(), password: form.elements.password.value };
    authSubmitting = true;
    message.textContent = creating ? 'Creating account...' : 'Signing in...';
    form.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    try {
      const { data, error } = creating
        ? await client.auth.signUp(credentials)
        : await client.auth.signInWithPassword(credentials);
      if (error) {
        message.textContent = error.message;
        return;
      }
      form.elements.password.value = '';
      if (!data.session) {
        message.textContent = 'Check your email to confirm your account, then sign in.';
        return;
      }
      user = data.session.user;
      renderStatus();
      await loadSnapshot();
      subscribeToChanges();
      authDialog.close();
    } catch (error) {
      message.textContent = `Cloud login failed: ${error.message}`;
    } finally {
      authSubmitting = false;
      form.querySelectorAll('button').forEach((button) => { button.disabled = false; });
    }
  };
  const createAuthDialog = () => {
    if (authDialog) return;
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = 'cloud-auth.css';
    document.head.append(styles);
    authDialog = document.createElement('dialog');
    authDialog.id = 'cloudAuthDialog';
    authDialog.className = 'cloud-auth-dialog';
    authDialog.setAttribute('aria-labelledby', 'cloudAuthTitle');
    authDialog.innerHTML = '<form><h2 id="cloudAuthTitle">Cloud login</h2><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="6" required></label><p class="cloud-auth-message" role="alert" aria-live="polite"></p><div class="cloud-auth-actions"><button class="button button-outline" type="button" data-auth-cancel>Cancel</button><button class="button button-outline" type="submit" value="signup">Create account</button><button class="button button-dark" type="submit" value="signin">Sign in</button></div></form>';
    authDialog.querySelector('form').addEventListener('submit', submitAuth);
    authDialog.querySelector('[data-auth-cancel]').addEventListener('click', () => authDialog.close());
    authDialog.addEventListener('cancel', (event) => { if (authSubmitting) event.preventDefault(); });
    authDialog.addEventListener('close', () => {
      authDialog.querySelector('form').reset();
      document.querySelector('#cloudAuthButton')?.focus();
    });
    document.body.append(authDialog);
  };
  const loadSnapshot = async () => {
    if (!client || !user) return;
    const { data, error } = await client.from('snag_workspaces').select('snapshot, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) return showToast(`Cloud load failed: ${error.message}`);
    if (data?.snapshot) {
      applySnapshot(data.snapshot);
      showToast('Cloud data loaded');
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
    createAuthDialog();
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
