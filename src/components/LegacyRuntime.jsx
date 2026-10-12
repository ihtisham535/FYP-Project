'use client';
import { useEffect } from 'react';
import Chart from 'chart.js/auto';
import { LEGACY_SCRIPTS } from '@/lib/legacyManifest';

/**
 * Boots the portal engines (admin, manufacturer, vendor, pharmacy, doctor, patient + shared core)
 * after the React shell has mounted. Scripts are executed in order, sharing one global scope,
 * exactly like the original single-file prototype.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(s);
  });
}

export default function LegacyRuntime() {
  useEffect(() => {
    if (window.__pharmachainBooted) return;
    window.__pharmachainBooted = true;
    window.Chart = Chart;
    (async () => {
      for (const src of LEGACY_SCRIPTS) {
        try {
          await loadScript(src);
        } catch (e) {
          console.error(e);
        }
      }

      const portalRoles = {
        '/admin': 'administrator',
        '/doctor': 'doctor',
        '/manufacturer': 'manufacturer',
        '/vendor': 'vendor',
        '/pharmacy': 'pharmacy',
        '/patient': 'patient',
      };
      const role = portalRoles[window.location.pathname.replace(/\/$/, '')];
      if (role && typeof window.selectRole === 'function') {
        document.getElementById('landing-page')?.classList.add('hidden');
        window.selectRole(role);
      }
    })();
  }, []);
  return null;
}
