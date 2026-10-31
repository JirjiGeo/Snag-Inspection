(() => {
  const status = document.querySelector('#offlineStatus');
  const updateStatus = () => {
    if (!status) return;
    const connection = navigator.onLine ? 'Online · saves on this device' : 'Offline · saves on this device';
    status.textContent = window.isSecureContext ? connection : `${connection} · HTTPS needed for camera`;
    status.classList.toggle('is-offline', !navigator.onLine);
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).catch((error) => {
      console.error('Offline inspection caching could not be enabled.', error);
      if (status) status.textContent = 'Offline page caching unavailable';
    });
  }
})();
