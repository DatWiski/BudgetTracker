(function () {
  function notifyAndClose() {
    try {
      if (window.opener && !window.opener.closed) {
        var message = { type: 'OAUTH_SUCCESS', origin: window.location.origin };
        // Use '*' to allow different dev origins; the parent will validate if needed
        window.opener.postMessage(message, '*');
        try { window.close(); } catch (_) {}
      } else {
        // Not a popup; navigate to app root
        window.location.href = '/';
      }
    } catch (e) {
      // As a fallback, navigate to app root after a short delay
      setTimeout(function(){ window.location.href = '/'; }, 1000);
    }
  }

  // Try immediately and again shortly after to cover race conditions
  notifyAndClose();
  setTimeout(notifyAndClose, 200);
})();


