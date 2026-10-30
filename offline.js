(() => {
  const status = document.querySelector('#offlineStatus');
  const updateStatus = () => {
    if (!status) return;
    status.textContent = navigator.onLine ? 'Online · saves on this device' : 'Offline · saves on this device';
    status.classList.toggle('is-offline', !navigator.onLine);
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Offline inspection caching could not be enabled.', error);
      if (status) status.textContent = 'Offline page caching unavailable';
    });
  }
})();
