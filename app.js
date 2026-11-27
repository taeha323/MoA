// app.js — MoA 자동 롤링 OTT 히어로, 탐색, 수어 학습 플레이어, 커뮤니티 로직

document.addEventListener('DOMContentLoaded', async () => {
  initScrollReveal();

  const contents = await fetchMoAContents();
  const prefs = await fetchPipSettings();

  if (document.getElementById('ottHeroSection')) {
    initHeroSlider(contents.slice(0, 4));
  }
  if (document.getElementById('catalogPageGrid')) {
    initShowcase(contents, 'catalogPageGrid', true);
  }
  if (document.getElementById('playerPageRoot')) {
    initPlayerPage(contents, prefs);
  }
  if (document.getElementById('communityPageRoot')) {
    initCommunityPage();
  }
});

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  targets.forEach(el => observer.observe(el));
}

// 1. 4초 간격 자동 전환 OTT 메인 히어로 슬라이더
function initHeroSlider(slides) {
  const bgEl = document.getElementById('heroBg');
  const platformEl = document.getElementById('heroPlatform');
  const genreEl = document.getElementById('heroGenre');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');
  const watchBtn = document.getElementById('heroWatchBtn');
  const learnBtn = document.getElementById('heroLearnBtn');
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
    watchBtn.href = `player.html?id=${item.id}`;
    learnBtn.href = `player.html?id=${item.id}&mode=learn`;
    glossEl.textContent = item.sign_gloss;

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

// 2. 콘텐츠 쇼케이스 렌더링 (불필요한 안내 문구 제거, 포스터 중심)
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

    grid.innerHTML = filtered.map(item => `
      <article class="poster-card">
        <a href="player.html?id=${item.id}" class="poster-media" style="background-image:url('${item.thumb_url}')" aria-label="${item.title} 감상하기">
          <span class="ott-pill">${item.platform}</span>
          <span class="sign-pill">AI 수어 지원</span>
        </a>
        <div class="poster-info">
          <div class="poster-meta">${item.genre} · ${item.year}</div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <a href="player.html?id=${item.id}" class="btn btn-primary btn-sm">PIP 감상하기</a>
            <a href="player.html?id=${item.id}&mode=learn" class="btn btn-secondary btn-sm">수어 학습</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activePlatform = chip.dataset.platform;
      render();
    });
  });

  if (enableSearch) {
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        render();
      });
    }
  }

  render();
}

// 3. 플레이어 & 수어 학습 모드 제어
function initPlayerPage(contents, prefs) {
  const params = new URLSearchParams(window.location.search);
  const contentId = Number(params.get('id')) || 1;
  const initialMode = params.get('mode') === 'learn' ? 'learn' : 'watch';
  const item = contents.find(c => c.id === contentId) || contents[0];

  document.getElementById('playerTitle').textContent = item.title;
  document.getElementById('playerMeta').textContent = `${item.platform} · ${item.genre} · ${item.year}`;
  document.getElementById('playerSummary').textContent = item.summary;
  document.getElementById('playerDialogue').textContent = item.sample_dialogue;
  document.getElementById('playerGloss').textContent = item.sign_gloss;
  document.getElementById('officialOttBtn').href = item.ott_url;

  const viewport = document.getElementById('playerScreenBg');
  viewport.style.backgroundImage = `linear-gradient(180deg, rgba(7,9,15,0.22) 0%, rgba(7,9,15,0.92) 100%), url('${item.thumb_url}')`;

  // 핵심 수어 단어 카드 렌더링
  const vocabContainer = document.getElementById('vocabCardList');
  if (vocabContainer && item.vocab) {
    vocabContainer.innerHTML = item.vocab.map(v => `
      <div class="vocab-card">
        <div class="vocab-card-head">
          <span class="vocab-word">${v.word}</span>
          <span class="vocab-tag">${v.level}</span>
        </div>
        <p class="vocab-tip">${v.hand}</p>
      </div>
    `).join('');
  }

  // PIP 제어
  const pipEl = document.getElementById('liveDemoPip');
  const toggleBtn = document.getElementById('demoPipToggle');
  const scaleInput = document.getElementById('demoScaleRange');
  const speedInput = document.getElementById('demoSpeedRange');
  const scaleLabel = document.getElementById('demoScaleLabel');
  const speedLabel = document.getElementById('demoSpeedLabel');
  const pipSpeedBadge = document.getElementById('demoPipSpeedBadge');
  const saveBtn = document.getElementById('demoSavePrefsBtn');
  const statusMsg = document.getElementById('demoSaveStatus');

  let state = {
    enabled: prefs.enabled !== false,
    scale: prefs.scale || 100,
    position: prefs.position || 'bottom-right',
    speed: initialMode === 'learn' ? 0.8 : (prefs.speed || 1.0)
  };

  function applyState() {
    pipEl.classList.toggle('is-hidden', !state.enabled);
    toggleBtn.textContent = state.enabled ? '아바타 ON' : '아바타 OFF';
    toggleBtn.classList.toggle('off', !state.enabled);

    pipEl.classList.remove('pos-bottom-right', 'pos-bottom-left', 'pos-top-right', 'pos-top-left');
    pipEl.classList.add(`pos-${state.position}`);
    pipEl.style.transform = `scale(${state.scale / 100})`;

    scaleInput.value = state.scale;
    scaleLabel.textContent = `${state.scale}%`;

    speedInput.value = state.speed;
    const fmt = Number(state.speed).toFixed(1);
    speedLabel.textContent = `${fmt}x`;
    pipSpeedBadge.textContent = `${fmt}x`;

    pipEl.querySelectorAll('.av-hand').forEach(h => {
      h.style.animationDuration = `${(1.6 / state.speed).toFixed(2)}s`;
    });

    document.querySelectorAll('.pos-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pos === state.position);
    });
  }

  // 감상 모드 / 수어 학습 모드 탭 전환
  const watchTab = document.getElementById('tabWatchMode');
  const learnTab = document.getElementById('tabLearnMode');
  const watchPanel = document.getElementById('watchModePanel');
  const learnPanel = document.getElementById('learnModePanel');

  function setMode(mode) {
    const isLearn = mode === 'learn';
    watchTab.classList.toggle('active', !isLearn);
    learnTab.classList.toggle('active', isLearn);
    watchPanel.style.display = isLearn ? 'none' : 'block';
    learnPanel.style.display = isLearn ? 'block' : 'none';
    if (isLearn) {
      state.speed = 0.8;
      applyState();
    }
  }

  watchTab.addEventListener('click', () => setMode('watch'));
  learnTab.addEventListener('click', () => setMode('learn'));

  toggleBtn.addEventListener('click', () => { state.enabled = !state.enabled; applyState(); });
  scaleInput.addEventListener('input', (e) => { state.scale = Number(e.target.value); applyState(); });
  speedInput.addEventListener('input', (e) => { state.speed = Number(e.target.value); applyState(); });

  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => { state.position = btn.dataset.pos; applyState(); });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const res = await savePipSettings(state);
      statusMsg.textContent = res.mode === 'cloud'
        ? '✓ 클라우드 DB에 설정이 저장되었습니다.'
        : '✓ 브라우저에 PIP 설정이 저장되었습니다.';
    });
  }

  applyState();
  setMode(initialMode);
}

// 4. 농인 & 수어 학습자 커뮤니티 게시판
function initCommunityPage() {
  const storageKey = 'moa_community_posts_v1';
  let posts = JSON.parse(localStorage.getItem(storageKey)) || [...window.MOA_DEFAULT_POSTS];
  let activeCat = 'ALL';

  const listEl = document.getElementById('communityPostList');
  const formEl = document.getElementById('communityForm');

  function savePosts() {
    localStorage.setItem(storageKey, JSON.stringify(posts));
  }

  function renderPosts() {
    const filtered = activeCat === 'ALL' ? posts : posts.filter(p => p.category === activeCat);
    listEl.innerHTML = filtered.map(post => `
      <article class="post-card">
        <div class="post-header">
          <span class="post-badge">${post.category}</span>
          <span style="font-size:12px; color:var(--text-muted);">${post.date}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-body">${post.body}</p>
        <div class="post-footer">
          <span>작성자 · ${post.author}</span>
          <button type="button" class="like-btn" onclick="likeCommunityPost(${post.id})">
            ♥ 공감 ${post.likes}
          </button>
        </div>
      </article>
    `).join('');
  }

  window.likeCommunityPost = (id) => {
    const target = posts.find(p => p.id === id);
    if (target) {
      target.likes += 1;
      savePosts();
      renderPosts();
    }
  };

  document.querySelectorAll('.comm-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.comm-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      renderPosts();
    });
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('postCategory').value;
    const author = document.getElementById('postAuthor').value.trim() || '익명 학습자';
    const title = document.getElementById('postTitle').value.trim();
    const body = document.getElementById('postBody').value.trim();
    if (!title || !body) return;

    posts.unshift({
      id: Date.now(),
      category,
      author,
      title,
      body,
      likes: 1,
      date: '방금 전'
    });
    savePosts();
    formEl.reset();
    renderPosts();
  });

  renderPosts();
}
