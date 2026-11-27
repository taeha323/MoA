/* app.js — MoA 전체 페이지 통합 인터랙션 (v20261127_2: 심플 일체형 아바타 + 자유 드래그 이동) */
(function () {
  const PREFS_KEY = 'moa_pip_prefs_v3';
  const SUB_KEY = 'moa_pass_subscribed';
  const PROFILE_KEY = 'moa_user_profile_v1';
  const POSTS_KEY = 'moa_community_posts_v1';

  const AVATAR_META = {
    moa: {
      name: '모아',
      tag: '표준 AI 아바타',
      skin: '#f6d2be',
      skinShadow: '#dfa88e',
      hair: '#1e2433',
      hairBack: '#151924',
      hairStyle: 'bob',
      outfit: '#263868',
      outfitAccent: '#6366f1',
      blush: 'rgba(244, 114, 182, 0.22)'
    },
    seoyeon: {
      name: '서연',
      tag: '감성 드라마형',
      skin: '#fae0d2',
      skinShadow: '#e4b39c',
      hair: '#3b2322',
      hairBack: '#291716',
      hairStyle: 'long',
      outfit: '#9d3b66',
      outfitAccent: '#f472b6',
      blush: 'rgba(251, 113, 133, 0.30)'
    },
    dohyun: {
      name: '도현',
      tag: '선명 전달형',
      skin: '#ecc2a6',
      skinShadow: '#cf9b7a',
      hair: '#141820',
      hairBack: '#0e1117',
      hairStyle: 'short',
      outfit: '#145349',
      outfitAccent: '#34d399',
      blush: 'rgba(225, 130, 110, 0.14)'
    },
    nova: {
      name: '노바',
      tag: '고대비 미니멀',
      skin: '#f3e5dc',
      skinShadow: '#d4beb2',
      hair: '#0f172a',
      hairBack: '#090d16',
      hairStyle: 'sleek',
      outfit: '#1e293b',
      outfitAccent: '#e2e8f0',
      blush: 'rgba(148, 163, 184, 0.18)'
    }
  };

  const DEFAULT_PREFS = {
    enabled: true,
    character: 'moa',
    scale: 100,
    opacity: 95,
    bgOpacity: 75,
    position: 'bottom-right',
    customX: null,
    customY: null,
    speed: 1.0
  };

  function getPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
      return Object.assign({}, DEFAULT_PREFS, saved || {});
    } catch (e) {
      return Object.assign({}, DEFAULT_PREFS);
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('설정 저장 실패:', e);
    }
  }

  function isSubscribed() {
    return localStorage.getItem(SUB_KEY) === 'true';
  }

  function applyMembershipAdState() {
    if (!isSubscribed()) return;
    document.querySelectorAll('.side-ad-rail, .sponsor-banner').forEach((el) => {
      el.style.display = 'none';
    });
  }

  /* 심플하고 매끄러운 일체형 아바타 SVG (팔·손목·손이 하나로 이어져 절대 끊기지 않음) */
  function buildSimpleAvatarSVG(charKey, mood) {
    const c = AVATAR_META[charKey] || AVATAR_META.moa;
    const m = mood || 'smile';

    const browLeft = m === 'focus'
      ? 'M 82 36 Q 87 38 93 37'
      : m === 'emphasis'
        ? 'M 82 34 Q 87 31 93 35'
        : 'M 82 36 Q 87 33.5 93 35.5';

    const browRight = m === 'focus'
      ? 'M 107 37 Q 113 38 118 36'
      : m === 'emphasis'
        ? 'M 107 35 Q 113 31 118 34'
        : 'M 107 35.5 Q 113 33.5 118 36';

    const mouthPath = m === 'emphasis'
      ? '<ellipse cx="100" cy="59.5" rx="4.4" ry="3.2" fill="#9f4a54"/>'
      : m === 'focus'
        ? '<path d="M 94.5 59 Q 100 60.2 105.5 59" stroke="#b05c65" stroke-width="2" stroke-linecap="round" fill="none"/>'
        : '<path d="M 94 58 Q 100 63.2 106 58" stroke="#b45362" stroke-width="2.1" stroke-linecap="round" fill="none"/>';

    const hairBackSvg = c.hairStyle === 'long'
      ? `<path d="M 72 38 C 67 64 69 86 76 94 L 124 94 C 131 86 133 64 128 38 Z" fill="${c.hairBack}"/>`
      : c.hairStyle === 'bob'
        ? `<path d="M 74 38 C 71 54 73 67 79 73 L 121 73 C 127 67 129 54 126 38 Z" fill="${c.hairBack}"/>`
        : '';

    const hairFrontSvg = c.hairStyle === 'short'
      ? `<path d="M 78 41 C 77 23 88 18 100 18 C 112 18 123 23 122 41 C 119 30 111 28 102 29.5 C 93 31 85 28 78 41 Z" fill="${c.hair}"/>`
      : c.hairStyle === 'sleek'
        ? `<path d="M 78 42 C 77 21 89 17 100 17 C 111 17 123 21 122 42 C 117 27 106 25.5 100 25.5 C 94 25.5 83 27 78 42 Z" fill="${c.hair}"/>`
        : `<path d="M 77 43 C 75 22 88 17 100 17 C 112 17 125 22 123 43 C 120 30 112 27.5 103 30 C 95 32.5 86 29 77 43 Z" fill="${c.hair}"/>`;

    return `
      <svg class="human-avatar-svg" viewBox="0 0 200 156" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="skinGrad_${charKey}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${c.skin}"/>
            <stop offset="100%" stop-color="${c.skinShadow}"/>
          </linearGradient>
          <linearGradient id="outfitGrad_${charKey}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c.outfit}"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>

        <!-- 뒷머리 -->
        ${hairBackSvg}

        <!-- 상반신 (고정 몸통) -->
        <g>
          <path d="M 52 156 C 54 108 67 87 86 83 L 114 83 C 133 87 146 108 148 156 Z" fill="url(#outfitGrad_${charKey})" stroke="rgba(255,255,255,0.14)" stroke-width="1.2"/>
          <!-- 심플 V넥 포인트 -->
          <path d="M 86 83 L 100 105 L 114 83 L 107 82.5 L 100 94 L 93 82.5 Z" fill="${c.outfitAccent}" opacity="0.9"/>
          <!-- 목 -->
          <path d="M 92 67 L 92 84 Q 100 90 108 84 L 108 67 Z" fill="url(#skinGrad_${charKey})"/>
        </g>

        <!-- 얼굴 -->
        <g class="av-head-group">
          <path d="M 79 37 C 79 22 121 22 121 37 C 121 54 112 69 100 70 C 88 69 79 54 79 37 Z" fill="url(#skinGrad_${charKey})"/>
          <ellipse cx="86" cy="51.5" rx="4.6" ry="2.6" fill="${c.blush}"/>
          <ellipse cx="114" cy="51.5" rx="4.6" ry="2.6" fill="${c.blush}"/>

          <path d="${browLeft}" stroke="${c.hair}" stroke-width="1.9" stroke-linecap="round" fill="none"/>
          <path d="${browRight}" stroke="${c.hair}" stroke-width="1.9" stroke-linecap="round" fill="none"/>

          <g class="av-eyelids">
            <circle cx="88.5" cy="44" r="2.7" fill="#1e293b"/>
            <circle cx="89.4" cy="43.1" r="0.9" fill="#ffffff"/>
            <circle cx="111.5" cy="44" r="2.7" fill="#1e293b"/>
            <circle cx="112.4" cy="43.1" r="0.9" fill="#ffffff"/>
          </g>

          <path d="M 100 45 L 99 52 Q 100 53.2 101.4 52.2" stroke="${c.skinShadow}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          ${mouthPath}
          ${hairFrontSvg}
        </g>

        <!-- 왼팔+왼손 일체형 (한 덩어리로 움직여 손목이 절대 끊기지 않음) -->
        <g class="av-limb-left">
          <!-- 심플 미튼 핸드 (팔목 안쪽에서 자연스럽게 이어짐) -->
          <path d="M 67 115 L 67 103 C 67 96 79 96 79 103 L 79 107 C 82 105.5 85 107.5 84 111 C 83 113.5 80 115 78 115.5 L 78 121 L 67 121 Z" fill="url(#skinGrad_${charKey})" stroke="${c.skinShadow}" stroke-width="1"/>
          <!-- 팔목 커프스 링 -->
          <rect x="65.5" y="117" width="15" height="4" rx="2" fill="${c.outfitAccent}"/>
          <!-- 소매 (하단 몸통까지 깊게 연결되어 회전해도 빈틈 없음) -->
          <path d="M 65.5 120 L 80.5 120 L 83 162 L 62 162 Z" fill="${c.outfit}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
        </g>

        <!-- 오른팔+오른손 일체형 (한 덩어리로 움직여 손목이 절대 끊기지 않음) -->
        <g class="av-limb-right">
          <path d="M 133 112 L 133 100 C 133 93 121 93 121 100 L 121 104 C 118 102.5 115 104.5 116 108 C 117 110.5 120 112 122 112.5 L 122 118 L 133 118 Z" fill="url(#skinGrad_${charKey})" stroke="${c.skinShadow}" stroke-width="1"/>
          <rect x="119.5" y="114" width="15" height="4" rx="2" fill="${c.outfitAccent}"/>
          <path d="M 119.5 117 L 134.5 117 L 138 162 L 117 162 Z" fill="${c.outfit}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
        </g>
      </svg>
    `;
  }

  function applyAvatarCharacterTheme(pipEl, charKey, mood) {
    if (!pipEl) return;
    const key = AVATAR_META[charKey] ? charKey : 'moa';
    pipEl.classList.remove('char-moa', 'char-seoyeon', 'char-dohyun', 'char-nova');
    pipEl.classList.add(`char-${key}`);
    const fig = pipEl.querySelector('.avatar-figure');
    if (fig) {
      fig.innerHTML = buildSimpleAvatarSVG(key, mood || 'smile');
    }
  }

  /* 1. 메인 홈 (index.html) */
  function initHome() {
    const grid = document.getElementById('catalogPageGrid');
    const heroBg = document.getElementById('heroBg');
    if (!grid && !heroBg) return;

    const prefs = getPrefs();
    const heroPip = document.querySelector('#ottHeroSection .pip-widget');
    if (heroPip) {
      const bgAlpha = (prefs.bgOpacity !== undefined ? prefs.bgOpacity : 75) / 100;
      const avAlpha = (prefs.opacity !== undefined ? prefs.opacity : 95) / 100;
      heroPip.style.setProperty('--pip-bg-alpha', String(bgAlpha));
      heroPip.style.setProperty('--pip-avatar-alpha', String(avAlpha));
      applyAvatarCharacterTheme(heroPip, prefs.character, 'smile');
    }

    const allContents = (window.MOA_DATA && Array.isArray(window.MOA_DATA.contents))
      ? window.MOA_DATA.contents
      : [];

    const heroSlides = allContents.slice(0, 5);
    const heroPlatform = document.getElementById('heroPlatform');
    const heroGenre = document.getElementById('heroGenre');
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    const heroWatchBtn = document.getElementById('heroWatchBtn');
    const heroDots = document.getElementById('heroDots');

    let slideIdx = 0;
    let slideTimer = null;

    function renderHero(idx) {
      if (!heroSlides.length) return;
      const item = heroSlides[idx % heroSlides.length];
      if (heroBg) heroBg.style.backgroundImage = `url('${item.poster}')`;
      if (heroPlatform) heroPlatform.textContent = item.platform;
      if (heroGenre) heroGenre.textContent = `${item.genre} · ${item.year}`;
      if (heroTitle) heroTitle.textContent = item.title;
      if (heroDesc) heroDesc.textContent = item.summary;

      if (heroWatchBtn) {
        heroWatchBtn.textContent = '바로가기';
        if (item.isDemo) {
          heroWatchBtn.href = 'player.html?id=1';
          heroWatchBtn.removeAttribute('target');
          heroWatchBtn.removeAttribute('rel');
        } else {
          heroWatchBtn.href = item.officialUrl;
          heroWatchBtn.target = '_blank';
          heroWatchBtn.rel = 'noopener noreferrer';
        }
      }

      if (heroDots) {
        heroDots.querySelectorAll('.hero-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === idx);
        });
      }
    }

    if (heroDots && heroSlides.length) {
      heroDots.innerHTML = heroSlides
        .map((_, i) => `<button type="button" class="hero-dot ${i === 0 ? 'active' : ''}" aria-label="슬라이드 ${i + 1}"></button>`)
        .join('');
      heroDots.querySelectorAll('.hero-dot').forEach((dot, i) => {
        dot.addEventListener('click', () => {
          slideIdx = i;
          renderHero(slideIdx);
          restartSlider();
        });
      });
    }

    function restartSlider() {
      if (slideTimer) clearInterval(slideTimer);
      if (heroSlides.length > 1) {
        slideTimer = setInterval(() => {
          slideIdx = (slideIdx + 1) % heroSlides.length;
          renderHero(slideIdx);
        }, 4000);
      }
    }

    renderHero(0);
    restartSlider();

    let currentPlatform = 'ALL';
    let currentQuery = '';
    const searchInput = document.getElementById('catalogSearchInput');
    const filterChips = document.querySelectorAll('.filter-chip[data-platform]');

    function renderGrid() {
      if (!grid) return;
      const q = currentQuery.trim().toLowerCase();
      const filtered = allContents.filter((item) => {
        const matchPlatform = currentPlatform === 'ALL' || item.platform === currentPlatform;
        const matchQuery = !q ||
          item.title.toLowerCase().includes(q) ||
          item.genre.toLowerCase().includes(q) ||
          item.platform.toLowerCase().includes(q);
        return matchPlatform && matchQuery;
      });

      if (!filtered.length) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:48px 20px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:var(--text-secondary);">
            조건에 일치하는 수어 지원 작품이 없습니다. 다른 필터나 검색어를 입력해 주세요.
          </div>`;
        return;
      }

      grid.innerHTML = filtered.map((item) => {
        const btnHtml = item.isDemo
          ? `<a href="player.html?id=${item.id}" class="btn btn-secondary btn-sm" style="width:100%;">바로가기</a>`
          : `<a href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width:100%;">바로가기</a>`;

        return `
          <article class="poster-card">
            <div class="poster-media" style="background-image:url('${item.poster}');">
              <span class="ott-pill">${item.platform}</span>
              <span class="sign-pill">${item.isDemo ? 'PIP 시연작' : 'KSL 수어 지원'}</span>
            </div>
            <div class="poster-info">
              <div class="poster-meta">${item.genre} · ${item.year} (${item.duration})</div>
              <h3>${item.title}</h3>
              <p>${item.summary}</p>
              ${btnHtml}
            </div>
          </article>
        `;
      }).join('');
    }

    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentPlatform = chip.getAttribute('data-platform') || 'ALL';
        renderGrid();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value || '';
        renderGrid();
      });
    }

    renderGrid();
  }

  /* 2. PIP 플레이어 (player.html) — 자유 드래그 배치 + 불투명도 분리 제어 */
  function initPlayer() {
    const root = document.getElementById('playerPageRoot');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id')) || 1;
    const contents = (window.MOA_DATA && window.MOA_DATA.contents) || [];
    const item = contents.find((c) => c.id === id) || contents[0];
    if (!item) return;

    const titleEl = document.getElementById('playerTitle');
    const metaEl = document.getElementById('playerMeta');
    const summaryEl = document.getElementById('playerSummary');
    const videoEl = document.getElementById('demoVideoEl');
    const screenBox = document.getElementById('demoPlayerScreen') || (videoEl ? videoEl.parentElement : null);
    const playPauseBtn = document.getElementById('videoPlayPauseBtn');
    const seekBar = document.getElementById('videoSeekBar');
    const timeText = document.getElementById('videoTimeText');
    const dialogueEl = document.getElementById('playerDialogue');
    const glossEl = document.getElementById('playerGloss');

    if (titleEl) titleEl.textContent = item.title;
    if (metaEl) metaEl.textContent = `${item.platform} · ${item.genre}`;
    if (summaryEl) summaryEl.textContent = item.summary;

    const prefs = getPrefs();
    if (prefs.bgOpacity === undefined) prefs.bgOpacity = 75;
    if (prefs.opacity === undefined) prefs.opacity = 95;
    let currentMood = 'smile';
    let suppressNextScreenClick = false;

    const pipBox = document.getElementById('liveDemoPip');
    const pipToggle = document.getElementById('demoPipToggle');
    const charBtns = document.querySelectorAll('.char-btn[data-char]');
    const charActiveText = document.getElementById('demoCharActiveLabel');
    const scaleRange = document.getElementById('demoScaleRange');
    const scaleLabel = document.getElementById('demoScaleLabel');
    const opacityRange = document.getElementById('demoOpacityRange');
    const opacityLabel = document.getElementById('demoOpacityLabel');
    const bgOpacityRange = document.getElementById('demoBgOpacityRange');
    const bgOpacityLabel = document.getElementById('demoBgOpacityLabel');
    const speedRange = document.getElementById('demoSpeedRange');
    const speedLabel = document.getElementById('demoSpeedLabel');
    const posBtns = document.querySelectorAll('.pos-btn[data-pos]');
    const saveBtn = document.getElementById('demoSavePrefsBtn');
    const saveStatus = document.getElementById('demoSaveStatus');

    function applyPipStyles(forceRebuildAvatar) {
      if (!pipBox) return;
      pipBox.classList.toggle('is-hidden', !prefs.enabled);
      pipBox.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right', 'pos-custom');

      if (prefs.position === 'custom' && typeof prefs.customX === 'number' && typeof prefs.customY === 'number') {
        pipBox.classList.add('pos-custom');
        pipBox.style.left = `${prefs.customX}px`;
        pipBox.style.top = `${prefs.customY}px`;
        pipBox.style.right = 'auto';
        pipBox.style.bottom = 'auto';
      } else {
        pipBox.style.left = '';
        pipBox.style.top = '';
        pipBox.style.right = '';
        pipBox.style.bottom = '';
        pipBox.classList.add(`pos-${prefs.position || 'bottom-right'}`);
      }

      pipBox.style.transform = `scale(${prefs.scale / 100})`;
      pipBox.style.setProperty('--pip-avatar-alpha', String((prefs.opacity ?? 95) / 100));
      pipBox.style.setProperty('--pip-bg-alpha', String((prefs.bgOpacity ?? 75) / 100));

      if (forceRebuildAvatar) {
        applyAvatarCharacterTheme(pipBox, prefs.character, currentMood);
      }

      const meta = AVATAR_META[prefs.character] || AVATAR_META.moa;
      if (charActiveText) charActiveText.textContent = `${meta.name} (${meta.tag})`;
      charBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-char') === prefs.character);
      });

      if (pipToggle) {
        pipToggle.textContent = prefs.enabled ? '아바타 ON' : '아바타 OFF';
        pipToggle.classList.toggle('off', !prefs.enabled);
      }
      if (scaleRange) scaleRange.value = String(prefs.scale);
      if (scaleLabel) scaleLabel.textContent = `${prefs.scale}%`;
      if (opacityRange) opacityRange.value = String(prefs.opacity ?? 95);
      if (opacityLabel) opacityLabel.textContent = `${prefs.opacity ?? 95}%`;
      if (bgOpacityRange) bgOpacityRange.value = String(prefs.bgOpacity ?? 75);
      if (bgOpacityLabel) bgOpacityLabel.textContent = `${prefs.bgOpacity ?? 75}%`;
      if (speedRange) speedRange.value = String(prefs.speed);
      if (speedLabel) speedLabel.textContent = `${Number(prefs.speed).toFixed(1)}x`;
      if (videoEl) {
        try { videoEl.playbackRate = Number(prefs.speed) || 1.0; } catch (e) {}
      }

      posBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-pos') === prefs.position);
      });
    }

    /* 자유 드래그 이동 (Pointer Events: 마우스 & 터치 모두 지원) */
    if (pipBox && screenBox) {
      let dragging = false;
      let startClientX = 0;
      let startClientY = 0;
      let startLeft = 0;
      let startTop = 0;
      let movedDistance = 0;

      pipBox.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.stopPropagation();

        const screenRect = screenBox.getBoundingClientRect();
        const pipRect = pipBox.getBoundingClientRect();

        startClientX = e.clientX;
        startClientY = e.clientY;
        startLeft = pipRect.left - screenRect.left;
        startTop = pipRect.top - screenRect.top;
        movedDistance = 0;
        dragging = true;

        pipBox.classList.add('is-dragging');
        if (pipBox.setPointerCapture) {
          try { pipBox.setPointerCapture(e.pointerId); } catch (err) {}
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startClientX;
        const dy = e.clientY - startClientY;
        movedDistance = Math.hypot(dx, dy);

        const maxLeft = Math.max(0, screenBox.clientWidth - pipBox.offsetWidth);
        const maxTop = Math.max(0, screenBox.clientHeight - pipBox.offsetHeight);

        const nextLeft = Math.min(Math.max(0, startLeft + dx), maxLeft);
        const nextTop = Math.min(Math.max(0, startTop + dy), maxTop);

        prefs.position = 'custom';
        prefs.customX = Math.round(nextLeft);
        prefs.customY = Math.round(nextTop);
        applyPipStyles(false);
      });

      window.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        pipBox.classList.remove('is-dragging');
        if (pipBox.releasePointerCapture) {
          try { pipBox.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        if (movedDistance > 4) {
          suppressNextScreenClick = true;
        }
      });
    }

    if (pipToggle) {
      pipToggle.addEventListener('click', () => {
        prefs.enabled = !prefs.enabled;
        applyPipStyles(false);
      });
    }
    charBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prefs.character = btn.getAttribute('data-char') || 'moa';
        applyPipStyles(true);
      });
    });
    if (scaleRange) {
      scaleRange.addEventListener('input', (e) => {
        prefs.scale = Number(e.target.value);
        applyPipStyles(false);
      });
    }
    if (opacityRange) {
      opacityRange.addEventListener('input', (e) => {
        prefs.opacity = Number(e.target.value);
        applyPipStyles(false);
      });
    }
    if (bgOpacityRange) {
      bgOpacityRange.addEventListener('input', (e) => {
        prefs.bgOpacity = Number(e.target.value);
        applyPipStyles(false);
      });
    }
    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        prefs.speed = Number(e.target.value);
        applyPipStyles(false);
      });
    }
    posBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prefs.position = btn.getAttribute('data-pos') || 'bottom-right';
        prefs.customX = null;
        prefs.customY = null;
        applyPipStyles(false);
      });
    });
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        savePrefs(prefs);
        if (saveStatus) saveStatus.textContent = '✓ 캐릭터 및 수어 PIP 위치·설정값이 저장되었습니다.';
      });
    }

    applyPipStyles(true);

    function formatSec(sec) {
      const s = Math.max(0, Math.floor(sec || 0));
      const m = String(Math.floor(s / 60)).padStart(2, '0');
      const r = String(s % 60).padStart(2, '0');
      return `${m}:${r}`;
    }

    function updateCueByTime(cur, dur) {
      if (seekBar) seekBar.value = String((cur / dur) * 100);
      if (timeText) timeText.textContent = `${formatSec(cur)} / ${formatSec(dur)}`;

      const timeline = item.timeline || [];
      let activeCue = timeline[0];
      let cueIndex = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (cur >= timeline[i].time) {
          activeCue = timeline[i];
          cueIndex = i;
        }
      }

      const moods = ['smile', 'focus', 'emphasis', 'smile'];
      const nextMood = moods[cueIndex % moods.length];
      if (nextMood !== currentMood) {
        currentMood = nextMood;
        applyAvatarCharacterTheme(pipBox, prefs.character, currentMood);
      }

      if (activeCue) {
        if (dialogueEl) dialogueEl.textContent = activeCue.dialogue;
        if (glossEl) glossEl.textContent = activeCue.gloss;
      }
    }

    if (videoEl) {
      if (screenBox && item.poster) {
        screenBox.style.backgroundImage = `linear-gradient(rgba(7,9,15,0.35), rgba(7,9,15,0.55)), url('${item.poster}')`;
        screenBox.style.backgroundSize = 'cover';
        screenBox.style.backgroundPosition = 'center';
      }

      const fallbackUrls = [
        item.videoUrl,
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ].filter(Boolean);

      let urlIdx = 0;
      let usingSimTimer = false;
      let simPlaying = true;
      let simTime = 0;
      const simDuration = 15;

      function startSimFallback() {
        if (usingSimTimer) return;
        usingSimTimer = true;
        videoEl.style.display = 'none';
        if (playPauseBtn) playPauseBtn.textContent = '❚❚ 일시정지';
        setInterval(() => {
          if (!simPlaying) return;
          const rate = Number(prefs.speed) || 1.0;
          simTime += 0.25 * rate;
          if (simTime >= simDuration) simTime = 0;
          updateCueByTime(simTime, simDuration);
        }, 250);
      }

      function tryLoadVideo(idx) {
        if (idx >= fallbackUrls.length) {
          startSimFallback();
          return;
        }
        videoEl.src = fallbackUrls[idx];
        videoEl.load();
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            if (playPauseBtn) playPauseBtn.textContent = '❚❚ 일시정지';
          }).catch(() => {
            if (playPauseBtn) playPauseBtn.textContent = '▶ 재생';
          });
        }
      }

      videoEl.addEventListener('error', () => {
        urlIdx += 1;
        tryLoadVideo(urlIdx);
      });

      tryLoadVideo(0);

      const togglePlay = (e) => {
        if (suppressNextScreenClick) {
          suppressNextScreenClick = false;
          return;
        }
        if (e && pipBox && pipBox.contains(e.target)) return;

        if (usingSimTimer) {
          simPlaying = !simPlaying;
          if (playPauseBtn) playPauseBtn.textContent = simPlaying ? '❚❚ 일시정지' : '▶ 재생';
          return;
        }
        if (videoEl.paused) {
          videoEl.play().then(() => {
            if (playPauseBtn) playPauseBtn.textContent = '❚❚ 일시정지';
          }).catch(() => {
            startSimFallback();
          });
        } else {
          videoEl.pause();
          if (playPauseBtn) playPauseBtn.textContent = '▶ 재생';
        }
      };

      if (screenBox) screenBox.addEventListener('click', togglePlay);
      if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

      videoEl.addEventListener('timeupdate', () => {
        if (usingSimTimer) return;
        const cur = videoEl.currentTime || 0;
        const dur = (videoEl.duration && isFinite(videoEl.duration)) ? videoEl.duration : 15;
        updateCueByTime(cur, dur);
      });

      if (seekBar) {
        seekBar.addEventListener('input', (e) => {
          const pct = Number(e.target.value) / 100;
          if (usingSimTimer) {
            simTime = pct * simDuration;
            updateCueByTime(simTime, simDuration);
            return;
          }
          const dur = (videoEl.duration && isFinite(videoEl.duration)) ? videoEl.duration : 15;
          videoEl.currentTime = pct * dur;
        });
      }
    }
  }

  /* 3. 멤버십 (pricing.html) */
  function initPricing() {
    const root = document.getElementById('pricingPageRoot');
    if (!root) return;

    const btn = document.getElementById('subscribePassBtn');
    const msg = document.getElementById('pricingStatusMsg');

    function sync() {
      const active = isSubscribed();
      if (btn) {
        btn.textContent = active ? 'MoA Pass 구독 중 (클릭 시 해지)' : 'MoA Pass 시작하기 (월 3,990원)';
      }
      if (msg) {
        msg.textContent = active ? '✓ 현재 MoA Pass(월 3,990원)가 활성화되어 광고가 제거되었습니다.' : '';
      }
    }

    if (btn) {
      btn.addEventListener('click', () => {
        localStorage.setItem(SUB_KEY, String(!isSubscribed()));
        sync();
      });
    }
    sync();
  }

  /* 4. 커뮤니티 (community.html) */
  function initCommunity() {
    const root = document.getElementById('communityPageRoot');
    if (!root) return;

    const listEl = document.getElementById('communityPostList');
    const formEl = document.getElementById('communityPostForm');
    const filterBtns = document.querySelectorAll('.comm-filter[data-cat]');
    let activeCat = 'ALL';

    function loadPosts() {
      try {
        const saved = JSON.parse(localStorage.getItem(POSTS_KEY) || 'null');
        if (Array.isArray(saved) && saved.length) return saved;
      } catch (e) {}
      return (window.MOA_DATA && window.MOA_DATA.defaultPosts) ? [...window.MOA_DATA.defaultPosts] : [];
    }

    let posts = loadPosts();

    function savePosts() {
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      } catch (e) {}
    }

    function renderPosts() {
      if (!listEl) return;
      const filtered = posts.filter((p) => activeCat === 'ALL' || p.category === activeCat);
      listEl.innerHTML = filtered.map((p) => `
        <article class="post-card">
          <div class="post-header">
            <span class="post-badge">${p.category}</span>
            <span style="font-size:12px; color:var(--text-muted);">${p.createdAt || '방금 전'}</span>
          </div>
          <h3 class="post-title">${p.title}</h3>
          <p class="post-body">${p.body}</p>
          <div class="post-footer">
            <span>작성자: ${p.author}</span>
            <button type="button" class="like-btn" data-like-id="${p.id}">♥ 공감 ${p.likes || 0}</button>
          </div>
        </article>
      `).join('');

      listEl.querySelectorAll('.like-btn[data-like-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = Number(btn.getAttribute('data-like-id'));
          const target = posts.find((item) => item.id === pid);
          if (target) {
            target.likes = (target.likes || 0) + 1;
            savePosts();
            renderPosts();
          }
        });
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.getAttribute('data-cat') || 'ALL';
        renderPosts();
      });
    });

    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('postCategory').value;
        const author = document.getElementById('postAuthor').value.trim() || '익명 시청자';
        const title = document.getElementById('postTitle').value.trim();
        const body = document.getElementById('postBody').value.trim();
        if (!title || !body) return;

        posts.unshift({
          id: Date.now(),
          category: cat,
          author,
          title,
          body,
          likes: 0,
          createdAt: '방금 전'
        });
        savePosts();
        formEl.reset();
        renderPosts();
      });
    }

    renderPosts();
  }

  /* 5. 프로필 & 설정 (profile.html) */
  function initProfile() {
    const root = document.getElementById('profilePageRoot');
    if (!root) return;

    const badge = document.getElementById('profilePlanBadge');
    if (badge) {
      badge.textContent = isSubscribed()
        ? 'MoA Pass 구독 중 (월 3,990원 · 광고 제거 활성화)'
        : 'Basic 무료 플랜 이용 중';
    }

    let profile = { name: '김태하', role: '수어 학습자 · 미디어 기획' };
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (saved) profile = Object.assign(profile, saved);
    } catch (e) {}

    const prefs = getPrefs();
    const nameInput = document.getElementById('profName');
    const roleInput = document.getElementById('profRole');
    const charInput = document.getElementById('profCharacter');
    const scaleInput = document.getElementById('profScale');
    const opacityInput = document.getElementById('profOpacity');
    const posInput = document.getElementById('profPosition');
    const speedInput = document.getElementById('profSpeed');
    const form = document.getElementById('profileForm');
    const msg = document.getElementById('profileSaveMsg');

    if (nameInput) nameInput.value = profile.name;
    if (roleInput) roleInput.value = profile.role;
    if (charInput) charInput.value = prefs.character || 'moa';
    if (scaleInput) scaleInput.value = String(prefs.scale);
    if (opacityInput) opacityInput.value = String(prefs.opacity);
    if (posInput) posInput.value = prefs.position === 'custom' ? 'bottom-right' : prefs.position;
    if (speedInput) speedInput.value = String(prefs.speed);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          localStorage.setItem(PROFILE_KEY, JSON.stringify({
            name: (nameInput && nameInput.value.trim()) || '사용자',
            role: (roleInput && roleInput.value) || '수어 학습자 · 미디어 기획'
          }));
        } catch (err) {}

        savePrefs(Object.assign({}, prefs, {
          enabled: true,
          character: (charInput ? charInput.value : 'moa') || 'moa',
          scale: Number(scaleInput ? scaleInput.value : 100) || 100,
          opacity: Number(opacityInput ? opacityInput.value : 95) || 95,
          position: (posInput ? posInput.value : 'bottom-right') || 'bottom-right',
          customX: null,
          customY: null,
          speed: Number(speedInput ? speedInput.value : 1.0) || 1.0
        }));

        if (msg) msg.textContent = '✓ 프로필과 기본 수어 캐릭터·PIP 설정이 저장되었습니다.';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyMembershipAdState();
    initHome();
    initPlayer();
    initPricing();
    initCommunity();
    initProfile();
  });
})();
