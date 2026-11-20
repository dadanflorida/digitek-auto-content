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
    const result = await response.json();

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

  keywordList.innerHTML = contentIdeas.map((idea, index) => {

    const variations = variasiKeyword.map(template =>
      template.replace('{keyword}', idea.keyword)
    );

    const uniqueKeywords = [...new Set([
      idea.keyword,
      ...variations
    ])];

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
            padding:9px;
            margin-top:6px;
            background:white;
            border:1px solid #e7edf3;
            border-radius:7px;
            font-size:11px;
            color:#52677d;
          ">
            ${escapeHTML(keyword)}
          </div>
        `).join('')}

      </details>
    `;

  }).join('');

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

document.querySelector('#researchBtn')
  .addEventListener('click', jalankanRiset);
