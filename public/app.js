import './style.css';

const menu = [
['⌂', 'Dashboard'],
['⌕', 'Riset Pasar'],
['⌗', 'Riset Keyword'],
['✎', 'Generator Artikel'],
['▦', 'Jadwal Posting'],
['▤', 'Artikel Terbit'],
['↗', 'Analitik SEO']
];

document.querySelector('#app').innerHTML = `

  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">D</div>
        <div>
          <strong>DIGITEK</strong>
          <small>AUTO CONTENT ENGINE</small>
        </div>
      </div>  <nav>
    ${menu.map(([icon, label], i) => `
      <button class="nav-item ${i === 0 ? 'active' : ''}" data-menu="${label}">
        <span>${icon}</span>${label}
      </button>
    `).join('')}
  </nav>

  <div class="side-note">
    <span class="pulse"></span>
    Sistem siap dikembangkan
  </div>
</aside>

<main class="main">
  <header class="topbar">
    <div>
      <span class="eyebrow">CONTENT GROWTH WORKSPACE</span>
      <h1>Dashboard</h1>
    </div>
    <div class="user-chip">
      <span class="avatar">DS</span>
      <span>Digitek Store</span>
    </div>
  </header>

  <section class="welcome">
    <div>
      <span class="tag">PUSAT KENDALI KONTEN</span>
      <h2>Bangun trafik organik,<br>
      <em>mulai dari riset yang tepat.</em></h2>
      <p>
        Temukan peluang pencarian, susun artikel bermanfaat,
        lalu ukur hasilnya untuk mengembangkan Digitek Store.
      </p>
    </div>

    <div class="welcome-art">
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
      <div class="chart-icon">↗</div>
      <span class="art-label">ORGANIC<br>GROWTH</span>
    </div>
  </section>

  <section class="stats">
    <article class="stat-card">
      <span class="stat-icon blue">⌕</span>
      <span class="stat-label">Topik ditemukan</span>
      <strong>—</strong>
      <small>Menunggu modul riset</small>
    </article>

    <article class="stat-card">
      <span class="stat-icon violet">✎</span>
      <span class="stat-label">Draft artikel</span>
      <strong>0</strong>
      <small>Belum ada artikel dibuat</small>
    </article>

    <article class="stat-card">
      <span class="stat-icon green">▤</span>
      <span class="stat-label">Artikel terbit</span>
      <strong>0</strong>
      <small>Menunggu integrasi Blogger</small>
    </article>

    <article class="stat-card">
      <span class="stat-icon amber">↗</span>
      <span class="stat-label">Klik organik</span>
      <strong>—</strong>
      <small>Menunggu Search Console</small>
    </article>
  </section>

  <section class="content-grid">
    <article class="panel research-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">LANGKAH PERTAMA</span>
          <h3>Riset peluang konten</h3>
        </div>
        <span class="status-pill">Belum dikonfigurasi</span>
      </div>

      <p class="muted">
        Mesin riset akan mengumpulkan ide dari kebutuhan pengguna,
        tren pencarian, dan data performa website.
        Setiap ide akan dinilai sebelum dijadikan artikel.
      </p>

      <div class="research-steps">
        <div><b>01</b><span>Temukan topik</span></div>
        <div><b>02</b><span>Nilai peluang keyword</span></div>
        <div><b>03</b><span>Pilih ide terbaik</span></div>
      </div>

      <button class="primary-btn" id="researchBtn">
        Siapkan modul riset <span>→</span>
      </button>

      <p class="notice" id="notice" aria-live="polite"></p>
    </article>

    <article class="panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">ALUR KERJA</span>
          <h3>Mesin konten</h3>
        </div>
      </div>

      <div class="workflow">
        <div class="flow-row done">
          <span>⌕</span>
          <div><b>Riset pasar</b><small>Fondasi sistem</small></div>
          <i>1</i>
        </div>
        <div class="flow-line"></div>

        <div class="flow-row">
          <span>✎</span>
          <div><b>Penulisan AI</b><small>Setelah riset siap</small></div>
          <i>2</i>
        </div>
        <div class="flow-line"></div>

        <div class="flow-row">
          <span>▤</span>
          <div><b>Publikasi Blogger</b><small>Setelah integrasi API</small></div>
          <i>3</i>
        </div>
        <div class="flow-line"></div>

        <div class="flow-row">
          <span>↗</span>
          <div><b>Evaluasi trafik</b><small>Setelah Search Console</small></div>
          <i>4</i>
        </div>
      </div>
    </article>
  </section>

  <footer>
    © 2026 Digitek Store · Auto Content Engine
    <span>Versi awal · Dashboard prototype</span>
  </footer>
</main>
  </div>
  `;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

const researchPanel = document.querySelector('.research-panel');

const resultContainer = document.createElement('div');
resultContainer.id = 'researchResults';
resultContainer.style.marginTop = '20px';

researchPanel.appendChild(resultContainer);

// KATALOG IDE KONTEN SEO DIGITEK STORE
const contentIdeas = [
  {
    title: 'Cara Membeli Pulsa Online dengan Mudah dan Aman',
    category: 'Pulsa',
    keyword: 'cara membeli pulsa online',
    intent: 'Transaksional'
  },
  {
    title: 'Cara Memilih Paket Data Internet Sesuai Kebutuhan',
    category: 'Paket Data',
    keyword: 'cara memilih paket data internet',
    intent: 'Informasional'
  },
  {
    title: 'Cara Cek Kuota Internet Berbagai Operator',
    category: 'Paket Data',
    keyword: 'cara cek kuota internet',
    intent: 'Informasional'
  },
  {
    title: 'Cara Membeli Token Listrik PLN Secara Online',
    category: 'Token PLN',
    keyword: 'cara membeli token listrik online',
    intent: 'Transaksional'
  },
  {
    title: 'Cara Mengisi Token Listrik ke Meteran dengan Benar',
    category: 'Token PLN',
    keyword: 'cara memasukkan token listrik',
    intent: 'Informasional'
  },
  {
    title: 'Cara Top Up DANA dengan Mudah',
    category: 'E-Wallet',
    keyword: 'cara top up dana',
    intent: 'Transaksional'
  },
  {
    title: 'Cara Top Up OVO dan GoPay Secara Online',
    category: 'E-Wallet',
    keyword: 'cara top up ovo gopay',
    intent: 'Transaksional'
  },
  {
    title: 'Cara Membeli Voucher Game Online',
    category: 'Voucher Game',
    keyword: 'cara membeli voucher game online',
    intent: 'Transaksional'
  },
  {
    title: 'Tips Memilih Nominal Top Up Mobile Legends',
    category: 'Voucher Game',
    keyword: 'nominal top up mobile legends',
    intent: 'Informasional'
  },
  {
    title: 'Tips Aman Melakukan Transaksi Digital',
    category: 'Keamanan Digital',
    keyword: 'tips aman transaksi digital',
    intent: 'Informasional'
  },
  {
    title: 'Keuntungan Membeli Pulsa dan Paket Data Secara Online',
    category: 'Pulsa & Paket Data',
    keyword: 'keuntungan membeli pulsa online',
    intent: 'Informasional'
  },
  {
    title: 'Cara Memilih Layanan Top Up Digital yang Terpercaya',
    category: 'Layanan Digital',
    keyword: 'layanan top up digital terpercaya',
    intent: 'Informasional'
  }
];

// TAMPILKAN IDE KONTEN
const ideaContainer = document.createElement('div');
ideaContainer.style.marginTop = '22px';

ideaContainer.innerHTML = `
  <div style="
    padding:16px;
    border:1px solid #e7edf3;
    border-radius:12px;
    background:white;
  ">
    <span style="
      font-size:10px;
      color:#147c65;
      font-weight:bold;
    ">
      SUMBER IDE KEDUA
    </span>

    <h3 style="margin:7px 0">
      Ide Konten SEO Digitek Store
    </h3>

    <p style="
      font-size:11px;
      color:#8496aa;
      line-height:1.6;
    ">
      Rekomendasi topik berdasarkan kategori layanan
      dan kebutuhan informasi pelanggan.
    </p>

    <div style="
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:8px;
      margin:15px 0;
    ">
      <div style="
        background:#e5f7ef;
        padding:12px;
        border-radius:9px;
      ">
        <strong style="font-size:22px;color:#147c65">
          ${contentIdeas.length}
        </strong>
        <div style="font-size:10px;color:#147c65">
          Ide tersedia
        </div>
      </div>

      <div style="
        background:#eef3ff;
        padding:12px;
        border-radius:9px;
      ">
        <strong style="font-size:22px;color:#365da8">
          2
        </strong>
        <div style="font-size:10px;color:#365da8">
          Jenis intent utama
        </div>
      </div>
    </div>

    ${contentIdeas.map((idea, index) => `
      <div style="
        padding:12px;
        margin:9px 0;
        background:#f5f8fb;
        border:1px solid #e7edf3;
        border-radius:9px;
      ">
        <strong style="font-size:12px;color:#183653">
          ${index + 1}. ${escapeHTML(idea.title)}
        </strong>

        <div style="
          font-size:10px;
          color:#147c65;
          margin-top:7px;
        ">
          ${escapeHTML(idea.category)}
        </div>

        <div style="
          font-size:11px;
          color:#72849a;
          margin-top:5px;
        ">
          Keyword: ${escapeHTML(idea.keyword)}
        </div>

        <div style="
          font-size:10px;
          color:#8496aa;
          margin-top:5px;
        ">
          Intent: ${escapeHTML(idea.intent)}
        </div>

  <div style="
  margin-top:12px;
  padding:12px;
  background:#eaf4ff;
  border-radius:8px;
">
  <strong style="font-size:11px;color:#183653">
    ANALISIS KUALITAS KEYWORD
  </strong>

  <div style="margin-top:8px;font-size:11px;color:#52677d">
    Relevansi:
    <strong>${analisisKualitasKeyword(idea).relevansi}/100</strong>
  </div>

  <div style="margin-top:6px;font-size:11px;color:#52677d">
    Potensi pelanggan:
    <strong>${analisisKualitasKeyword(idea).potensi}/100</strong>
  </div>

  <div style="margin-top:6px;font-size:11px;color:#52677d">
    Kesesuaian artikel:
    <strong>${analisisKualitasKeyword(idea).kesesuaian}/100</strong>
  </div>

  <div style="
    margin-top:10px;
    padding:9px;
    background:#e9f8f0;
    border-radius:7px;
    font-size:11px;
    color:#147c65;
  ">
    <strong>SKOR RATA-RATA:</strong>
    ${analisisKualitasKeyword(idea).rataRata}/100

    <br>

    <strong>PRIORITAS:</strong>
    ${escapeHTML(analisisKualitasKeyword(idea).prioritas)}
  </div>

<button
  class="buat-artikel"
  data-title="${escapeHTML(idea.title)}"
  data-keyword="${escapeHTML(idea.keyword)}"
  data-category="${escapeHTML(idea.category)}"
  data-intent="${escapeHTML(idea.intent)}"
  style="
    width:100%;
    margin-top:12px;
    padding:11px;
    border:0;
    border-radius:8px;
    background:#147c65;
    color:white;
    font-size:12px;
    font-weight:bold;
    cursor:pointer;
  "
>
  ✎ Buat Artikel
</button>

</div>
      </div>
    `).join('')}

    <p style="
      font-size:10px;
      color:#8496aa;
      margin-top:12px;
    ">
      Sumber: Katalog ide internal Digitek Store.
      Belum merupakan hasil pengukuran volume pencarian Google.
    </p>
  </div>
`;

researchPanel.appendChild(ideaContainer);

async function jalankanRiset() {
  resultContainer.innerHTML = `
    <p style="color:#147c65;font-size:12px">
      ⏳ Sedang mengambil data Google Trends Indonesia...
    </p>
  `;

  try {
    const response = await fetch('/api/research');
    const raw = await response.text();

let result;

try {
  result = JSON.parse(raw);
} catch (error) {
  throw new Error(
    `Respons server bukan JSON (HTTP ${response.status}): ${raw.slice(0, 300)}`
  );
}

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Gagal mengambil data riset');
    }

    if (!result.trends || result.trends.length === 0) {
      throw new Error('Belum ada topik yang ditemukan.');
    }

        // KELOMPOKKAN HASIL RISET
    const relevant = result.trends.filter(
      item => item.relevance === 'Relevan'
    );

    const potential = result.trends.filter(
      item => item.relevance === 'Potensial'
    );

    const irrelevant = result.trends.filter(
      item => item.relevance === 'Tidak relevan'
    );

    // TAMPILKAN KARTU TOPIK
    function renderTopics(items) {
      if (!items.length) {
        return `
          <p style="font-size:11px;color:#8496aa;padding:10px">
            Belum ada topik dalam kelompok ini.
          </p>
        `;
      }

      return items.map(item => `
        <div style="
          padding:13px;
          margin:10px 0;
          background:#f5f8fb;
          border-radius:10px;
          border:1px solid #e7edf3;
        ">
          <strong style="font-size:13px;color:#183653">
            ${escapeHTML(item.title)}
          </strong>

          <div style="margin-top:7px;font-size:11px;color:#72849a">
            Kategori: ${escapeHTML(item.category)}
          </div>

          <div style="margin-top:5px;font-size:11px;color:#147c65">
            Relevansi: ${escapeHTML(item.relevance)}
          </div>

          <div style="margin-top:5px;font-size:10px;color:#8496aa">
            Skor internal: ${escapeHTML(item.score)}
            · Perkiraan trafik: ${escapeHTML(item.traffic || 'Tidak tersedia')}
          </div>
        </div>
      `).join('');
    }

    resultContainer.innerHTML = `
      <h3 style="margin-bottom:8px">
        Hasil Riset Pasar Indonesia
      </h3>

      <p style="font-size:11px;color:#8496aa">
        ${result.total} topik ditemukan
        · ${result.cached ? 'Data cache' : 'Data terbaru'}
      </p>

      <div style="
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:7px;
        margin:15px 0;
      ">
        <div style="background:#e5f7ef;padding:12px 5px;border-radius:9px;text-align:center">
          <strong style="font-size:22px;color:#147c65">${relevant.length}</strong>
          <div style="font-size:10px;color:#147c65">Relevan</div>
        </div>

        <div style="background:#fff5df;padding:12px 5px;border-radius:9px;text-align:center">
          <strong style="font-size:22px;color:#b47a17">${potential.length}</strong>
          <div style="font-size:10px;color:#b47a17">Potensial</div>
        </div>

        <div style="background:#f0f2f5;padding:12px 5px;border-radius:9px;text-align:center">
          <strong style="font-size:22px;color:#8496aa">${irrelevant.length}</strong>
          <div style="font-size:10px;color:#8496aa">Tidak relevan</div>
        </div>
      </div>

      <h4 style="color:#147c65;margin:20px 0 8px">
        ✓ Topik Relevan
      </h4>

      ${renderTopics(relevant)}

      <h4 style="color:#b47a17;margin:20px 0 8px">
        ◉ Topik Potensial
      </h4>

      ${renderTopics(potential)}

      <details style="margin-top:20px">
        <summary style="
          cursor:pointer;
          color:#8496aa;
          font-size:12px;
          padding:10px;
          background:#f0f2f5;
          border-radius:8px;
        ">
          Lihat ${irrelevant.length} topik tidak relevan
        </summary>

        ${renderTopics(irrelevant)}
      </details>

      <p style="font-size:10px;color:#8496aa;margin-top:15px">
        Sumber: Google Trends Indonesia
      </p>
    `;

  } catch (error) {
    resultContainer.innerHTML = `
      <div style="
        padding:14px;
        background:#fff0ed;
        color:#b44435;
        border-radius:10px;
        font-size:12px;
      ">
        <strong>Riset belum berhasil.</strong>
        <p>${escapeHTML(error.message)}</p>

        <button id="retryResearch" style="
          padding:8px 12px;
          border:0;
          border-radius:6px;
          background:#147c65;
          color:white;
        ">
          Coba Lagi
        </button>
      </div>
    `;

    document.querySelector('#retryResearch')
      .addEventListener('click', jalankanRiset);
  }
}

// ===================================
// ANALISIS KUALITAS KEYWORD
// ===================================

function analisisKualitasKeyword(idea) {

  const keyword = idea.keyword.toLowerCase();
  const kategori = idea.category.toLowerCase();

  let relevansi = 60;
  let potensi = 50;
  let kesesuaian = 60;

  // RELEVANSI LAYANAN
  if (
    /pulsa|paket data|token listrik|top up|voucher game|ewallet/i
      .test(keyword)
  ) {
    relevansi += 30;
  }

  if (
    /pulsa|paket data|token pln|e-wallet|voucher game/i
      .test(kategori)
  ) {
    relevansi += 10;
  }

  // POTENSI KEBUTUHAN PELANGGAN
  if (
    /membeli|top up|cek kuota|mengisi|memasukkan/i
      .test(keyword)
  ) {
    potensi += 30;
  }

  if (idea.intent === 'Transaksional') {
    potensi += 20;
    kesesuaian += 30;
  } else {
    potensi += 10;
    kesesuaian += 20;
  }

  relevansi = Math.min(relevansi, 100);
  potensi = Math.min(potensi, 100);
  kesesuaian = Math.min(kesesuaian, 100);

  // HITUNG SKOR RATA-RATA
  const rataRata = Math.round(
    (relevansi + potensi + kesesuaian) / 3
  );

  // TENTUKAN PRIORITAS
  let prioritas;

  if (rataRata >= 90) {
    prioritas = 'Sangat Baik';
  } else if (rataRata >= 75) {
    prioritas = 'Baik';
  } else if (rataRata >= 60) {
    prioritas = 'Cukup';
  } else {
    prioritas = 'Perlu Evaluasi';
  }

  return {
    relevansi,
    potensi,
    kesesuaian,
    rataRata,
    prioritas
  };

}

// ===================================
// MODUL RISET KEYWORD DIGITEK STORE
// ===================================

function tampilkanRisetKeyword() {

  const keywordContainer = document.createElement('div');

  const variasiKeyword = [
    'cara {keyword}',
    'tips {keyword}',
    '{keyword} online',
    '{keyword} murah',
    'tempat {keyword}',
    '{keyword} dengan mudah'
  ];

  keywordContainer.innerHTML = `
    <div style="
      padding:18px;
      background:white;
      border:1px solid #e7edf3;
      border-radius:12px;
    ">

      <span style="
        font-size:10px;
        color:#147c65;
        font-weight:bold;
      ">
        KEYWORD RESEARCH ENGINE
      </span>

      <h3 style="margin:8px 0">
        Riset Keyword SEO
      </h3>

      <p style="
        font-size:11px;
        color:#8496aa;
        line-height:1.7;
      ">
        Temukan variasi keyword berdasarkan
        12 ide konten SEO Digitek Store.
      </p>

      <div id="keywordList"></div>

    </div>
  `;

  resultContainer.innerHTML = '';
  resultContainer.appendChild(keywordContainer);

  const keywordList = keywordContainer.querySelector('#keywordList');

  // HITUNG SEARCH INTENT
const totalInformasional = contentIdeas.filter(
  idea => idea.intent === 'Informasional'
).length;

const totalTransaksional = contentIdeas.filter(
  idea => idea.intent === 'Transaksional'
).length;

const intentSummary = document.createElement('div');

intentSummary.style.cssText = `
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:10px;
  margin:15px 0;
`;

intentSummary.innerHTML = `
  <div style="
    padding:13px;
    background:#eaf4ff;
    border-radius:9px;
  ">
    <div style="font-size:10px;color:#52718f">
      INFORMATIONAL
    </div>
    <strong style="font-size:22px;color:#245b91">
      ${totalInformasional}
    </strong>
    <div style="font-size:10px;color:#52718f">
      Keyword informasi
    </div>
  </div>

  <div style="
    padding:13px;
    background:#e9f8f0;
    border-radius:9px;
  ">
    <div style="font-size:10px;color:#147c65">
      TRANSACTIONAL
    </div>
    <strong style="font-size:22px;color:#147c65">
      ${totalTransaksional}
    </strong>
    <div style="font-size:10px;color:#147c65">
      Keyword transaksi
    </div>
  </div>
`;

keywordContainer.querySelector('#keywordList')
  .before(intentSummary);

  // FILTER SEARCH INTENT
const filterContainer = document.createElement('div');

filterContainer.style.cssText = `
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin:15px 0;
`;

filterContainer.innerHTML = `
  <button class="filter-intent" data-filter="Semua">
    Semua
  </button>

  <button class="filter-intent" data-filter="Informasional">
    Informasional
  </button>

  <button class="filter-intent" data-filter="Transaksional">
    Transaksional
  </button>
`;

keywordList.before(filterContainer);

filterContainer.querySelectorAll('button').forEach(button => {
  button.style.cssText = `
    padding:9px 12px;
    border:0;
    border-radius:7px;
    background:#147c65;
    color:white;
    font-size:11px;
    cursor:pointer;
  `;
});

  keywordList.innerHTML = [...contentIdeas]
  .sort((a, b) =>
    analisisKualitasKeyword(b).rataRata -
    analisisKualitasKeyword(a).rataRata
  )
  .map((idea, index) => {
    const variations = variasiKeyword.map(template =>
      template.replace('{keyword}', idea.keyword)
    );

    const uniqueKeywords = [...new Set([
      idea.keyword,
      ...variations
    ])];

    const analisis = analisisKualitasKeyword(idea);

    return `
      <details style="
        margin-top:12px;
        padding:13px;
        background:#f5f8fb;
        border:1px solid #e7edf3;
        border-radius:9px;
      ">

        <summary style="
          cursor:pointer;
          font-size:12px;
          font-weight:bold;
          color:#183653;
        ">
          ${index + 1}. ${escapeHTML(idea.keyword)}
        </summary>

        <div style="
          margin-top:12px;
          font-size:11px;
          color:#147c65;
        ">
          Kategori: ${escapeHTML(idea.category)}
        </div>

        <div style="
          margin-top:6px;
          font-size:11px;
          color:#72849a;
        ">
          Intent: ${escapeHTML(idea.intent)}
        </div>

        <div style="
          margin-top:12px;
          font-size:11px;
          font-weight:bold;
          color:#183653;
        ">
          Keyword utama dan turunannya:
        </div>

        ${uniqueKeywords.map(keyword => `
  <div style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    padding:9px;
    margin-top:6px;
    background:white;
    border:1px solid #e7edf3;
    border-radius:7px;
  ">
    <span style="
      font-size:11px;
      color:#52677d;
    ">
      ${escapeHTML(keyword)}
    </span>

    <button
      class="copy-keyword"
      data-keyword="${escapeHTML(keyword)}"
      style="
        padding:6px 10px;
        border:0;
        border-radius:6px;
        background:#147c65;
        color:white;
        font-size:10px;
        cursor:pointer;
        white-space:nowrap;
      "
    >
      Salin
    </button>
  </div>
`).join('')}

      </details>
    `;

  }).join('');

// AKTIFKAN TOMBOL SALIN KEYWORD
keywordList.querySelectorAll('.copy-keyword').forEach(button => {

  button.addEventListener('click', async () => {

    const keyword = button.dataset.keyword;

    try {
      await navigator.clipboard.writeText(keyword);

      button.textContent = 'Tersalin!';

      setTimeout(() => {
        button.textContent = 'Salin';
      }, 1500);

    } catch (error) {
      alert('Gagal menyalin keyword.');
    }

  });

});

  // AKTIFKAN FILTER SEARCH INTENT
filterContainer.querySelectorAll('.filter-intent').forEach(button => {

  button.addEventListener('click', () => {

    const filter = button.dataset.filter;

    const filteredIdeas = filter === 'Semua'
      ? contentIdeas
      : contentIdeas.filter(idea => idea.intent === filter);

    keywordList.innerHTML = '';

    filteredIdeas.forEach((idea, index) => {

      const details = document.createElement('details');

      details.style.cssText = `
        margin-top:12px;
        padding:13px;
        background:#f5f8fb;
        border:1px solid #e7edf3;
        border-radius:9px;
      `;

      details.innerHTML = `
        <summary style="cursor:pointer;font-size:12px;font-weight:bold;color:#183653">
          ${index + 1}. ${escapeHTML(idea.keyword)}
        </summary>

        <p style="font-size:11px;color:#147c65">
          Kategori: ${escapeHTML(idea.category)}
        </p>

        <p style="font-size:11px;color:#72849a">
          Intent: ${escapeHTML(idea.intent)}
        </p>

        <div id="filteredKeywords${index}"></div>
      `;

      keywordList.appendChild(details);

      const variations = variasiKeyword.map(template =>
        template.replace('{keyword}', idea.keyword)
      );

      const uniqueKeywords = [...new Set([
        idea.keyword,
        ...variations
      ])];

      const list = details.querySelector(`#filteredKeywords${index}`);

      uniqueKeywords.forEach(keyword => {

        const row = document.createElement('div');

        row.style.cssText = `
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:8px;
          padding:9px;
          margin-top:6px;
          background:white;
          border:1px solid #e7edf3;
          border-radius:7px;
          font-size:11px;
        `;

        const label = document.createElement('span');
        label.textContent = keyword;

        const copy = document.createElement('button');
        copy.textContent = 'Salin';
        copy.style.cssText = `
          padding:6px 10px;
          border:0;
          border-radius:6px;
          background:#147c65;
          color:white;
          font-size:10px;
        `;

        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(keyword);
            copy.textContent = 'Tersalin!';
            setTimeout(() => copy.textContent = 'Salin', 1500);
          } catch (error) {
            alert('Gagal menyalin keyword.');
          }
        });

        row.append(label, copy);
        list.appendChild(row);

      });

    });

  });

});

}

// ===================================
// MODUL JADWAL POSTING DIGITEK STORE
// ===================================
async function tampilkanJadwalPosting() {

  const scheduleContainer = document.createElement('div');

  scheduleContainer.innerHTML = `
    <div style="
      padding:18px;
      background:white;
      border:1px solid #e7edf3;
      border-radius:12px;
    ">

      <span style="font-size:10px;color:#147c65;font-weight:bold">
        CONTENT AUTOMATION SYSTEM
      </span>

      <h3 style="margin:8px 0">Pengaturan Jadwal Posting</h3>

      <p style="font-size:11px;color:#8496aa">
        Tentukan cara DIGITEK AUTO CONTENT ENGINE
        memproduksi dan menerbitkan artikel.
      </p>

      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:15px;
        margin-top:18px;
        background:#f1f7f5;
        border:1px solid #dcebe5;
        border-radius:10px;
      ">

        <div>
          <strong style="font-size:13px;color:#183653">
            Mesin Otomatis
          </strong>

          <p id="modeStatus" style="
            margin:5px 0 0;
            font-size:11px;
            color:#8496aa;
          ">Memuat pengaturan...</p>
        </div>

        <label style="
          position:relative;
          display:inline-block;
          width:52px;
          height:28px;
        ">
          <input type="checkbox" id="autoMode"
            disabled
            style="opacity:0;width:0;height:0">

          <span id="autoSlider" style="
            position:absolute;
            inset:0;
            background:#aab7c4;
            border-radius:30px;
          "></span>

          <span id="autoKnob" style="
            position:absolute;
            left:3px;
            top:3px;
            width:22px;
            height:22px;
            background:white;
            border-radius:50%;
            transition:.3s;
            pointer-events:none;
          "></span>
        </label>

      </div>

      <div style="margin-top:18px">

        <label style="font-size:12px;font-weight:bold">
          Jumlah artikel per hari
        </label>

        <select id="jumlahArtikel" disabled style="
          width:100%;
          padding:11px;
          margin-top:7px;
          border:1px solid #dce5ed;
          border-radius:7px;
        ">
          <option value="1">1 Artikel</option>
          <option value="2">2 Artikel</option>
          <option value="3">3 Artikel</option>
        </select>

        <label style="
          display:block;
          margin-top:15px;
          font-size:12px;
          font-weight:bold;
        ">Jam publikasi</label>

        <input type="time" id="jamPosting"
          value="06:00"
          disabled
          style="
            width:100%;
            padding:11px;
            margin-top:7px;
            border:1px solid #dce5ed;
            border-radius:7px;
          ">

        <button id="simpanJadwal" disabled style="
          width:100%;
          margin-top:20px;
          padding:12px;
          border:0;
          border-radius:8px;
          background:#aab7c4;
          color:white;
          font-weight:bold;
          cursor:pointer;
        ">Memuat...</button>

        <p id="statusJadwal"
          style="font-size:11px;color:#147c65;margin-top:12px">
        </p>

      </div>
    </div>
  `;

  resultContainer.innerHTML = '';
  resultContainer.appendChild(scheduleContainer);

  const autoMode = scheduleContainer.querySelector('#autoMode');
  const autoSlider = scheduleContainer.querySelector('#autoSlider');
  const autoKnob = scheduleContainer.querySelector('#autoKnob');
  const modeStatus = scheduleContainer.querySelector('#modeStatus');
  const jumlahArtikel = scheduleContainer.querySelector('#jumlahArtikel');
  const jamPosting = scheduleContainer.querySelector('#jamPosting');
  const statusJadwal = scheduleContainer.querySelector('#statusJadwal');
  const simpanJadwal = scheduleContainer.querySelector('#simpanJadwal');

  function perbaruiTampilanMode() {
    if (autoMode.checked) {
      autoSlider.style.background = '#147c65';
      autoKnob.style.transform = 'translateX(24px)';
      modeStatus.textContent = 'ON · Mode Otomatis';
      modeStatus.style.color = '#147c65';
    } else {
      autoSlider.style.background = '#aab7c4';
      autoKnob.style.transform = 'translateX(0)';
      modeStatus.textContent = 'OFF · Mode Manual';
      modeStatus.style.color = '#8496aa';
    }
  }

  // AMBIL PENGATURAN DARI SUPABASE
  try {
    const response = await fetch('/api/settings', {
      method: 'GET',
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Gagal mengambil pengaturan.');
    }

    const settings = result.settings;

    autoMode.checked = settings.auto_mode;
    jumlahArtikel.value = String(settings.articles_per_day);
    jamPosting.value = String(settings.posting_time).slice(0, 5);

    perbaruiTampilanMode();

    autoMode.disabled = false;
    jumlahArtikel.disabled = false;
    jamPosting.disabled = false;

    simpanJadwal.disabled = false;
    simpanJadwal.textContent = 'Simpan Pengaturan';
    simpanJadwal.style.background = '#147c65';

    statusJadwal.textContent =
      '✓ Pengaturan berhasil dimuat dari database.';

  } catch (error) {
    statusJadwal.textContent =
      'Gagal memuat pengaturan: ' + error.message;

    simpanJadwal.textContent = 'Gagal Memuat';
    return;
  }

  // SIMPAN PENGATURAN KE SUPABASE
  simpanJadwal.addEventListener('click', async () => {

    simpanJadwal.disabled = true;
    simpanJadwal.textContent = 'Menyimpan...';
    statusJadwal.textContent = '';

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auto_mode: autoMode.checked,
          articles_per_day: Number(jumlahArtikel.value),
          posting_time: jamPosting.value
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan pengaturan.');
      }

      statusJadwal.textContent =
        '✓ Pengaturan berhasil disimpan ke database.';

    } catch (error) {
      statusJadwal.textContent =
        'Gagal menyimpan: ' + error.message;

    } finally {
      simpanJadwal.disabled = false;
      simpanJadwal.textContent = 'Simpan Pengaturan';
    }

  });

  // PERBARUI TAMPILAN SWITCH
  autoMode.addEventListener('change', () => {
    perbaruiTampilanMode();
    statusJadwal.textContent =
      'Perubahan belum disimpan. Tekan Simpan Pengaturan.';
  });

}

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    button.classList.add('active');

    if (button.dataset.menu === 'Riset Pasar') {
  jalankanRiset();

} else if (button.dataset.menu === 'Riset Keyword') {
  tampilkanRisetKeyword();

} else if (button.dataset.menu === 'Jadwal Posting') {
  tampilkanJadwalPosting();

} else if (button.dataset.menu === 'Generator Artikel') {
  tampilkanGeneratorArtikel();

} else if (button.dataset.menu === 'Dashboard') {
    } else {
      resultContainer.innerHTML = `
        <p style="font-size:12px;color:#8496aa">
          Modul ${escapeHTML(button.dataset.menu)}
          akan diaktifkan pada tahap berikutnya.
        </p>
      `;
    }
  });
});

// ===================================
// HALAMAN GENERATOR ARTIKEL
// ===================================

function tampilkanGeneratorArtikel() {
  const main = document.querySelector('.main');

  // Sembunyikan konten dashboard
  main.querySelectorAll(
    '.welcome, .stats, .content-grid, footer'
  ).forEach(el => {
    el.style.display = 'none';
  });

  let halaman = document.querySelector('#generatorView');

  if (!halaman) {
    halaman = document.createElement('section');
    halaman.id = 'generatorView';
    main.appendChild(halaman);
  }

  halaman.style.display = 'block';

  halaman.innerHTML = `
    <div class="panel" style="margin-top:20px">

      <span class="eyebrow">AI CONTENT GENERATOR</span>

      <h2>Generator Artikel</h2>

      <p class="muted">
        Buat artikel SEO Digitek Store menggunakan Gemini AI.
      </p>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin:20px 0;
      ">

        <button id="modeManual" class="primary-btn">
          ✎ Generate Manual
        </button>

        <button id="modeAuto" class="primary-btn">
          🤖 Generate Otomatis
        </button>

      </div>

      <div id="generatorForm"></div>

    </div>
  `;

  const form = halaman.querySelector('#generatorForm');

  // MODE MANUAL
 halaman.querySelector('#modeManual').onclick = () => {

  form.innerHTML = `
    <h3>Generate Manual</h3>

    <p class="muted">
      Masukkan keyword artikel yang ingin dibuat.
    </p>

    <input
      id="manualKeyword"
      type="text"
      placeholder="Contoh: cara membeli pulsa online"
      style="
        width:100%;
        padding:13px;
        border:1px solid #dce5ed;
        border-radius:8px;
        box-sizing:border-box;
        margin:12px 0;
      "
    >

    <input
      id="manualSecret"
      type="password"
      placeholder="Masukkan kunci Generate Manual"
      autocomplete="off"
      style="
        width:100%;
        padding:13px;
        border:1px solid #dce5ed;
        border-radius:8px;
        box-sizing:border-box;
        margin:8px 0 12px;
      "
    >

    <button class="primary-btn" id="generateManual">
      ✨ Generate Artikel
    </button>

    <div id="generatorResult"></div>
  `;

  const tombolGenerate = form.querySelector('#generateManual');

  tombolGenerate.addEventListener('click', async () => {

    const keyword = form.querySelector('#manualKeyword').value.trim();
    const secret = form.querySelector('#manualSecret').value;
    const hasil = form.querySelector('#generatorResult');

    if (!keyword) {
      alert('Masukkan keyword artikel terlebih dahulu.');
      return;
    }

    if (!secret) {
      alert('Masukkan kunci Generate Manual.');
      return;
    }

    tombolGenerate.disabled = true;
    tombolGenerate.textContent = '⏳ Sedang menulis artikel...';

    hasil.textContent = 'Gemini sedang menyusun artikel...';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + secret
        },
        body: JSON.stringify({ keyword })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal membuat artikel.');
      }

      const artikel = result.artikel;

hasil.innerHTML = `
  <div style="padding:15px;background:#e9f8f0;border-radius:9px">
    <strong style="color:#147c65">
      ✓ Artikel berhasil dibuat!
    </strong>
  </div>

  <h3>${escapeHTML(artikel.title)}</h3>

  <p>${escapeHTML(artikel.meta_description)}</p>

  <h4>Isi Artikel (HTML)</h4>

  <textarea readonly style="
    width:100%;
    min-height:300px;
    padding:12px;
    box-sizing:border-box;
  ">${escapeHTML(artikel.content_html)}</textarea>

  <button id="saveDraft" class="primary-btn"
    style="margin-top:15px;background:#147c65">
    💾 Simpan sebagai Draft
  </button>

  <div id="saveStatus" style="margin-top:10px"></div>
`;

const tombolSimpan = hasil.querySelector('#saveDraft');

tombolSimpan.addEventListener('click', async () => {

  const status = hasil.querySelector('#saveStatus');

  tombolSimpan.disabled = true;
  tombolSimpan.textContent = '⏳ Menyimpan...';

  try {
    const response = await fetch('/api/save-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + secret
      },
      body: JSON.stringify(artikel)
    });

    const raw = await response.text();
    let result;

    try {
      result = JSON.parse(raw);
      
    } catch {
      throw new Error('Respons server tidak valid: ' + raw.slice(0, 200));
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Gagal menyimpan draft.');
    }

    status.innerHTML = `
      <div style="
        padding:12px;
        background:#e9f8f0;
        color:#147c65;
        border-radius:8px;
      ">
        ✓ Artikel berhasil disimpan sebagai Draft!
      </div>
    `;

    tombolSimpan.textContent = '✓ Draft Tersimpan';

  } catch (error) {
    status.textContent = 'Gagal menyimpan: ' + error.message;
    tombolSimpan.disabled = false;
    tombolSimpan.textContent = '💾 Simpan sebagai Draft';
  }
});

form.querySelector('#manualSecret').value = '';
      
    } catch (error) {
      hasil.textContent = 'Gagal membuat artikel: ' + error.message;
    }

    tombolGenerate.disabled = false;
    tombolGenerate.textContent = '✨ Generate Artikel';
  });
}; 
  // MODE OTOMATIS
  halaman.querySelector('#modeAuto').onclick = () => {

    form.innerHTML = `
      <h3>Generate Otomatis</h3>

      <p class="muted">
        Sistem akan memilih keyword dari hasil riset
        dan membuat artikel sesuai jadwal.
      </p>

      <div style="
        padding:15px;
        background:#eaf4ff;
        border-radius:9px;
        font-size:12px;
        line-height:1.8;
      ">
        <strong>Status:</strong> Menunggu integrasi otomatis.
        <br>
        <strong>Penjadwalan:</strong> cron-job.org.
        <br>
        <strong>Penyimpanan:</strong> Supabase.
      </div>
    `;
  };
}

document.querySelector('#researchBtn')
  .addEventListener('click', jalankanRiset);
