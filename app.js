// app.js — MoA 전체 페이지 인터랙션 및 상태 제어 통합 모듈
document.addEventListener('DOMContentLoaded', async () => {
  initScrollReveal();

  const contents = await fetchMoAContents();
  const pipPrefs = await fetchPipSettings();

  if (document.getElementById('ottHeroSection')) {
    initHeroSlider(contents.slice(0, 5));
  }

  if (document.getElementById('catalogPageGrid')) {
    initShowcase(contents, 'catalogPageGrid', true);
  }

  if (document.getElementById('playerPageRoot')) {
    initPlayerPage(contents, pipPrefs);
  }

  if (document.getElementById('communityPageRoot')) {
    initCommunityPage();
  }

  if (document.getElementById('pricingPageRoot')) {
    initPricingPage();
  }

  if (document.getElementById('profilePageRoot')) {
    initProfilePage(pipPrefs);
  }
});

// 0. 스크롤 등장 애니메이션
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => io.observe(el));
}

// 1. 4초 간격 자동 전환 OTT 메인 히어로 슬라이더
function initHeroSlider(slides) {
  const bgEl = document.getElementById('heroBg');
  const platformEl = document.getElementById('heroPlatform');
  const genreEl = document.getElementById('heroGenre');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');
  const watchBtn = document.getElementById('heroWatchBtn');
  const glossEl = document.getElementById('heroSignGloss');
  const dotsWrap = document.getElementById('heroDots');

  let currentIndex = 0;
  let timer = null;

  dotsWrap.innerHTML = slides.map((_, idx) =>
    `<button type="button" class="hero-dot ${idx === 0 ? 'active' : ''}" aria-label="${idx + 1}번 작품 보기"></button>`
  ).join('');

  const dots = dotsWrap.querySelectorAll('.hero-dot');

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    const item = slides[currentIndex];

    bgEl.style.backgroundImage = `url('${item.thumb_url}')`;
    platformEl.textContent = item.platform;
    genreEl.textContent = `${item.genre} · ${item.year}`;
    titleEl.textContent = item.title;
    descEl.textContent = item.summary;
    glossEl.textContent = item.sign_gloss;

    if (item.isDemo) {
      watchBtn.href = `player.html?id=${item.id}`;
      watchBtn.removeAttribute('target');
      watchBtn.removeAttribute('rel');
      watchBtn.textContent = '▶ MoA 수어 PIP 시연 영상 재생';
    } else {
      watchBtn.href = item.ott_url;
      watchBtn.target = '_blank';
      watchBtn.rel = 'noopener noreferrer';
      watchBtn.textContent = `▶ ${item.platform}에서 감상하기 ↗`;
    }

    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  function startAutoPlay() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(currentIndex + 1), 4000);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoPlay();
    });
  });

  showSlide(0);
  startAutoPlay();
}

// 2. 콘텐츠 쇼케이스 렌더링 (모아 -> 시연 플레이어 / 4대 OTT -> 각 공식 플랫폼 사이트)
function initShowcase(contents, gridId, enableSearch = false) {
  const grid = document.getElementById(gridId);
  let activePlatform = 'ALL';
  let searchQuery = '';

  function render() {
    const filtered = contents.filter(item => {
      const matchPlatform = activePlatform === 'ALL' || item.platform === activePlatform;
      const matchQuery = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.genre.toLowerCase().includes(searchQuery);
      return matchPlatform && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-secondary); grid-column:1/-1;">일치하는 작품이 없습니다.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const targetHref = item.isDemo ? `player.html?id=${item.id}` : item.ott_url;
      const linkAttrs = item.isDemo ? '' : 'target="_blank" rel="noopener noreferrer"';
      const btnLabel = item.isDemo
        ? '▶ 수어 PIP 시연 영상 재생'
        : `${item.platform}에서 감상하기 ↗`;

      return `
        <article class="poster-card">
          <a href="${targetHref}" ${linkAttrs} class="poster-media" style="background-image:url('${item.thumb_url}')" aria-label="${item.title}">
            <span class="ott-pill">${item.platform}</span>
            <span class="sign-pill">${item.isDemo ? '시연 플레이어' : 'AI 수어 지원'}</span>
          </a>
          <div class="poster-info">
            <div class="poster-meta">${item.genre} · ${item.year}</div>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <a href="${targetHref}" ${linkAttrs} class="btn ${item.isDemo ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;">
              ${btnLabel}
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  document.query
