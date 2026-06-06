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
      hint: 'Mode: Phone Intelligence',
      allow: (v) => /^\+?\d[\d\s().-]{6,}$/.test(v) || /^\d{9,15}$/.test(v.replace(/[\s().-]/g, ''))
    },
    link: {
      label: 'Link / URL',
      placeholder: 'contoh: https://example.com',
      hint: 'Mode: Link Intelligence',
      allow: (v) => /^https?:\/\//i.test(v)
    },
    name: {
      label: 'Nama',
      placeholder: 'contoh: Prasetyo Joko',
      hint: 'Mode: Name Analysis',
      allow: (v) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]{2,}$/.test(v.trim())
    },
    location: {
      label: 'Lokasi / Kode Lokasi',
      placeholder: 'contoh: Jakarta, ID atau 12190',
      hint: 'Mode: Location Analysis',
      allow: (v) => v.trim().length >= 2
    }
  };

  const indonesiaOperators = {
    // Telkomsel
    '0811': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0812': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0813': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0821': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0822': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0823': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0851': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0852': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0853': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    '0855': { operator: 'Telkomsel', type: 'mobile', confidence: 'high' },
    // XL Axiata
    '0814': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    '0815': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    '0816': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    '0856': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    '0857': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    '0858': { operator: 'XL Axiata', type: 'mobile', confidence: 'high' },
    // Indosat Ooredoo
    '0817': { operator: 'Indosat Ooredoo', type: 'mobile', confidence: 'high' },
    '0818': { operator: 'Indosat Ooredoo', type: 'mobile', confidence: 'high' },
    '0859': { operator: 'Indosat Ooredoo', type: 'mobile', confidence: 'high' },
    // Smartfren
    '0881': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0882': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0883': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0884': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0885': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0886': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0887': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0888': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    '0889': { operator: 'Smartfren', type: 'mobile', confidence: 'high' },
    // Three (3)
    '0895': { operator: 'Three', type: 'mobile', confidence: 'high' },
    '0896': { operator: 'Three', type: 'mobile', confidence: 'high' },
    '0897': { operator: 'Three', type: 'mobile', confidence: 'high' },
    '0898': { operator: 'Three', type: 'mobile', confidence: 'high' },
    '0899': { operator: 'Three', type: 'mobile', confidence: 'high' },
  };

  const indonesiaAreaCodes = {
    '21': { city: 'Jakarta', province: 'DKI Jakarta', country: 'Indonesia (ID)', confidence: 'high' },
    '22': { city: 'Bandung', province: 'Jawa Barat', country: 'Indonesia (ID)', confidence: 'high' },
    '24': { city: 'Semarang', province: 'Jawa Tengah', country: 'Indonesia (ID)', confidence: 'high' },
    '31': { city: 'Surabaya', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '32': { city: 'Malang', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '33': { city: 'Jember', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '34': { city: 'Kediri', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '35': { city: 'Blitar', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '36': { city: 'Madiun', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '37': { city: 'Banyuwangi', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '38': { city: 'Sumenep', province: 'Jawa Timur', country: 'Indonesia (ID)', confidence: 'high' },
    '401': { city: 'Denpasar', province: 'Bali', country: 'Indonesia (ID)', confidence: 'high' },
    '361': { city: 'Mataram', province: 'NTB', country: 'Indonesia (ID)', confidence: 'high' },
    '371': { city: 'Kupang', province: 'NTT', country: 'Indonesia (ID)', confidence: 'high' },
    '451': { city: 'Pangkal Pinang', province: 'Bangka Belitung', country: 'Indonesia (ID)', confidence: 'high' },
    '521': { city: 'Palembang', province: 'Sumatera Selatan', country: 'Indonesia (ID)', confidence: 'high' },
    '561': { city: 'Jambi', province: 'Jambi', country: 'Indonesia (ID)', confidence: 'high' },
    '611': { city: 'Pontianak', province: 'Kalimantan Barat', country: 'Indonesia (ID)', confidence: 'high' },
    '711': { city: 'Makassar', province: 'Sulawesi Selatan', country: 'Indonesia (ID)', confidence: 'high' },
    '721': { city: 'Manado', province: 'Sulawesi Utara', country: 'Indonesia (ID)', confidence: 'high' },
    '751': { city: 'Kendari', province: 'Sulawesi Tenggara', country: 'Indonesia (ID)', confidence: 'high' },
    '754': { city: 'Gorontalo', province: 'Gorontalo', country: 'Indonesia (ID)', confidence: 'high' },
    '824': { city: 'Ambon', province: 'Maluku', country: 'Indonesia (ID)', confidence: 'high' },
    '831': { city: 'Jayapura', province: 'Papua', country: 'Indonesia (ID)', confidence: 'high' },
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

    await new Promise((r) => setTimeout(r, 700));

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
      const original = payload.input.trim();
      let digits = original.replace(/[^\d]/g, '');
      let normalized = digits;
      let probableOperator = null;
      let probableRegion = null;

      // Normalize to +62
      if (/^0\d{8,11}$/.test(digits)) {
        normalized = '62' + digits.substring(1);
      } else if (/^\d{9,14}$/.test(digits) && !digits.startsWith('62')) {
        normalized = '62' + digits;
      }

      // Detect operator
      if (digits.startsWith('08') && digits.length >= 10) {
        const prefix4 = digits.substring(1, 5);
        const op = indonesiaOperators[prefix4];
        if (op) probableOperator = op;
      } else if (normalized.startsWith('62') && normalized.length >= 11) {
        const prefix4 = normalized.substring(2, 6);
        const op = indonesiaOperators[prefix4];
        if (op) probableOperator = op;
      }

      // Detect region/area
      if (digits.startsWith('(') || digits.includes('(')) {
        const m = digits.match(/\((\d{2,4})\)/);
        if (m) probableRegion = indonesiaAreaCodes[m[1]];
      } else if (/^0(2\d|3\d|4\d|5\d|6\d|7\d)\d{6,8}$/.test(digits)) {
        const area = digits.substring(1, 4);
        probableRegion = indonesiaAreaCodes[area];
      }

      out.findings.push({ label: 'original_input', value: original });
      out.findings.push({ label: 'normalized', value: '+' + normalized });
      out.findings.push({ label: 'digits', value: digits });
      out.findings.push({ label: 'length', value: String(digits.length) });
      out.findings.push({ label: 'likely_country', value: 'Indonesia (ID)' });

      if (probableOperator) {
        out.findings.push({ label: 'operator', value: probableOperator.operator });
        out.findings.push({ label: 'line_type', value: probableOperator.type });
        out.confidence = probableOperator.confidence;
      } else {
        out.findings.push({ label: 'operator', value: 'unknown' });
      }

      if (probableRegion) {
        out.findings.push({ label: 'region_city', value: probableRegion.city });
        out.findings.push({ label: 'region_province', value: probableRegion.province });
        out.findings.push({ label: 'region_country', value: probableRegion.country });
        if (probableRegion.confidence === 'high') out.confidence = 'high';
      } else {
        out.findings.push({ label: 'region', value: 'not_determined' });
      }

      if (/^\+?62\d{9,12}$/.test(original) || /^0(8\d|2\d|3\d|4\d|5\d|6\d|7\d)\d{6,8}$/.test(original)) {
        out.findings.push({ label: 'format_status', value: 'valid_indonesia_format' });
      } else {
        out.findings.push({ label: 'format_status', value: 'incomplete_or_international' });
      }
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
