(() => {
  'use strict';

  const input = document.getElementById('input');
  const form = document.getElementById('chatForm');
  const chatHistory = document.getElementById('chatHistory');
  const modeHint = document.getElementById('modeHint');

  if (!form || !input || !chatHistory) return;

  const time = () => new Date().toLocaleTimeString();

  const append = (who, text) => {
    const msg = document.createElement('div');
    msg.className = 'msg ' + who;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  const modeConfig = {
    phone: {
      label: 'Nomor HP',
      placeholder: 'contoh: +6281212345678'
    },
    link: {
      label: 'Link / URL',
      placeholder: 'contoh: https://example.com'
    },
    name: {
      label: 'Nama',
      placeholder: 'contoh: Prasetyo Joko'
    },
    location: {
      label: 'Lokasi / Kode Lokasi',
      placeholder: 'contoh: Jakarta, ID atau 12190'
    }
  };

  let activeMode = 'phone';

  document.querySelectorAll('.chat-tabs .tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chat-tabs .tab').forEach((t) => t.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.getAttribute('data-mode') || 'phone';
      const cfg = modeConfig[activeMode] || modeConfig.phone;
      input.placeholder = cfg.placeholder;
      document.getElementById('inputLabel').textContent = cfg.label;
      modeHint.textContent = activeMode;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    append('user', raw);
    input.value = '';
    append('bot', 'Menganalisis...');

    await new Promise((r) => setTimeout(r, 500));

    const result = analyze(raw, activeMode);
    append('bot', result);
  });

  function analyze(raw, mode) {
    if (mode === 'phone') {
      return analyzePhone(raw);
    }
    if (mode === 'link') {
      return analyzeLink(raw);
    }
    if (mode === 'name') {
      return analyzeName(raw);
    }
    if (mode === 'location') {
      return analyzeLocation(raw);
    }
    return 'Mode tidak dikenali.';
  }

  function analyzePhone(raw) {
    const original = raw.trim();
    const digits = original.replace(/[^\d]/g, '');
    const info = [];

    info.push('Input: ' + original);
    info.push('Digits: ' + digits);

    let normalized = digits;
    if (/^0\d{8,11}$/.test(digits)) {
      normalized = '62' + digits.substring(1);
    } else if (/^\d{9,14}$/.test(digits) && !digits.startsWith('62')) {
      normalized = '62' + digits;
    }
    info.push('Normalized: +' + normalized);

    const operators = {
      '0811': 'Telkomsel', '0812': 'Telkomsel', '0813': 'Telkomsel',
      '0821': 'Telkomsel', '0822': 'Telkomsel', '0823': 'Telkomsel',
      '0851': 'Telkomsel', '0852': 'Telkomsel', '0853': 'Telkomsel', '0855': 'Telkomsel',
      '0814': 'XL Axiata', '0815': 'XL Axiata', '0816': 'XL Axiata',
      '0856': 'XL Axiata', '0857': 'XL Axiata', '0858': 'XL Axiata',
      '0817': 'Indosat Ooredoo', '0818': 'Indosat Ooredoo', '0859': 'Indosat Ooredoo',
      '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren',
      '0884': 'Smartfren', '0885': 'Smartfren', '0886': 'Smartfren',
      '0887': 'Smartfren', '0888': 'Smartfren', '0889': 'Smartfren',
      '0895': 'Three', '0896': 'Three', '0897': 'Three', '0898': 'Three', '0899': 'Three'
    };

    const areas = {
      '21': 'Jakarta', '22': 'Bandung', '24': 'Semarang',
      '31': 'Surabaya', '32': 'Malang', '33': 'Jember',
      '401': 'Denpasar', '361': 'Mataram', '521': 'Palembang',
      '611': 'Pontianak', '711': 'Makassar', '721': 'Manado', '831': 'Jayapura'
    };

    const operatorByPrefix = digits.startsWith('08') && digits.length >= 10
      ? operators[digits.substring(1, 5)] || 'unknown'
      : (normalized.startsWith('62') ? operators[normalized.substring(2, 6)] || 'unknown' : 'unknown');

    let region = 'not_determined';
    if (digits.startsWith('(') || digits.includes('(')) {
      const m = digits.match(/\((\d{2,4})\)/);
      if (m) region = areas[m[1]] || 'not_determined';
    } else if (/^0(2\d|3\d|4\d|5\d|6\d|7\d)\d{6,8}$/.test(digits)) {
      region = areas[digits.substring(1, 4)] || 'not_determined';
    }

    info.push('Operator: ' + operatorByPrefix);
    info.push('Region: ' + region);

    if (/^\+?62\d{9,12}$/.test(original) || /^0(8\d|2\d|3\d|4\d|5\d|6\d|7\d)\d{6,8}$/.test(original)) {
      info.push('Format: valid_indonesia_format');
    } else {
      info.push('Format: incomplete_or_international');
    }

    return info.join('\n');
  }

  function analyzeLink(raw) {
    try {
      const u = new URL(raw);
      const out = [];
      out.push('URL: ' + u.href);
      out.push('Host: ' + u.host);
      out.push('Path: ' + u.pathname);
      if (u.search) out.push('Query: ' + u.search);
      if (/^www\./i.test(u.host)) out.push('Common www host detected');
      if (/\.id$/i.test(u.host)) out.push('TLD .id observed');
      return out.join('\n');
    } catch (err) {
      return 'Gagal membaca link. Cek format URL yang benar.';
    }
  }

  function analyzeName(raw) {
    const key = raw.trim().toLowerCase();
    const nameAliasMap = {
      'prasetyo joko': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
      'budi santoso': { country: 'Indonesia (ID)', lang: 'id', confidence: 'medium' },
      'joko widodo': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
      'anies baswedan': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
      'prabowo subianto': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' },
      'gibran rakabuming': { country: 'Indonesia (ID)', lang: 'id', confidence: 'high' }
    };
    const alias = nameAliasMap[key];
    const out = [];
    out.push('Normalized: ' + key);
    if (alias) {
      out.push('Match: alias_map');
      out.push('Country: ' + alias.country);
      out.push('Lang: ' + alias.lang);
      out.push('Confidence: ' + alias.confidence);
    } else {
      out.push('Match: no_direct_match');
      out.push('Saran: kombinasikan dengan lokasi/domain untuk korelasi.');
    }
    return out.join('\n');
  }

  function analyzeLocation(raw) {
    const key = raw.trim().toLowerCase();
    const locationAlias = {
      '12240': { city: 'Jakarta Selatan', province: 'DKI Jakarta', country: 'Indonesia (ID)' },
      '12190': { city: 'Jakarta Selatan', province: 'DKI Jakarta', country: 'Indonesia (ID)' },
      '40111': { city: 'Bandung', province: 'Jawa Barat', country: 'Indonesia (ID)' },
      '50211': { city: 'Surabaya', province: 'Jawa Timur', country: 'Indonesia (ID)' },
      'jakarta': { city: 'Jakarta', province: 'DKI Jakarta', country: 'Indonesia (ID)' },
      'bandung': { city: 'Bandung', province: 'Jawa Barat', country: 'Indonesia (ID)' },
      'surabaya': { city: 'Surabaya', province: 'Jawa Timur', country: 'Indonesia (ID)' },
      'bali': { city: 'Bali', province: 'Bali', country: 'Indonesia (ID)' }
    };
    const loc = locationAlias[key];
    const out = [];
    out.push('Normalized: ' + key);
    if (loc) {
      out.push('Match: alias_map');
      out.push('City: ' + loc.city);
      out.push('Province: ' + loc.province);
      out.push('Country: ' + loc.country);
    } else {
      out.push('Match: no_direct_match');
      out.push('Saran: gunakan kota atau kode pos untuk hasil lebih akurat.');
    }
    return out.join('\n');
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
