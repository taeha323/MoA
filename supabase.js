// supabase.js — MoA 데이터, 학습 단어장, 커뮤니티 및 Supabase 연동 모듈
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

window.moaSupabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  window.moaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

window.MOA_SAMPLE_CONTENTS = [
  {
    id: 1,
    title: '하이쿠키 (High Cookie)',
    platform: 'Netflix',
    genre: '판타지 · 스릴러',
    year: '2023',
    summary: '한 입 베어 물면 욕망을 이루어주는 의문의 수제 쿠키가 엘리트 고등학교를 집어삼키면서 벌어지는 이야기.',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“지금 이 쿠키를 한 입 베어 무는 순간, 모든 게 달라질 거야.”',
    sign_gloss: '[수어] 지금 · 쿠키 · 먹다 · 순간 · 전부 · 변하다',
    vocab: [
      { word: '지금 (현재)', hand: '양손 손바닥을 아래로 향하고 가슴 앞에서 살짝 내립니다.', level: '기초' },
      { word: '변하다 (달라지다)', hand: '양손을 엇갈려 뒤집으며 상태의 전환을 표현합니다.', level: '기초' },
      { word: '위험 / 선택', hand: '고개를 살짝 숙이며 눈썹을 모으는 비수지 표정을 함께 씁니다.', level: '표정 응용' }
    ]
  },
  {
    id: 2,
    title: '무빙 (Moving)',
    platform: 'Disney+',
    genre: 'SF · 휴먼 액션',
    year: '2023',
    summary: '초능력을 숨긴 채 현재를 살아가는 아이들과 아픈 비밀을 감춘 채 과거를 살아온 부모들의 휴먼 액션 시리즈.',
    ott_url: 'https://www.disneyplus.com',
    thumb_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“능력이 중요한 게 아니야. 누굴 지키느냐가 중요한 거지.”',
    sign_gloss: '[수어] 능력 · 중요 아니다 · 누구 · 지키다 · 중요하다',
    vocab: [
      { word: '지키다 (보호하다)', hand: '왼팔을 감싸 안듯 굽히고 오른손으로 위를 덮어 보호하는 동작입니다.', level: '기초' },
      { word: '중요하다', hand: '오른손 엄지와 검지를 맞대고 가슴 앞에서 힘주어 내립니다.', level: '기초' },
      { word: '~이 아니다 (부정)', hand: '손바닥을 정면으로 향한 채 좌우로 흔들며 고개를 젓습니다.', level: '문법' }
    ]
  },
  {
    id: 3,
    title: '선재 업고 튀어',
    platform: 'TVING',
    genre: '로맨스 · 타임슬립',
    year: '2024',
    summary: '삶의 의지를 놓아버린 순간 자신을 살게 해줬던 아티스트 류선재를 살리기 위해 열성팬 임솔이 과거로 돌아가는 이야기.',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“오늘은 꼭 살아있어 줘. 살아있어 줘서 정말 고마워.”',
    sign_gloss: '[수어] 오늘 · 꼭 · 살다 · 있다 · 정말 · 고맙다',
    vocab: [
      { word: '고맙다 (감사하다)', hand: '왼손 등 위를 오른손 날로 두 번 가볍게 두드립니다.', level: '필수 인사' },
      { word: '살다 (생명)', hand: '양손을 가슴에서 위로 부드럽게 들어 올리며 호흡을 표현합니다.', level: '기초' },
      { word: '오늘', hand: '양손 검지를 펴서 몸 앞쪽으로 나란히 내립니다.', level: '기초' }
    ]
  },
  {
    id: 4,
    title: '환승연애 3',
    platform: 'TVING',
    genre: '리얼리티 · 로맨스',
    year: '2024',
    summary: '다양한 이유로 이별한 커플들이 한 집에 모여 지나간 연애를 되짚고 새로운 인연을 마주하는 연애 리얼리티.',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“네가 오늘 다른 사람에게 속마음 문자를 보낼 줄은 몰랐어.”',
    sign_gloss: '[수어] 너 · 오늘 · 다른 사람 · 문자 · 보내다 · 몰랐다',
    vocab: [
      { word: '문자 / 메시지', hand: '왼손바닥 위에 오른손 엄지로 입력하는 시늉을 한 뒤 앞으로 보냅니다.', level: '일상' },
      { word: '모르다', hand: '오른손 끝을 가슴에 댔다가 바깥쪽으로 털어내듯 폅니다.', level: '기초' }
    ]
  },
  {
    id: 5,
    title: '약한영웅 Class 1',
    platform: 'Wavve',
    genre: '액션 · 학원 드라마',
    year: '2022',
    summary: '겉보기엔 연약해 보이는 상위 1% 모범생 연시은이 타고난 두뇌와 도구로 학교 안팎의 폭력에 맞서는 성장 액션.',
    ott_url: 'https://www.wavve.com',
    thumb_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“부탁인데, 선 넘지 마. 경고는 한 번뿐이야.”',
    sign_gloss: '[수어] 부탁 · 선 · 넘지마 · 경고 · 한 번 · 끝',
    vocab: [
      { word: '부탁하다', hand: '양손바닥을 마주 대고 정중히 앞으로 내밉니다.', level: '필수' },
      { word: '한 번', hand: '오른손 검지 하나를 세워 짧게 아래로 찍습니다.', level: '숫자' }
    ]
  },
  {
    id: 6,
    title: '더 글로리 (The Glory)',
    platform: 'Netflix',
    genre: '드라마 · 서스펜스',
    year: '2022',
    summary: '유년 시절 폭력으로 영혼까지 부서진 한 여자가 온 생을 걸어 치밀하게 준비한 처절한 복수를 그려낸 시리즈.',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“멋지다 연진아, 네가 닿고 싶던 그 자리에서 기다릴게.”',
    sign_gloss: '[수어] 멋지다 · 연진 · 너 · 원하다 · 자리 · 기다리다',
    vocab: [
      { word: '기다리다', hand: '오른손 턱 밑에 받치고 시선을 고정하며 기다리는 표정을 짓습니다.', level: '일상' },
      { word: '원하다 (바라다)', hand: '양손을 가슴 쪽으로 끌어당기며 간절함을 표현합니다.', level: '기초' }
    ]
  }
];

window.MOA_DEFAULT_POSTS = [
  {
    id: 101,
    category: '수어 표현 질문',
    author: '수어입문자_지민 (학습자)',
    title: '드라마 속 반어법이나 차가운 말투는 수어에서 어떻게 표현되나요?',
    body: '더 글로리 수어 PIP로 보다가 아바타 표정이랑 손동작 속도가 확 달라지는 게 신기해서 질문 남깁니다! 비수지 신호라는 게 표정 변화도 포함되는 건가요?',
    likes: 14,
    date: '방금 전'
  },
  {
    id: 102,
    category: '작품 추천 & 후기',
    author: '영화보는농인_현우 (농인 시청자)',
    title: '무빙 감정선 장면에서 아바타 PIP 크기를 115%로 키우니까 훨씬 잘 보입니다',
    body: '기존 방송 수어는 화면 구석에 너무 작게 고정되어 있어서 눈이 피로했는데, 우측 하단에서 크기 조절하고 자막이랑 안 겹치게 둘 수 있어서 편하네요.',
    likes: 23,
    date: '2시간 전'
  },
  {
    id: 103,
    category: '함께 수어 공부',
    author: '부산미디어_태하 (학습자)',
    title: '이번 주 주말 OTT 대사 5문장 수어 쉐도잉 같이 하실 분 구합니다',
    body: '플레이어 학습 모드에서 0.8x 배속으로 틀어놓고 손동작 따라 해보니 훨씬 외우기 쉽네요. 기초 단어부터 같이 연습하실 분 댓글 남겨주세요!',
    likes: 9,
    date: '어제'
  }
];

async function fetchMoAContents() {
  if (!window.moaSupabase) return window.MOA_SAMPLE_CONTENTS;
  try {
    const { data, error } = await window.moaSupabase.from('contents').select('*').order('id');
    if (!error && data && data.length > 0) {
      return data.map((row, i) => ({
        ...window.MOA_SAMPLE_CONTENTS[i % window.MOA_SAMPLE_CONTENTS.length],
        ...row
      }));
    }
  } catch (e) {}
  return window.MOA_SAMPLE_CONTENTS;
}

async function fetchPipSettings() {
  const local = localStorage.getItem('moa_pip_prefs');
  const fallback = local ? JSON.parse(local) : { enabled: true, scale: 100, position: 'bottom-right', speed: 1.0 };
  if (!window.moaSupabase) return fallback;
  try {
    const { data } = await window.moaSupabase.from('pip_settings').select('*').eq('id', 1).single();
    if (data) return { ...fallback, scale: data.scale, speed: Number(data.speed) };
  } catch (e) {}
  return fallback;
}

async function savePipSettings(prefs) {
  localStorage.setItem('moa_pip_prefs', JSON.stringify(prefs));
  if (!window.moaSupabase) return { mode: 'local' };
  try {
    const { error } = await window.moaSupabase.from('pip_settings').upsert({
      id: 1, scale: prefs.scale, opacity: 95, speed: prefs.speed
    });
    return { mode: error ? 'local' : 'cloud' };
  } catch (e) {
    return { mode: 'local' };
  }
}
