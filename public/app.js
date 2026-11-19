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

    resultContainer.innerHTML = `
      <h3 style="margin-bottom:8px">
        Hasil Riset Pasar Indonesia
      </h3>

      <p style="font-size:11px;color:#8496aa">
        ${result.total} topik ditemukan
        · ${result.cached ? 'Data cache' : 'Data terbaru'}
      </p>

      ${result.trends.map(item => `
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
            Perkiraan trafik:
            ${escapeHTML(item.traffic || 'Tidak tersedia')}
          </div>
        </div>
      `).join('')}

      <p style="font-size:10px;color:#8496aa">
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

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    button.classList.add('active');

    if (button.dataset.menu === 'Riset Pasar') {
      jalankanRiset();

    } else if (button.dataset.menu === 'Dashboard') {
      resultContainer.innerHTML = '';

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
