// ========================================================
// [기입 위치] Supabase 프로젝트 URL과 Anon Key 입력
// ========================================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ========================================================
// 기본 샘플 데이터 ('하이쿠키' 포함)
// ========================================================
let contentsData = [
  {
    id: 1,
    title: '하이쿠키 (High Cookie)',
    platform: 'Netflix',
    genre: '판타지/스릴러 · 전 회차 AI 수어 렌더링 완료',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: '환승연애 3',
    platform: 'TVING',
    genre: '예능 · 다중 화자 분리 수어 지원',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: '약한영웅 Class 1',
    platform: 'Wavve',
    genre: '액션/학원 · 빠른 대사 싱크 최적화',
    ott_url: 'https://www.wavve.com',
    thumb_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: '무빙 (Moving)',
    platform: 'Disney+',
    genre: 'SF/액션 · AI 3D 아바타 감정 표현 적용',
    ott_url: 'https://www.disneyplus.com',
    thumb_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80'
  }
];

let pipSettings = { scale: 100, opacity: 90, speed: 1.0 };
let currentActiveTitle = '대기중';

// ========================================================
// UI 렌더링 및 PIP 창 실행 로직
// ========================================================
const contentGrid = document.getElementById('content-grid');
const pipWindow = document.getElementById('pip-window');
const scaleSlider = document.getElementById('scale-slider');
const opacitySlider = document.getElementById('opacity-slider');
const speedSlider = document.getElementById('speed-slider');

function renderCards(platformFilter = 'ALL') {
  contentGrid.innerHTML = '';
  const filtered = platformFilter === 'ALL'
    ? contentsData
    : contentsData.filter(item => item.platform === platformFilter);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-thumb">
        <img src="${item.thumb_url}" alt="${item.title}" />
        <span class="ott-badge ott-${item.platform}">${item.platform}</span>
        <span class="sign-tag">AI 수어 지원</span>
      </div>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">${item.genre}</div>
        <button class="btn-watch" data-id="${item.id}">
          ${item.platform}에서 시청 + 모아 PIP 실행 ↗
        </button>
      </div>
    `;
    card.querySelector('.btn-watch').addEventListener('click', () => launchContentWithPIP(item));
    contentGrid.appendChild(card);
  });
}

async function launchContentWithPIP(item) {
  currentActiveTitle = item.title;
  document.getElementById('pip-now-playing').textContent = item.title;
  document.getElementById('sign-caption').textContent = `[${item.platform}] 실시간 수어 통역 중...`;

  window.open(item.ott_url, '_blank');
  await openFloatingPIPWindow(item.title);
}

async function openFloatingPIPWindow(title = currentActiveTitle) {
  if ('documentPictureInPicture' in window) {
    try {
      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: 260,
        height: 240
      });
      const clone = pipWindow.cloneNode(true);
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.borderRadius = '0';

      [...document.styleSheets].forEach(sheet => {
        try {
          const styleEl = pipWin.document.createElement('style');
          styleEl.textContent = [...sheet.cssRules].map(r => r.cssText).join('');
          pipWin.document.head.appendChild(styleEl);
        } catch (e) {}
      });

      pipWin.document.body.style.margin = '0';
      pipWin.document.body.style.background = '#0b0e14';
      pipWin.document.body.appendChild(clone);
      return;
    } catch (err) {
      console.log('독립 PIP 창 권한 대기 또는 취소:', err);
    }
  }
  showToast(`'${title}' 수어 PIP 모드가 우측 패널에서 활성화되었습니다.`);
}

document.getElementById('open-pip-btn').addEventListener('click', () => openFloatingPIPWindow());

function applySettings() {
  document.getElementById('scale-val').textContent = `${pipSettings.scale}%`;
  document.getElementById('opacity-val').textContent = `${pipSettings.opacity}%`;
  document.getElementById('speed-val').textContent = `${Number(pipSettings.speed).toFixed(1)}x`;
  document.getElementById('pip-speed-badge').textContent = `${Number(pipSettings.speed).toFixed(1)}x`;

  pipWindow.style.transform = `scale(${pipSettings.scale / 100})`;
  pipWindow.style.backgroundColor = `rgba(23, 30, 46, ${pipSettings.opacity / 100})`;

  const dur = (1.1 / pipSettings.speed).toFixed(2);
  document.querySelectorAll('.arm').forEach(arm => arm.style.animationDuration = `${dur}s`);
}

scaleSlider.addEventListener('input', e => { pipSettings.scale = Number(e.target.value); applySettings(); });
opacitySlider.addEventListener('input', e => { pipSettings.opacity = Number(e.target.value); applySettings(); });
speedSlider.addEventListener('input', e => { pipSettings.speed = Number(e.target.value); applySettings(); });

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCards(tab.dataset.platform);
  });
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  setTimeout(() => { toast.textContent = ''; }, 3000);
}

// ========================================================
// Supabase DB 연동
// ========================================================
async function initSupabase() {
  const statusDot = document.getElementById('db-status');
  const statusText = document.getElementById('db-status-text');

  if (!supabaseClient) {
    statusText.textContent = '로컬 데모 모드 (키 미입력)';
    renderCards();
    applySettings();
    return;
  }

  const { data: dbContents, error: contentErr } = await supabaseClient
    .from('contents')
    .select('*')
    .order('id', { ascending: true });

  if (!contentErr && dbContents && dbContents.length > 0) {
    contentsData = dbContents;
  }

  const { data: dbSettings, error: setErr } = await supabaseClient
    .from('pip_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (!setErr && dbSettings) {
    pipSettings = {
      scale: dbSettings.scale,
      opacity: dbSettings.opacity,
      speed: dbSettings.speed
    };
    scaleSlider.value = pipSettings.scale;
    opacitySlider.value = pipSettings.opacity;
    speedSlider.value = pipSettings.speed;

    statusDot.classList.remove('offline');
    statusDot.classList.add('online');
    statusText.textContent = 'Supabase 실시간 연동됨';
  }

  renderCards();
  applySettings();
}

document.getElementById('save-settings-btn').addEventListener('click', async () => {
  if (!supabaseClient) {
    showToast('app.js에 Supabase URL과 Key를 입력하면 DB에 저장됩니다!');
    return;
  }
  const { error } = await supabaseClient
    .from('pip_settings')
    .upsert({ id: 1, ...pipSettings });

  if (!error) showToast('✓ 내 PIP 설정이 Supabase DB에 저장되었습니다!');
});

initSupabase();
