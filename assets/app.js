(() => {
  'use strict';

  const input = document.getElementById('input');
  const form = document.getElementById('analyzeForm');
  const result = document.getElementById('result');
  const body = document.getElementById('resultBody');
  const meta = document.querySelector('.result-meta');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    const isUrl = /^https?:\/\//i.test(raw);
    const isPhone = /^\+?\d[\d\s().-]{6,}$/.test(raw);

    if (!isUrl && !isPhone) {
      alert('Masukkan URL valid atau nomor telepon.');
      return;
    }

    const payload = {
      source: isUrl ? 'link' : 'phone',
      input: raw,
      timestamp: new Date().toISOString(),
      confidence: 'medium',
      note: 'Korelasi tidak selalu berarti identitas yang sama.'
    };

    result.hidden = false;
    body.textContent = 'Menganalisis...';
    meta.textContent = 'Processing';

    await new Promise((r) => setTimeout(r, 350));

    // Simulasi hasil: cukup membuat ringkasan lokal tanpa akses jaringan
    const summary = generateLocalSummary(payload);
    body.textContent = JSON.stringify(summary, null, 2);
    meta.textContent = 'Done • ' + new Date().toLocaleTimeString();
  });

  function generateLocalSummary(payload) {
    const out = {
      input: payload.input,
      type: payload.source,
      analyzedAt: payload.timestamp,
      confidence: payload.confidence,
      note: payload.note,
      findings: []
    };

    if (payload.source === 'phone') {
      const digits = payload.input.replace(/[^\d]/g, '');
      out.findings.push({ label: 'digits', value: digits });
      if (payload.input.startsWith('+62') || digits.startsWith('62')) out.findings.push({ label: 'likely_country', value: 'Indonesia (ID)' });
      if (payload.input.includes('08')) out.findings.push({ label: 'local_format', value: 'MobileID-style prefix 08xx' });
    }

    if (payload.source === 'link') {
      try {
        const u = new URL(payload.input);
        out.findings.push({ label: 'protocol', value: u.protocol.replace(':', '') });
        out.findings.push({ label: 'host', value: u.host });
        out.findings.push({ label: 'pathname', value: u.pathname });
      } catch (err) {
        out.findings.push({ label: 'parse_error', value: 'Gagal parsing URL.' });
      }
    }

    return out;
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
