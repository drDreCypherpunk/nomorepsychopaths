/**
 * IBOGAINE DAO — Solana Wallet Adapter
 * Phantom, Backpack, Solflare via window.solana / window.backpack
 * Read-only: connect, display address, disconnect
 */

'use strict';

const WALLET_KEY = 'ibodao_wallet_pub';

/* ── STATE ── */
let walletPubkey = null;
let walletProvider = null;

/* ── UI ELEMENTS ── */
function getBtn() { return document.getElementById('wallet-btn'); }
function getText() { return document.getElementById('wallet-text'); }

/* ── FORMAT ADDRESS ── */
function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 4) + '…' + addr.slice(-4);
}

/* ── UPDATE UI ── */
function updateWalletUI(pubkey) {
  const btn = getBtn();
  const txt = getText();
  if (!btn) return;

  if (pubkey) {
    btn.classList.add('connected');
    if (txt) txt.textContent = shortAddr(pubkey);
    btn.title = pubkey;

    // Update any other wallet displays on the page
    document.querySelectorAll('.wallet-address-display').forEach(el => {
      el.textContent = shortAddr(pubkey);
    });
    document.querySelectorAll('.wallet-connected-only').forEach(el => {
      el.removeAttribute('hidden');
    });
    document.querySelectorAll('.wallet-disconnected-only').forEach(el => {
      el.setAttribute('hidden', '');
    });

    // Fire custom event
    document.dispatchEvent(new CustomEvent('walletConnected', { detail: { pubkey } }));
  } else {
    btn.classList.remove('connected');
    if (txt) txt.textContent = 'Connect';
    btn.title = '';

    document.querySelectorAll('.wallet-connected-only').forEach(el => {
      el.setAttribute('hidden', '');
    });
    document.querySelectorAll('.wallet-disconnected-only').forEach(el => {
      el.removeAttribute('hidden');
    });

    document.dispatchEvent(new CustomEvent('walletDisconnected'));
  }
}

/* ── DETECT PROVIDER ── */
function detectProvider() {
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
  if (window.solana?.isPhantom)          return window.solana;
  if (window.backpack)                   return window.backpack;
  if (window.solflare?.isSolflare)       return window.solflare;
  return null;
}

/* ── CONNECT ── */
async function connectWallet() {
  const provider = detectProvider();

  if (!provider) {
    // No wallet installed — open Phantom install page
    window.open('https://phantom.app/', '_blank', 'noopener,noreferrer');
    showToast('No wallet found. Install Phantom and try again.', 'warn');
    return;
  }

  walletProvider = provider;

  try {
    const btn = getBtn();
    if (btn) {
      const txt = getText();
      if (txt) {
        const spinner = document.createElement('span');
        spinner.className = 'spinner spinner-sm';
        btn.prepend(spinner);
        txt.textContent = 'Connecting…';
      }
    }

    const resp = await provider.connect();
    walletPubkey = resp.publicKey.toString();

    // Persist across page loads
    sessionStorage.setItem(WALLET_KEY, walletPubkey);

    updateWalletUI(walletPubkey);
    showToast('Wallet connected: ' + shortAddr(walletPubkey), 'success');

    // Remove spinner
    getBtn()?.querySelector('.spinner')?.remove();

    // Fetch GAINE balance
    fetchGaineBalance(walletPubkey);

  } catch (err) {
    getBtn()?.querySelector('.spinner')?.remove();
    updateWalletUI(null);

    if (err.code === 4001) {
      showToast('Connection rejected.', 'warn');
    } else {
      console.error('[Wallet] Connect error:', err);
      showToast('Connection failed. Try again.', 'error');
    }
  }
}

/* ── DISCONNECT ── */
async function disconnectWallet() {
  if (walletProvider?.disconnect) {
    try { await walletProvider.disconnect(); } catch { /* ignore */ }
  }
  walletPubkey = null;
  walletProvider = null;
  sessionStorage.removeItem(WALLET_KEY);
  updateWalletUI(null);
  showToast('Wallet disconnected.', 'info');
}

/* ── AUTO-RECONNECT ── */
async function tryAutoReconnect() {
  const stored = sessionStorage.getItem(WALLET_KEY);
  if (!stored) return;

  const provider = detectProvider();
  if (!provider) return;

  try {
    // Eager connect — only works if user already approved this site
    const resp = await provider.connect({ onlyIfTrusted: true });
    walletPubkey = resp.publicKey.toString();
    walletProvider = provider;
    updateWalletUI(walletPubkey);
    fetchGaineBalance(walletPubkey);
  } catch {
    sessionStorage.removeItem(WALLET_KEY);
  }
}

/* ── FETCH GAINE BALANCE ── */
async function fetchGaineBalance(pubkey) {
  const mint = 'ibozy4AxS6TdsBDerGJN1ZKFFohEubFdHWGcyLxPLFL';
  const rpc = 'https://api.mainnet-beta.solana.com';
  const els = document.querySelectorAll('.gaine-balance-display');
  if (!els.length) return;

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getTokenAccountsByOwner',
        params: [pubkey, { mint }, { encoding: 'jsonParsed' }]
      }),
      signal: AbortSignal.timeout(8000)
    });

    const data = await res.json();
    const accounts = data?.result?.value || [];
    const balance = accounts.reduce((sum, acc) => {
      const amt = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      return sum + amt;
    }, 0);

    els.forEach(el => {
      el.textContent = balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' GAINE';
    });

    // Eligibility check for voting (need 100+ GAINE)
    if (balance >= 100) {
      document.querySelectorAll('.vote-eligible').forEach(el => el.removeAttribute('hidden'));
      document.querySelectorAll('.vote-ineligible').forEach(el => el.setAttribute('hidden', ''));
    }
  } catch {
    els.forEach(el => { el.textContent = '—'; });
  }
}

/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.dao-toast').forEach(t => t.remove());

  const colors = {
    success: '#22c55e',
    warn:    '#f59e0b',
    error:   '#ef4444',
    info:    'var(--gold)'
  };

  const toast = document.createElement('div');
  toast.className = 'dao-toast';
  toast.role = 'alert';
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  Object.assign(toast.style, {
    position:  'fixed',
    bottom:    '1.5rem',
    right:     '1.5rem',
    zIndex:    '9999',
    background: 'var(--forest)',
    color:     'var(--earth)',
    padding:   '0.875rem 1.25rem',
    borderRadius: '0.75rem',
    borderLeft: `4px solid ${colors[type] || colors.info}`,
    fontSize:  '0.875rem',
    fontFamily: 'var(--font-sans)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    maxWidth:  '22rem',
    animation: 'fadeUp 0.3s ease both',
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ── WALLET BUTTON CLICK HANDLER ── */
function initWalletButton() {
  const btn = document.getElementById('wallet-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (walletPubkey) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  });
}

/* ── PROVIDER EVENT LISTENERS ── */
function listenProviderEvents() {
  const provider = detectProvider();
  if (!provider) return;

  provider.on?.('accountChanged', (pubkey) => {
    if (pubkey) {
      walletPubkey = pubkey.toString();
      sessionStorage.setItem(WALLET_KEY, walletPubkey);
      updateWalletUI(walletPubkey);
      fetchGaineBalance(walletPubkey);
    } else {
      disconnectWallet();
    }
  });

  provider.on?.('disconnect', () => {
    walletPubkey = null;
    walletProvider = null;
    updateWalletUI(null);
  });
}

/* ── EXPOSE GLOBALLY ── */
window.walletConnect    = connectWallet;
window.walletDisconnect = disconnectWallet;
window.walletPubkey     = () => walletPubkey;
window.showToast        = showToast;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initWalletButton();
  listenProviderEvents();
  tryAutoReconnect();
});
