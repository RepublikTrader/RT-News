/**
 * Data Pasar Live — USD/IDR (ExchangeRate-API)
 * ------------------------------------------------
 * Sumber: https://www.exchangerate-api.com (free tier, update 1x/hari)
 *
 * PENTING — soal keamanan:
 * Sama seperti file economic-calendar.js, kode ini jalan di browser jadi
 * API key akan terlihat lewat "View Source". Wajar untuk tahap
 * testing/mockup, tapi kalau situs sudah production dan trafiknya nyata,
 * pindahkan pemanggilan API ini ke backend/serverless function supaya
 * key tidak terekspos publik.
 *
 * Free tier hanya update 1x/24 jam, jadi ini BUKAN data real-time detik-
 * demi-detik — cukup untuk menampilkan kurs acuan harian, bukan untuk
 * keperluan trading presisi tinggi.
 */

const EXCHANGE_RATE_API_KEY = 'a260ba32a22baa3d823ee68f';
const EXCHANGE_RATE_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;
const STORAGE_KEY_PREV_RATE = 'rt_usdidr_prev_rate';

function formatRupiah(value) {
  return Math.round(value).toLocaleString('id-ID');
}

function applyChangeStyle(el, changePercent) {
  if (!el) return;
  const isUp = changePercent >= 0;
  el.classList.remove('arrow-up', 'arrow-down');
  el.classList.add(isUp ? 'arrow-up' : 'arrow-down');
  const arrow = isUp ? '▲' : '▼';
  const sign = isUp ? '+' : '';
  el.textContent = `${arrow} ${sign}${changePercent.toFixed(2)}%`;
}

function updateTickerRow(rate, changePercent) {
  const rows = document.querySelectorAll('.ticker-item');
  rows.forEach((row) => {
    const nameEl = row.querySelector('.name');
    if (!nameEl || nameEl.textContent.trim() !== 'USD/IDR') return;
    const priceEl = row.querySelector('.price');
    const changeEl = row.querySelector('.arrow-up, .arrow-down');
    if (priceEl) priceEl.textContent = formatRupiah(rate);
    if (changeEl) {
      const isUp = changePercent >= 0;
      changeEl.classList.remove('arrow-up', 'arrow-down');
      changeEl.classList.add(isUp ? 'arrow-up' : 'arrow-down');
      const arrow = isUp ? '▲' : '▼';
      const sign = isUp ? '+' : '';
      changeEl.textContent = `${arrow} ${sign}${changePercent.toFixed(2)}%`;
    }
  });
}

async function loadUsdIdrRate() {
  if (!EXCHANGE_RATE_API_KEY || EXCHANGE_RATE_API_KEY === 'GANTI_DENGAN_API_KEY_KAMU') {
    return; // token belum diisi — biarkan tampilan dummy bawaan
  }

  try {
    const res = await fetch(EXCHANGE_RATE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.conversion_rates && data.conversion_rates.IDR;
    if (!rate) throw new Error('Field IDR tidak ditemukan di respons API');

    const prevRate = parseFloat(localStorage.getItem(STORAGE_KEY_PREV_RATE));
    const changePercent = prevRate ? ((rate - prevRate) / prevRate) * 100 : 0;

    const priceEl = document.getElementById('usdidr-price');
    const changeEl = document.getElementById('usdidr-change');
    if (priceEl) priceEl.textContent = formatRupiah(rate);
    if (changeEl) applyChangeStyle(changeEl, changePercent);

    updateTickerRow(rate, changePercent);

    localStorage.setItem(STORAGE_KEY_PREV_RATE, String(rate));
  } catch (err) {
    console.error('Gagal memuat kurs USD/IDR dari ExchangeRate-API:', err);
    // Biarkan fallback dummy di HTML tetap terlihat
  }
}

document.addEventListener('DOMContentLoaded', loadUsdIdrRate);
