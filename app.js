// app.js — MoA 랜딩 데모, 콘텐츠 탐색, 플레이어 인터랙션 로직

document.addEventListener('DOMContentLoaded', async () => {
  initScrollReveal();

  const { data: contents } = await fetchMoAContents();
  const prefs = await fetchPipSettings();

  // 페이지별 초기화
  if (document.getElementById('liveDemoPip')) {
    initLiveDemo(prefs);
  }
  if (document.getElementById('landingShowcaseGrid')) {
    initShowcase(contents, 'landingShowcaseGrid', 6);
  }
  if (document.getElementById('catalogPageGrid')) {
    initShowcase(contents, 'catalogPageGrid', contents.length, true);
  }
  if (document.getElementById('playerPageRoot')) {
    initPlayerPage(contents, prefs);
  }
});

// 1. 스크롤 등장 애니메이션
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
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

// 2. SECTION 05: LIVE DEMO 인터랙티브 제어
function initLiveDemo(initialPrefs) {
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
    enabled: initialPrefs.enabled !== false,
    scale: initialPrefs.scale || 100,
    position: initialPrefs.position || 'bottom-right',
    speed: initialPrefs.speed || 1.0
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
    const formattedSpeed = Number(state.speed).toFixed(1);
    speedLabel.textContent = `${formattedSpeed}x`;
    pipSpeedBadge.textContent = `${formattedSpeed}x`;

    // 수어 모션 속도 반영
    pipEl.querySelectorAll('.av-hand').forEach(hand => {
      hand.style.animationDuration = `${(1.6 / state.speed).toFixed(2)}s`;
    });

    document.querySelectorAll('.pos-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pos === state.position);
    });
  }

  toggleBtn.addEventListener('click', () => {
    state.enabled = !state.enabled;
    applyState();
  });

  scaleInput.addEventListener('input', (e) => {
    state.scale = Number(e.target.value);
    applyState();
  });

  speedInput.addEventListener('input', (e) => {
    state.speed = Number(e.target.value);
    applyState();
  });

  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.position = btn.dataset.pos;
      applyState();
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const res = await savePipSettings(state);
      statusMsg.textContent = res.mode === 'cloud'
        ? '✓ 클라우드 DB에 사용자 PIP 설정이 저장되었습니다.'
        : '✓ 현재 브라우저에 시연용 PIP 설정이 저장되었습니다.';
    });
  }

  applyState();
}

// 3. 콘텐츠 쇼케이스 렌더링 (랜딩 & contents.html 공용)
function initShowcase(contents, gridId, limit, enableSearch = false) {
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
    }).slice(0, limit);

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-secondary); grid-column:1/-1;">조건에 일치하는 시연용 콘텐츠가 없습니다.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <article class="poster-card">
        <div class="poster-media" style="background-image:url('${item.thumb_url}')">
          <span class="ott-pill">${item.platform}</span>
          <span class="sign-pill">AI 수어 지원 · ${item.is_sample ? '시연 샘플' : 'DB 연동'}</span>
        </div>
        <div class="poster-info">
          <div class="poster-meta">${item.genre} · ${item.year || '2024'}</div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a href="player.html?id=${item.id}" class="btn btn-secondary btn-sm">수어 오버레이로 시청하기 →</a>
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

// 4. player.html 전용 플레이어 초기화
function initPlayerPage(contents, prefs) {
  const params = new URLSearchParams(window.location.search);
  const contentId = Number(params.get('id')) || 1;
  const item = contents.find(c => c.id === contentId) || contents[0];

  document.getElementById('playerTitle').textContent = item.title;
  document.getElementById('playerMeta').textContent = `${item.platform} · ${item.genre} · ${item.duration}`;
  document.getElementById('playerSummary').textContent = item.summary;
  document.getElementById('playerDialogue').textContent = item.sample_dialogue;
  document.getElementById('playerGloss').textContent = item.sign_gloss;
  document.getElementById('officialOttBtn').href = item.ott_url;

  const viewport = document.getElementById('playerScreenBg');
  viewport.style.backgroundImage = `linear-gradient(180deg, rgba(7,9,15,0.25) 0%, rgba(7,9,15,0.92) 100%), url('${item.thumb_url}')`;

  initLiveDemo(prefs);
}
