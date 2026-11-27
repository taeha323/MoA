/* app.js — MoA 전체 페이지 통합 인터랙션 (리얼 휴먼 아바타 표정·5지 관절 동기화) */
(function () {
  const PREFS_KEY = 'moa_pip_prefs_v1';
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
      blush: 'rgba(251, 113, 133, 0.32)'
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
    position: 'bottom-right',
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

  /* 리얼 휴먼 수어 아바타 SVG 생성기 (표정 4종 + 5지 관절) */
  function buildRealisticAvatarSVG(charKey, mood) {
    const c = AVATAR_META[charKey] || AVATAR_META.moa;
    const m = mood || 'smile';

    const browLeft = m === 'focus'
      ? 'M 81 33 Q 87 35 93 34'
      : m === 'emphasis'
        ? 'M 81 31 Q 87 28 93 32'
        : 'M 81 33 Q 87 30 93 32';

    const browRight = m === 'focus'
      ? 'M 107 34 Q 113 35 119 33'
      : m === 'emphasis'
        ? 'M 107 32 Q 113 28 119 31'
        : 'M 107 32 Q 113 30 119 33';

    const mouthPath = m === 'emphasis'
      ? '<ellipse cx="100" cy="57" rx="5.2" ry="3.6" fill="#9f4a54"/><path d="M 95.5 56 Q 100 54.5 104.5 56" stroke="#ffffff" stroke-width="1.2" fill="none"/>'
      : m === 'focus'
        ? '<path d="M 94 56.5 Q 100 57.5 106 56.5" stroke="#b05c65" stroke-width="2" stroke-linecap="round" fill="none"/>'
        : '<path d="M 93 55.5 Q 100 61.5 107 55.5" stroke="#b45362" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M 95 56.5 Q 100 59.5 105 56.5" fill="#ffffff" opacity="0.75"/>';

    const hairBackSvg = c.hairStyle === 'long'
      ? `<path d="M 70 36 C 66 64 68 92 76 104 L 124 104 C 132 92 134 64 130 36 Z" fill="${c.hairBack}"/>`
      : c.hairStyle === 'bob'
        ? `<path d="M 73 36 C 70 56 72 72 78 78 L 122 78 C 128 72 130 56 127 36 Z" fill="${c.hairBack}"/>`
        : '';

    const hairFrontSvg = c.hairStyle === 'short'
      ? `<path d="M 77 38 C 76 20 88 14 100 14 C 112 14 124 20 123 38 C 120 27 111 24 102 26 C 93 28 84 25 77 38 Z" fill="${c.hair}"/>`
      : c.hairStyle === 'sleek'
        ? `<path d="M 77 39 C 76 18 89 13 100 13 C 111 13 124 18 123 39 C 118 24 106 22 100 22 C 94 22 82 24 77 39 Z" fill="${c.hair}"/>`
        : `<path d="M 76 41 C 74 19 88 13 100 13 C 112 13 126 19 124 41 C 121 27 112 24 103 27 C 95 30 85 26 76 41 Z" fill="${c.hair}"/>`;

    const shoulderWidth = c.hairStyle === 'short' ? 'M 46 150 C 48 112 64 96 84 93 L 116 93 C 136 96 152 112 154 150 Z'
      : 'M 52 150 C 54 114 68 98 86 94 L 114 94 C 132 98 146 114 148 150 Z';

    return `
      <svg class="human-avatar-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

        <!-- 뒷머리 레이어 -->
        ${hairBackSvg}

        <!-- 상반신 및 의상 -->
        <g class="av-torso-group">
          <path d="${shoulderWidth}" fill="url(#outfitGrad_${charKey})" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
          <!-- V넥 / 카라 포인트 -->
          <path d="M 85 94 L 100 116 L 115 94 L 108 93 L 100 106 L 92 93 Z" fill="${c.outfitAccent}" opacity="0.9"/>
          <!-- 목 & 쇄골 음영 -->
          <path d="M 91 66 L 91 95 Q 100 102 109 95 L 109 66 Z" fill="url(#skinGrad_${charKey})"/>
          <path d="M 91 68 Q 100 74 109 68 L 109 75 Q 100 80 91 75 Z" fill="${c.skinShadow}" opacity="0.55"/>
        </g>

        <!-- 얼굴 & 비수지 신호(표정) 레이어 -->
        <g class="av-head-group">
          <!-- 양쪽 귀 -->
          <ellipse cx="77" cy="44" rx="3.2" ry="5.5" fill="${c.skinShadow}"/>
          <ellipse cx="123" cy="44" rx="3.2" ry="5.5" fill="${c.skinShadow}"/>
          <!-- 얼굴 윤곽 -->
          <path d="M 78 34 C 78 19 122 19 122 34 C 122 52 113 67 100 68 C 87 67 78 52 78 34 Z" fill="url(#skinGrad_${charKey})"/>
          <!-- 볼 홍조 -->
          <ellipse cx="85" cy="49" rx="5" ry="2.8" fill="${c.blush}"/>
          <ellipse cx="115" cy="49" rx="5" ry="2.8" fill="${c.blush}"/>

          <!-- 눈썹 -->
          <path d="${browLeft}" stroke="${c.hair}" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="${browRight}" stroke="${c.hair}" stroke-width="2" stroke-linecap="round" fill="none"/>

          <!-- 눈 & 눈동자 하이라이트 -->
          <g class="av-eyelids">
            <ellipse cx="88" cy="41" rx="4.4" ry="3.1" fill="#ffffff"/>
            <circle cx="88.3" cy="41" r="2.3" fill="#1e293b"/>
            <circle cx="89.1" cy="40.1" r="0.8" fill="#ffffff"/>
            <path d="M 83.4 40.3 Q 88 37.2 92.6 40.3" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" fill="none"/>

            <ellipse cx="112" cy="41" rx="4.4" ry="3.1" fill="#ffffff"/>
            <circle cx="111.7" cy="41" r="2.3" fill="#1e293b"/>
            <circle cx="112.5" cy="40.1" r="0.8" fill="#ffffff"/>
            <path d="M 107.4 40.3 Q 112 37.2 116.6 40.3" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          </g>

          <!-- 코 콧대 & 콧망울 음영 -->
          <path d="M 100 42 L 98.8 49.5 Q 100 51 101.8 49.8" stroke="${c.skinShadow}" stroke-width="1.5" stroke-linecap="round" fill="none"/>

          <!-- 입 모양 (표정 변화) -->
          ${mouthPath}

          <!-- 앞머리 레이어 -->
          ${hairFrontSvg}
        </g>

        <!-- 왼팔 & 5지 수어 손동작 -->
        <g class="av-arm-left">
          <path d="M 64 100 Q 52 122 62 134 L 74 128 Q 66 116 74 104 Z" fill="${c.outfit}"/>
          <g class="av-hand-left">
            <!-- 손목 & 손바닥 -->
            <rect x="58" y="114" width="14" height="16" rx="6" fill="url(#skinGrad_${charKey})" stroke="${c.skinShadow}" stroke-width="0.8"/>
            <!-- 5개 손가락 관절 -->
            <g class="av-fingers-active">
              <rect x="70" y="116" width="8" height="3.6" rx="1.8" transform="rotate(-24 70 116)" fill="${c.skin}"/>
              <rect x="58.5" y="102" width="3.1" height="13" rx="1.5" fill="${c.skin}"/>
              <rect x="62.2" y="100" width="3.2" height="15" rx="1.6" fill="${c.skin}"/>
              <rect x="66.0" y="102" width="3.1" height="13.5" rx="1.5" fill="${c.skin}"/>
              <rect x="69.6" y="105" width="2.8" height="11" rx="1.4" fill="${c.skin}"/>
            </g>
          </g>
        </g>

        <!-- 오른팔 & 5지 수어 손동작 -->
        <g class="av-arm-right">
          <path d="M 136 100 Q 148 120 138 132 L 126 126 Q 134 114 126 104 Z" fill="${c.outfit}"/>
          <g class="av-hand-right">
            <!-- 손목 & 손바닥 -->
            <rect x="128" y="110" width="14" height="16" rx="6" fill="url(#skinGrad_${charKey})" stroke="${c.skinShadow}" stroke-width="0.8"/>
            <!-- 5개 손가락 관절 -->
            <g class="av-fingers-active">
              <rect x="122" y="113" width="8" height="3.6" rx="1.8" transform="rotate(24 129 113)" fill="${c.skin}"/>
              <rect x="128.5" y="99" width="3.1" height="13" rx="1.5" fill="${c.skin}"/>
              <rect x="132.2" y="97" width="3.2" height="15" rx="1.6" fill="${c.skin}"/>
              <rect x="136.0" y="99" width="3.1" height="13.5" rx="1.5" fill="${c.skin}"/>
              <rect x="139.6" y="102" width="2.8" height="11" rx="1.4" fill="${c.skin}"/>
            </g>
          </g>
        </g>
      </svg>
    `;
  }

  function applyAvatarCharacterTheme(pipEl, charKey, labelEl, mood) {
    if (!pipEl) return;
    const key = AVATAR_META[charKey] ? charKey : 'moa';
    pipEl.classList.remove('char-moa', 'char-seoyeon', 'char-dohyun', 'char-nova');
    pipEl.classList.add(`char-${key}`);
    if (labelEl) {
      labelEl.textContent = `KSL · ${AVATAR_META[key].name}`;
    }
    const fig = pipEl.querySelector('.avatar-figure');
    if (fig) {
      fig.innerHTML = buildRealisticAvatarSVG(key, mood || 'smile');
    }
  }

  /* 1. 메인 홈 (index.html): 4초 롤링 히어로 + 필터/검색 카탈로그 */
  function initHome() {
    const grid = document.getElementById('catalogPageGrid');
    const heroBg = document.getElementById('heroBg');
    if (!grid && !heroBg) return;

    const prefs = getPrefs();
    const heroPip = document.querySelector('#ottHeroSection .pip-widget');
    const heroPipLabel = document.querySelector('#ottHeroSection .pip-label span:first-child');
    if (heroPip) {
      applyAvatarCharacterTheme(heroPip, prefs.character, heroPipLabel, 'smile');
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
    const heroSignGloss = document.getElementById('heroSignGloss');
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
      if (heroSignGloss) heroSignGloss.textContent = item.signGloss || '[수어] 실시간 통역 지원';

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

  /* 2. PIP 플레이어 (player.html) — 표정·손동작 실시간 싱크 + 영상 폴백 */
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
    const screenBox = videoEl ? videoEl.parentElement : null;
    const playPauseBtn = document.getElementById('videoPlayPauseBtn');
    const seekBar = document.getElementById('videoSeekBar');
    const timeText = document.getElementById('videoTimeText');
    const dialogueEl = document.getElementById('playerDialogue');
    const glossEl = document.getElementById('playerGloss');
    const pipActionEl = document.getElementById('pipActionLabel');

    if (titleEl) titleEl.textContent = item.title;
    if (metaEl) metaEl.textContent = `${item.platform} · ${item.genre}`;
    if (summaryEl) summaryEl.textContent = item.summary;

    const prefs = getPrefs();
    let currentMood = 'smile';
    const pipBox = document.getElementById('liveDemoPip');
    const pipCharLabel = document.getElementById('demoPipCharName');
    const pipToggle = document.getElementById('demoPipToggle');
    const charBtns = document.querySelectorAll('.char-btn[data-char]');
    const charActiveText = document.getElementById('demoCharActiveLabel');
    const scaleRange = document.getElementById('demoScaleRange');
    const scaleLabel = document.getElementById('demoScaleLabel');
    const opacityRange = document.getElementById('demoOpacityRange');
    const opacityLabel = document.getElementById('demoOpacityLabel');
    const speedRange = document.getElementById('demoSpeedRange');
    const speedLabel = document.getElementById('demoSpeedLabel');
    const speedBadge = document.getElementById('demoPipSpeedBadge');
    const posBtns = document.querySelectorAll('.pos-btn[data-pos]');
    const saveBtn = document.getElementById('demoSavePrefsBtn');
    const saveStatus = document.getElementById('demoSaveStatus');

    function applyPipStyles(forceRebuildAvatar) {
      if (!pipBox) return;
      pipBox.classList.toggle('is-hidden', !prefs.enabled);
      pipBox.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
      pipBox.classList.add(`pos-${prefs.position}`);
      pipBox.style.transform = `scale(${prefs.scale / 100})`;
      pipBox.style.opacity = prefs.enabled ? String(prefs.opacity / 100) : '0';

      if (forceRebuildAvatar) {
        applyAvatarCharacterTheme(pipBox, prefs.character, pipCharLabel, currentMood);
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
      if (opacityRange) opacityRange.value = String(prefs.opacity);
      if (opacityLabel) opacityLabel.textContent = `${prefs.opacity}%`;
      if (speedRange) speedRange.value = String(prefs.speed);
      if (speedLabel) speedLabel.textContent = `${Number(prefs.speed).toFixed(1)}x`;
      if (speedBadge) speedBadge.textContent = `${Number(prefs.speed).toFixed(1)}x`;
      if (videoEl) {
        try { videoEl.playbackRate = Number(prefs.speed) || 1.0; } catch (e) {}
      }

      posBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-pos') === prefs.position);
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
    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        prefs.speed = Number(e.target.value);
        applyPipStyles(false);
      });
    }
    posBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prefs.position = btn.getAttribute('data-pos') || 'bottom-right';
        applyPipStyles(false);
      });
    });
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        savePrefs(prefs);
        if (saveStatus) saveStatus.textContent = '✓ 캐릭터 및 수어 PIP 설정이 기본값으로 저장되었습니다.';
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
        applyAvatarCharacterTheme(pipBox, prefs.character, pipCharLabel, currentMood);
      }

      if (activeCue) {
        if (dialogueEl) dialogueEl.textContent = activeCue.dialogue;
        if (glossEl) glossEl.textContent = activeCue.gloss;
        if (pipActionEl) pipActionEl.textContent = activeCue.action;
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

      const togglePlay = () => {
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
    if (posInput) posInput.value = prefs.position;
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

        savePrefs({
          enabled: true,
          character: (charInput ? charInput.value : 'moa') || 'moa',
          scale: Number(scaleInput ? scaleInput.value : 100) || 100,
          opacity: Number(opacityInput ? opacityInput.value : 95) || 95,
          position: (posInput ? posInput.value : 'bottom-right') || 'bottom-right',
          speed: Number(speedInput ? speedInput.value : 1.0) || 1.0
        });

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
