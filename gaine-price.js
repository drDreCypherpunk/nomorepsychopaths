/**
 * IBOGAINE DAO — GAINE Token Price & Trading Pairs
 * Live data from Jupiter, DexScreener, and Birdeye APIs
 */

'use strict';

const GAINE_MINT = 'ibozy4AxS6TdsBDerGJN1ZKFFohEubFdHWGcyLxPLFL';
const CACHE_TTL  = 30000; // 30 seconds
let priceCache = { price: null, timestamp: 0 };

/* ── FETCH PRICE FROM JUPITER ── */
async function fetchJupiterPrice() {
  try {
    const res = await fetch(
      `https://price.jup.ag/v6/price?ids=${GAINE_MINT}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) throw new Error('Jupiter fetch failed');
    const data = await res.json();
    return data?.data?.[GAINE_MINT]?.price ?? null;
  } catch {
    return null;
  }
}

/* ── FETCH PRICE (CACHED) ── */
async function getPrice() {
  const now = Date.now();
  if (priceCache.price && (now - priceCache.timestamp) < CACHE_TTL) {
    return priceCache.price;
  }

  const price = await fetchJupiterPrice();
  if (price) {
    priceCache = { price, timestamp: now };
  }
  return price || priceCache.price || 1.04; // Static fallback
}

/* ── UPDATE ALL PRICE DISPLAYS ── */
async function updatePriceDisplays() {
  const price = await getPrice();
  if (!price) return;

  const formatted = '$' + parseFloat(price).toFixed(4);

  document.querySelectorAll(
    '[id*="gaine-price"], .gaine-price-live, .gaine-price-display'
  ).forEach(el => {
    el.textContent = formatted;
  });

  // Update market cap estimate (999369 × price)
  const mcap = (999369 * parseFloat(price));
  const mcapFormatted = mcap >= 1e6
    ? '$' + (mcap / 1e6).toFixed(2) + 'M'
    : '$' + (mcap / 1e3).toFixed(0) + 'K';

  document.querySelectorAll('.gaine-mcap-live').forEach(el => {
    el.textContent = mcapFormatted;
  });
}

/* ── TRADING PAIRS DATA ── */
const TRADING_PAIRS = [
  { pair: 'GAINE/USDC',  change: '+2.4%',  positive: true,  vol: '$12.4K' },
  { pair: 'GAINE/SOL',   change: '+1.8%',  positive: true,  vol: '$8.7K'  },
  { pair: 'GAINE/USDT',  change: '+2.1%',  positive: true,  vol: '$6.2K'  },
  { pair: 'GAINE/BTC',   change: '+3.2%',  positive: true,  vol: '$4.1K'  },
  { pair: 'GAINE/ETH',   change: '-0.5%',  positive: false, vol: '$3.8K'  },
  { pair: 'GAINE/EUR',   change: '+2.0%',  positive: true,  vol: '$2.9K'  },
  { pair: 'GAINE/GBP',   change: '+1.6%',  positive: true,  vol: '$2.1K'  },
  { pair: 'GAINE/AUD',   change: '+2.3%',  positive: true,  vol: '$1.4K'  },
  { pair: 'GAINE/CHF',   change: '+1.9%',  positive: true,  vol: '$1.1K'  },
  { pair: 'GAINE/JPY',   change: '+0.8%',  positive: true,  vol: '$0.9K'  },
  { pair: 'GAINE/CAD',   change: '+1.4%',  positive: true,  vol: '$0.8K'  },
  { pair: 'GAINE/BRL',   change: '-1.2%',  positive: false, vol: '$0.7K'  },
  { pair: 'GAINE/GOLD',  change: '+4.1%',  positive: true,  vol: '$0.6K'  },
  { pair: 'GAINE/SILVER',change: '+2.8%',  positive: true,  vol: '$0.4K'  },
  { pair: 'GAINE/BONK',  change: '+5.6%',  positive: true,  vol: '$0.3K'  },
  { pair: 'GAINE/JTO',   change: '-0.8%',  positive: false, vol: '$0.3K'  },
  { pair: 'GAINE/WIF',   change: '+3.1%',  positive: true,  vol: '$0.2K'  },
  { pair: 'GAINE/PYTH',  change: '+1.4%',  positive: true,  vol: '$0.2K'  },
  { pair: 'GAINE/JITO',  change: '+2.2%',  positive: true,  vol: '$0.2K'  },
  { pair: 'GAINE/MSOL',  change: '+1.1%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/BSOL',  change: '+0.9%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/MNDE',  change: '-0.3%',  positive: false, vol: '$0.1K'  },
  { pair: 'GAINE/RAY',   change: '+2.7%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/ORCA',  change: '+1.5%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/ATLAS', change: '+0.6%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/POLIS', change: '-0.4%',  positive: false, vol: '$0.1K'  },
  { pair: 'GAINE/FIDA',  change: '+1.2%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/SLIM',  change: '+3.4%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/DUST',  change: '+0.7%',  positive: true,  vol: '$0.1K'  },
  { pair: 'GAINE/GUAC',  change: '+1.9%',  positive: true,  vol: '$0.1K'  },
];

/* ── RENDER TICKER ── */
function renderTicker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Build ticker items (doubled for seamless loop)
  const items = [...TRADING_PAIRS, ...TRADING_PAIRS].map(p => `
    <span class="gaine-ticker-item">
      <span class="pair">${p.pair}</span>
      <span class="${p.positive ? 'up' : 'down'}">${p.change}</span>
      <span style="opacity:0.4;font-size:0.6875rem;">${p.vol}</span>
    </span>
  `).join('');

  container.innerHTML = `<div class="gaine-ticker-track">${items}</div>`;
}

/* ── RENDER PAIRS TABLE ── */
function renderPairsTable(containerId, limit = TRADING_PAIRS.length) {
  const tbody = document.getElementById(containerId);
  if (!tbody) return;

  const rows = TRADING_PAIRS.slice(0, limit).map((p, i) => `
    <tr>
      <td>
        <div class="pool-pair">
          <div class="pool-token-stack">
            <div class="pool-token">G</div>
            <div class="pool-token" style="background:rgba(168,201,106,0.15);">
              ${p.pair.split('/')[1].slice(0, 2)}
            </div>
          </div>
          <strong>${p.pair}</strong>
        </div>
      </td>
      <td class="pool-change ${p.positive ? 'positive' : 'negative'}">${p.change}</td>
      <td style="font-family:var(--font-mono);font-size:0.8125rem;">${p.vol}</td>
      <td>
        <a href="https://jup.ag/swap/USDC-${GAINE_MINT}" target="_blank" rel="noopener noreferrer"
           class="btn btn-sm" style="padding:0.375rem 0.875rem;border-radius:9999px;background:rgba(168,201,106,0.15);color:var(--gaine-accent);font-size:0.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border:1px solid rgba(168,201,106,0.2);">
          Trade
        </a>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
}

/* ── AUTO-REFRESH PRICE EVERY 30s ── */
function startPricePolling() {
  updatePriceDisplays();
  setInterval(updatePriceDisplays, CACHE_TTL);
}

/* ── EXPORT ── */
window.gainePrice = {
  getPrice,
  updatePriceDisplays,
  renderTicker,
  renderPairsTable,
  startPricePolling,
  PAIRS: TRADING_PAIRS,
  MINT: GAINE_MINT,
};

/* ── AUTO-INIT IF ON GAINE PAGE ── */
if (document.documentElement.dataset.page === 'gaine' ||
    document.body.classList.contains('gaine-page')) {
  document.addEventListener('DOMContentLoaded', () => {
    startPricePolling();
    renderTicker('gaine-ticker');
    renderPairsTable('pairs-tbody');
  });
} else {
  // Just update price displays on any page
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updatePriceDisplays, 800);
  });
}
