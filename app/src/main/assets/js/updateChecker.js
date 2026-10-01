import { Icons } from './icons.js';

export const CURRENT_VERSION = 'v1.0.5';
const REPO = 'sadesthetic/easy-cargo-tools';

export async function checkUpdates() {
  const btn = document.getElementById('btn-open-settings');
  if (btn) btn.classList.add('rotating');
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('Error al consultar');
    const data = await res.json();
    const latestTag = data.tag_name || '';

    if (latestTag && latestTag !== CURRENT_VERSION) {
      const apkAsset = (data.assets || []).find(a => a.name.endsWith('.apk'));
      const downloadUrl = apkAsset ? apkAsset.browser_download_url : data.html_url;
      showUpdateDialog(latestTag, downloadUrl);
    } else {
      showToast(`Versión ${CURRENT_VERSION} al día`);
    }
  } catch (err) {
    showToast('No se pudo verificar actualización');
  } finally {
    if (btn) btn.classList.remove('rotating');
  }
}

export function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function showUpdateDialog(newVersion, downloadUrl) {
  let dialog = document.getElementById('update-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'update-dialog';
    dialog.className = 'modal-backdrop';
    document.body.appendChild(dialog);
  }
  dialog.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">Actualización Disponible</span>
      </div>
      <p class="modal-text">Nueva versión <b>${newVersion}</b> lista para descargar.</p>
      <div class="modal-actions">
        <button class="pill-btn" id="btn-close-modal">Cerrar</button>
        <a href="${downloadUrl}" class="pill-btn primary" id="btn-dl-update" target="_blank">${Icons.download} Descargar</a>
      </div>
    </div>
  `;
  dialog.classList.remove('hidden');
  dialog.querySelector('#btn-close-modal').addEventListener('click', () => dialog.classList.add('hidden'));
}
