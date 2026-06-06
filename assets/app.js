(() => {
  'use strict';

  const input = document.getElementById('input');
  const form = document.getElementById('analyzeForm');
  const result = document.getElementById('result');
  const body = document.getElementById('resultBody');
  const meta = document.querySelector('.result-meta');
  const inputLabel = document.getElementById('inputLabel');
  const modeHint = document.getElementById('modeHint');

  if (!form || !input) return;

  const modeConfig = {
    phone: {
      label: 'Nomor HP',
      placeholder: 'contoh: +62812xxxx atau 0812xxxx',
      hint: 'Mode: Phone',
      allow: (v) => /^\+?\d[\d\s().-]{6,}$/.test(v) || /^\d{9,15}$/.test(v.replace(/[\s().-]/g, ''))
    },
    link: {
      label: 'Link / URL',
      placeholder: 'contoh: https://example.com',
      hint: 'Mode: Link',
      allow: (v) => /^https?:\/\//i.test(v)
    },
    name: {
      label: 'Nama',
      placeholder: 'contoh: Prasetyo Joko',
      hint: 'Mode: Name',
      allow: (v) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]{2,}$/.test(v.trim())
    },
    location: {
      label: 'Lokasi / Kode Lokasi',
      placeholder: 'contoh: Jakarta, ID atau 12190',
      hint: 'Mode: Location',
      allow: (v) => v.trim().length >= 2
    }
  };

  const nameAliasMap = {
    'prasetyo joko': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
    'budi santoso': { country: 'Indonesia (ID)', lang: 'id', confidence: 'medium' },
    'joko widodo': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
    'ahok': { country: 'Indonesia (ID)', lang: 'id', confidence: 'low' },
    'anies baswedan': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
    'prabowo subianto': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
    'gibran rakabuming': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' }
  };

  const locationAlias = {
    '12240': { city: 'Jakarta Selatan', country: 'Indonesia (ID)', province: 'DKI Jakarta', confidence: 'high' },
    '12190': { city: 'Jakarta Selatan', country: 'Indonesia (ID)', province: 'DKI Jakarta', confidence: 'high' },
    '40111': { city: 'Bandung', country: 'Indonesia (ID)', province: 'Jawa Barat', confidence: 'high' },
    '50211': { city: 'Surabaya', country: 'Indonesia (ID)', province: 'Jawa Timur', confidence: 'high' },
    'jakarta': { city: 'Jakarta', country: 'Indonesia (ID)', province: 'DKI Jakarta', confidence: 'medium' },
    'bandung': { city: 'Bandung', country: 'Indonesia (ID)', province: 'Jawa Barat', confidence: 'medium' },
    'surabaya': { city: 'Surabaya', country: 'Indonesia (ID)', province: 'Jawa Timur', confidence: 'medium' },
    'bali': { city: 'Bali', country: 'Indonesia (ID)', province: 'Bali', confidence: 'medium' }
  };

  let activeMode = 'phone';

  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.getAttribute('data-mode') || 'phone';
      const cfg = modeConfig[activeMode] || modeConfig.phone;
      inputLabel.textContent = cfg.label;
      input.placeholder = cfg.placeholder;
      modeHint.textContent = cfg.hint;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    const cfg = modeConfig[activeMode] || modeConfig.phone;
    if (!cfg.allow(raw)) {
      alert('Format tidak sesuai untuk mode saat ini.');
      return;
    }

    const payload = {
      source: activeMode,
      input: raw,
      timestamp: new Date().toISOString(),
      confidence: 'medium',
      note: 'Korelasi tidak selalu berarti identitas yang sama.'
    };

    result.hidden = false;
    body.textContent = 'Menganalisis...';
    meta.textContent = 'Processing';

    await new Promise((r) => setTimeout(r, 400));

    const summary = generateSummary(payload);
    body.textContent = JSON.stringify(summary, null, 2);
    meta.textContent = 'Done • ' + new Date().toLocaleTimeString();
  });

  function generateSummary(payload) {
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
      if (/^62\d{9,12}$/.test(digits)) out.findings.push({ label: 'format_status', value: 'normalized_id_mobile_format' });
    }

    if (payload.source === 'link') {
      try {
        const u = new URL(payload.input);
        out.findings.push({ label: 'protocol', value: u.protocol.replace(':', '') });
        out.findings.push({ label: 'host', value: u.host });
        out.findings.push({ label: 'pathname', value: u.pathname });
        if (/\.id$/i.test(u.host)) out.findings.push({ label: 'tld', value: '.id indicators observed' });
      } catch (err) {
        out.findings.push({ label: 'parse_error', value: 'Gagal parsing URL.' });
      }
    }

    if (payload.source === 'name') {
      const key = payload.input.trim().toLowerCase();
      const alias = nameAliasMap[key];
      out.findings.push({ label: 'normalized', value: key });
      if (alias) {
        out.findings.push({ label: 'match', value: 'alias_map' });
        out.findings.push({ label: 'country', value: alias.country });
        out.findings.push({ label: 'lang', value: alias.lang });
        out.confidence = alias.confidence;
      } else {
        out.findings.push({ label: 'match', value: 'no_direct_match' });
        out.findings.push({ label: 'suggestion', value: 'Kombinasikan dengan lokasi/domain untuk korelasi.' });
      }
    }

    if (payload.source === 'location') {
      const key = payload.input.trim().toLowerCase();
      const loc = locationAlias[key];
      out.findings.push({ label: 'normalized', value: key });
      if (loc) {
        out.findings.push({ label: 'match', value: 'alias_map' });
        out.findings.push({ label: 'city', value: loc.city });
        out.findings.push({ label: 'province', value: loc.province });
        out.findings.push({ label: 'country', value: loc.country });
        out.confidence = loc.confidence;
      } else {
        out.findings.push({ label: 'match', value: 'no_direct_match' });
        out.findings.push({ label: 'suggestion', value: 'Gunakan nama kota atau kode pos untuk meningkatkan akurasi.' });
      }
    }

    return out;
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
