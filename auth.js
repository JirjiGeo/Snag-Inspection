// Authentication Module
// Handles login, sign-up, and session management with Supabase

const Auth = {
  currentUser: null,
  isSignUp: false,

  async init() {
    // Load Supabase config
    if (typeof window.SUPABASE_CONFIG === 'undefined') {
      this.showMessage('Supabase not configured. Contact your administrator.', 'error');
      return;
    }

    // Check if already logged in
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.auth.getUser();
      if (data?.user) {
        this.currentUser = data.user;
        this.hideAuthScreen();
        window.dispatchEvent(new Event('qbel-auth-ready'));
        return;
      }
    }

    // Setup event listeners
    this.setupEventListeners();
  },

  setupEventListeners() {
    const authForm = document.querySelector('#authForm');
    const toggleSignUp = document.querySelector('#toggleSignUp');

    if (authForm) {
      authForm.addEventListener('submit', (e) => this.handleAuth(e));
    }
    if (toggleSignUp) {
      toggleSignUp.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSignUpMode();
      });
    }
  },

  toggleSignUpMode() {
    this.isSignUp = !this.isSignUp;
    const form = document.querySelector('#authForm');
    const button = form.querySelector('button[type="submit"]');
    const footer = document.querySelector('.auth-footer');
    
    if (this.isSignUp) {
      button.textContent = 'Create Account';
      footer.innerHTML = 'Already have an account? <button type="button" id="toggleSignUp" class="link-button">Sign in</button>';
    } else {
      button.textContent = 'Sign In';
      footer.innerHTML = 'New user? <button type="button" id="toggleSignUp" class="link-button">Create an account</button>';
    }
    
    // Re-attach event listener
    document.querySelector('#toggleSignUp').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleSignUpMode();
    });
  },

  async handleAuth(event) {
    event.preventDefault();

    const email = document.querySelector('#emailInput').value.trim();
    const password = document.querySelector('#passwordInput').value.trim();

    if (!email || !password) {
      this.showMessage('Please enter email and password.', 'error');
      return;
    }

    if (this.isSignUp) {
      await this.signUp(email, password);
    } else {
      await this.login(email, password);
    }
  },

  async login(email, password) {
    if (!window.supabaseClient) {
      this.showMessage('Supabase client not initialized.', 'error');
      return;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.showMessage(`Login failed: ${error.message}`, 'error');
        return;
      }

      if (data?.user) {
        this.currentUser = data.user;
        localStorage.setItem('northstar-user', JSON.stringify(data.user));
        this.showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          this.hideAuthScreen();
          window.dispatchEvent(new Event('qbel-auth-ready'));
        }, 800);
      }
    } catch (err) {
      this.showMessage(`Error: ${err.message}`, 'error');
    }
  },

  async signUp(email, password) {
    if (!window.supabaseClient) {
      this.showMessage('Supabase client not initialized.', 'error');
      return;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      });

      if (error) {
        this.showMessage(`Sign-up failed: ${error.message}`, 'error');
        return;
      }

      if (data?.user) {
        this.showMessage('Account created! Check your email to confirm. Then sign in.', 'success');
        this.isSignUp = false;
        this.toggleSignUpMode();
        document.querySelector('#emailInput').value = email;
        document.querySelector('#passwordInput').value = '';
      }
    } catch (err) {
      this.showMessage(`Error: ${err.message}`, 'error');
    }
  },

  showMessage(text, type = 'error') {
    const messageEl = document.querySelector('#authMessage');
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = `auth-message show ${type}`;
      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 4000);
    }
  },

  hideAuthScreen() {
    const authScreen = document.querySelector('#authScreen');
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.setAttribute('aria-hidden', 'true');
    }
  },

  showAuthScreen() {
    const authScreen = document.querySelector('#authScreen');
    if (authScreen) {
      authScreen.classList.remove('hidden');
      authScreen.setAttribute('aria-hidden', 'false');
    }
  },

  async logout() {
    if (window.supabaseClient) {
      await window.supabaseClient.auth.signOut();
      this.currentUser = null;
      localStorage.removeItem('northstar-user');
      localStorage.removeItem('northstar-employees');
      localStorage.removeItem('northstar-deleted-evaluations');
      this.showAuthScreen();
    }
  }
};

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
  Auth.init();
}
