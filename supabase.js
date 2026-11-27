// supabase.js — MoA 데이터 및 Supabase 연동 공통 모듈
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

window.moaSupabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  window.moaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 시연용 샘플 콘텐츠 데이터 (실제 운영 데이터와 구분 표기)
window.MOA_SAMPLE_CONTENTS = [
  {
    id: 1,
    title: '하이쿠키 (High Cookie)',
    platform: 'Netflix',
    genre: '판타지 · 스릴러',
    year: '2023',
    duration: '시연용 샘플 트랙',
    summary: '한 입 베어 물면 욕망을 이루어주는 의문의 수제 쿠키가 엘리트 고등학교를 집어삼키면서 벌어지는 이야기.',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“지금 이 쿠키를 한 입 베어 무는 순간, 모든 게 달라질 거야.”',
    sign_gloss: '[수어] 지금 · 쿠키 · 먹다 · 순간 · 전부 · 변하다',
    is_sample: true
  },
  {
    id: 2,
    title: '환승연애 3',
    platform: 'TVING',
    genre: '리얼리티 · 로맨스',
    year: '2024',
    duration: '시연용 샘플 트랙',
    summary: '다양한 이유로 이별한 커플들이 한 집에 모여 지나간 연애를 되짚고 새로운 인연을 마주하는 연애 리얼리티.',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“네가 오늘 다른 사람에게 속마음 문자를 보낼 줄은 몰랐어.”',
    sign_gloss: '[수어] 너 · 오늘 · 다른 사람 · 문자 · 보내다 · 몰랐다',
    is_sample: true
  },
  {
    id: 3,
    title: '약한영웅 Class 1',
    platform: 'Wavve',
    genre: '액션 · 학원 드라마',
    year: '2022',
    duration: '시연용 샘플 트랙',
    summary: '겉보기엔 연약해 보이는 상위 1% 모범생 연시은이 타고난 두뇌와 도구로 학교 안팎의 폭력에 맞서는 성장 액션.',
    ott_url: 'https://www.wavve.com',
    thumb_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“부탁인데, 선 넘지 마. 경고는 한 번뿐이야.”',
    sign_gloss: '[수어] 부탁 · 선 · 넘지마 · 경고 · 한 번 · 끝',
    is_sample: true
  },
  {
    id: 4,
    title: '무빙 (Moving)',
    platform: 'Disney+',
    genre: 'SF · 휴먼 액션',
    year: '2023',
    duration: '시연용 샘플 트랙',
    summary: '초능력을 숨긴 채 현재를 살아가는 아이들과 아픈 비밀을 감춘 채 과거를 살아온 부모들의 휴먼 액션 시리즈.',
    ott_url: 'https://www.disneyplus.com',
    thumb_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“능력이 중요한 게 아니야. 누굴 지키느냐가 중요한 거지.”',
    sign_gloss: '[수어] 능력 · 중요 아니다 · 누구 · 지키다 · 중요하다',
    is_sample: true
  },
  {
    id: 5,
    title: '더 글로리 (The Glory)',
    platform: 'Netflix',
    genre: '드라마 · 서스펜스',
    year: '2022',
    duration: '시연용 샘플 트랙',
    summary: '유년 시절 폭력으로 영혼까지 부서진 한 여자가 온 생을 걸어 치밀하게 준비한 처절한 복수를 그려낸 시리즈.',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“멋지다 연진아, 네가 닿고 싶던 그 자리에서 기다릴게.”',
    sign_gloss: '[수어] 멋지다 · 연진 · 너 · 원하다 · 자리 · 기다리다',
    is_sample: true
  },
  {
    id: 6,
    title: '선재 업고 튀어',
    platform: 'TVING',
    genre: '로맨스 · 타임슬립',
    year: '2024',
    duration: '시연용 샘플 트랙',
    summary: '삶의 의지를 놓아버린 순간 자신을 살게 해줬던 유명 아티스트 류선재를 살리기 위해 열성팬 임솔이 과거로 돌아가는 이야기.',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80',
    sample_dialogue: '“오늘은 꼭 살아있어 줘. 살아있어 줘서 정말 고마워.”',
    sign_gloss: '[수어] 오늘 · 꼭 · 살다 · 있다 · 정말 · 고맙다',
    is_sample: true
  }
];

async function fetchMoAContents() {
  if (!window.moaSupabase) {
    return { data: window.MOA_SAMPLE_CONTENTS, connected: false };
  }
  try {
    const { data, error } = await window.moaSupabase.from('contents').select('*').order('id');
    if (!error && data && data.length > 0) {
      const merged = data.map((row, i) => ({
        ...window.MOA_SAMPLE_CONTENTS[i % window.MOA_SAMPLE_CONTENTS.length],
        ...row,
        is_sample: false
      }));
      return { data: merged, connected: true };
    }
  } catch (err) {
    console.warn('Supabase 조회 실패, 시연용 데이터 사용:', err);
  }
  return { data: window.MOA_SAMPLE_CONTENTS, connected: false };
}

async function fetchPipSettings() {
  const local = localStorage.getItem('moa_pip_prefs');
  const fallback = local ? JSON.parse(local) : { enabled: true, scale: 100, position: 'bottom-right', speed: 1.0 };

  if (!window.moaSupabase) return fallback;
  try {
    const { data } = await window.moaSupabase.from('pip_settings').select('*').eq('id', 1).single();
    if (data) {
      return { ...fallback, scale: data.scale, speed: Number(data.speed) };
    }
  } catch (e) {}
  return fallback;
}

async function savePipSettings(prefs) {
  localStorage.setItem('moa_pip_prefs', JSON.stringify(prefs));
  if (!window.moaSupabase) return { mode: 'local' };

  try {
    const { error } = await window.moaSupabase.from('pip_settings').upsert({
      id: 1,
      scale: prefs.scale,
      opacity: 95,
      speed: prefs.speed
    });
    return { mode: error ? 'local' : 'cloud' };
  } catch (e) {
    return { mode: 'local' };
  }
}
