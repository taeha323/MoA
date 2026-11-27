/* app.js — MoA 전체 페이지 통합 인터랙션 (버튼 통일 + 영상 폴백 동기화) */
(function () {
  const PREFS_KEY = 'moa_pip_prefs_v1';
  const SUB_KEY = 'moa_pass_subscribed';
  const PROFILE_KEY = 'moa_user_profile_v1';
  const POSTS_KEY = 'moa_community_posts_v1';

  const AVATAR_META = {
    moa: { name: '모아', tag: '표준 AI 아바타' },
    seoyeon: { name: '서연', tag: '감성 드라마형' },
    dohyun: { name: '도현', tag: '선명 전달형' },
    nova: { name: '노바', tag: '고대비 미니멀' }
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

  function applyAvatarCharacterTheme(pipEl, charKey, labelEl) {
    if (!pipEl) return;
    const key = AVATAR_META[charKey] ? charKey : 'moa';
    pipEl.classList.remove('char-moa', 'char-seoyeon', 'char-dohyun', 'char-nova');
    pipEl.classList.add(`char-${key}`);
    if (labelEl) {
      labelEl.textContent = `KSL · ${AVATAR_META[key].name}`;
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
      if (!heroPip.querySelector('.av-hair')) {
        const sil = heroPip.querySelector('.avatar-silhouette');
        if (sil) {
          const hair = document.createElement('div');
          hair.className = 'av-hair';
          sil.prepend(hair);
        }
      }
      applyAvatarCharacterTheme(heroPip, prefs.character, heroPipLabel);
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

  /* 2. PIP 플레이어 (player.html) — 영상 재생 및 폴백 시네마 타이머 보장 */
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

    function applyPipStyles() {
      if (!pipBox) return;
      pipBox.classList.toggle('is-hidden', !prefs.enabled);
      pipBox.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
      pipBox.classList.add(`pos-${prefs.position}`);
      pipBox.style.transform = `scale(${prefs.scale / 100})`;
      pipBox.style.opacity = prefs.enabled ? String(prefs.opacity / 100) : '0';

      applyAvatarCharacterTheme(pipBox, prefs.character, pipCharLabel);

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
        applyPipStyles();
      });
    }
    charBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prefs.character = btn.getAttribute('data-char') || 'moa';
        applyPipStyles();
      });
    });
    if (scaleRange) {
      scaleRange.addEventListener('input', (e) => {
        prefs.scale = Number(e.target.value);
        applyPipStyles();
      });
    }
    if (opacityRange) {
      opacityRange.addEventListener('input', (e) => {
        prefs.opacity = Number(e.target.value);
        applyPipStyles();
      });
    }
    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        prefs.speed = Number(e.target.value);
        applyPipStyles();
      });
    }
    posBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prefs.position = btn.getAttribute('data-pos') || 'bottom-right';
        applyPipStyles();
      });
    });
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        savePrefs(prefs);
        if (saveStatus) saveStatus.textContent = '✓ 캐릭터 및 수어 PIP 설정이 기본값으로 저장되었습니다.';
      });
    }

    applyPipStyles();

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
      for (let i = 0; i < timeline.length; i++) {
        if (cur >= timeline[i].time) activeCue = timeline[i];
      }
      if (activeCue) {
        if (dialogueEl) dialogueEl.textContent = activeCue.dialogue;
        if (glossEl) glossEl.textContent = activeCue.gloss;
        if (pipActionEl) pipActionEl.textContent = activeCue.action;
      }
    }

    if (videoEl) {
      // 포스터 배경을 기본으로 세팅해 영상 로딩 전/실패 시에도 검은 화면이 안 보이게 처리
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
