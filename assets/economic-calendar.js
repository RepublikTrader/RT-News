/**
 * Kalender Ekonomi — integrasi Finnhub (opsional)
 * -------------------------------------------------
 * 1. Daftar gratis di https://finnhub.io/register, ambil API key dari dashboard.
 * 2. Ganti nilai FINNHUB_TOKEN di bawah ini dengan API key kamu.
 * 3. Beri elemen sidebar id="economic-calendar-list" (sudah ditambahkan di HTML).
 *
 * PENTING — soal keamanan:
 * Kode ini jalan di browser, artinya API key akan terlihat oleh siapa saja
 * yang buka "View Source". Untuk mockup/testing di GitHub Pages/Vercel ini
 * masih wajar, TAPI kalau situs sudah production dan trafiknya nyata,
 * pindahkan pemanggilan API ini ke backend/serverless function (mis. Vercel
 * Edge Function) supaya token tidak terekspos publik dan tidak disalahgunakan
 * orang lain (bisa menghabiskan kuota gratis kamu).
 *
 * Catatan lisensi: tier gratis Finnhub ditujukan untuk penggunaan personal /
 * non-komersial. Kalau Republik Trader nanti sudah monetized, cek ulang
 * ketentuan pricing-nya di finnhub.io/pricing.
 */

const FINNHUB_TOKEN = 'da0pmfhr01qh1nooqel0da0pmfhr01qh1nooqelg';

// Negara yang relevan untuk ditampilkan (biar nggak kebanjiran event kecil)
const RELEVANT_COUNTRIES = ['US', 'ID', 'EU', 'JP', 'GB', 'CN'];

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function impactClassFor(impact) {
  const level = (impact || '').toLowerCase();
  if (level === 'high') return 'impact-high';
  if (level === 'medium') return 'impact-med';
  return 'impact-low';
}

function formatEventTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

async function loadEconomicCalendar() {
  const container = document.getElementById('economic-calendar-list');
  if (!container) return; // halaman ini tidak punya widget kalender

  if (!FINNHUB_TOKEN || FINNHUB_TOKEN === 'GANTI_DENGAN_API_KEY_KAMU') {
    // Token belum diisi — biarkan konten dummy bawaan di HTML tetap tampil
    return;
  }

  const today = new Date();
  const untilDate = new Date();
  untilDate.setDate(today.getDate() + 3);

  const url = `https://finnhub.io/api/v1/calendar/economic?from=${formatDateISO(today)}&to=${formatDateISO(untilDate)}&token=${FINNHUB_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawEvents = data.economicCalendar || data.data || [];

    const events = rawEvents
      .filter((e) => RELEVANT_COUNTRIES.includes(e.country))
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .slice(0, 6);

    if (!events.length) {
      container.innerHTML = '<div class="cal-row"><span>Tidak ada event besar terjadwal.</span></div>';
      return;
    }

    container.innerHTML = events
      .map((e) => `
        <div class="cal-row">
          <span><span class="impact ${impactClassFor(e.impact)}"></span>${e.event} (${e.country})</span>
          <span class="cal-time">${formatEventTime(e.time)}</span>
        </div>
      `)
      .join('');
  } catch (err) {
    console.error('Gagal memuat kalender ekonomi dari Finnhub:', err);
    // Biarkan fallback dummy di HTML tetap terlihat, jangan kosongkan sidebar
  }
}

document.addEventListener('DOMContentLoaded', loadEconomicCalendar);
