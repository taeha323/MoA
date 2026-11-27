// supabase.js — MoA 데이터(모아 시연작 1편 + 4대 OTT 12편), 커뮤니티 및 Supabase 연동 공통 모듈
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

window.moaSupabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  window.moaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

window.MOA_SAMPLE_CONTENTS = [
  {
    id: 1,
    title: '모아 (MoA) — 배리어프리 시네마 시연작',
    platform: '모아',
    isDemo: true,
    genre: 'MoA 오리지널 · 실시간 수어 시연',
    year: '2026',
    summary: '공식 스트리밍 영상 위에 AI 수어 아바타를 비파괴 PIP로 동기화하여 대사의 감정과 호흡까지 전달하는 MoA 공식 시연 영상입니다.',
    ott_url: 'player.html?id=1',
    // ★ 추후 GitHub 루트에 직접 편집한 시연 영상 파일을 올리면 './moa_demo.mp4' 로 경로만 변경하면 됩니다.
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“자막을 넘어, 표정과 손끝의 감정까지 하나의 화면으로 모아냅니다.”',
    sign_gloss: '[수어] 자막 · 넘다 · 표정 · 손짓 · 감정 · 하나로 · 모으다'
  },
  {
    id: 2,
    title: '하이쿠키 (High Cookie)',
    platform: 'Netflix',
    isDemo: false,
    genre: '판타지 · 스릴러',
    year: '2023',
    summary: '한 입 베어 물면 욕망을 이루어주는 의문의 수제 쿠키가 엘리트 고등학교를 집어삼키면서 벌어지는 이야기.',
    ott_url: 'https://www.netflix.com',
    thumb_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“지금 이 쿠키를 한 입 베어 무는 순간, 모든 게 달라질 거야.”',
    sign_gloss: '[수어] 지금 · 쿠키 · 먹다 · 순간 · 전부 · 변하다'
  },
  {
    id: 3,
    title: '무빙 (Moving)',
    platform: 'Disney+',
    isDemo: false,
    genre: 'SF · 휴먼 액션',
    year: '2023',
    summary: '초능력을 숨긴 채 현재를 살아가는 아이들과 아픈 비밀을 감춘 채 과거를 살아온 부모들의 휴먼 액션 시리즈.',
    ott_url: 'https://www.disneyplus.com',
    thumb_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“능력이 중요한 게 아니야. 누굴 지키느냐가 중요한 거지.”',
    sign_gloss: '[수어] 능력 · 중요 아니다 · 누구 · 지키다 · 중요하다'
  },
  {
    id: 4,
    title: '선재 업고 튀어',
    platform: 'TVING',
    isDemo: false,
    genre: '로맨스 · 타임슬립',
    year: '2024',
    summary: '삶의 의지를 놓아버린 순간 자신을 살게 해줬던 아티스트 류선재를 살리기 위해 열성팬 임솔이 과거로 돌아가는 이야기.',
    ott_url: 'https://www.tving.com',
    thumb_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1100&q=80',
    sample_dialogue: '“오늘은 꼭 살아있어 줘. 살아있어 줘서 정말 고마워.”',
    sign_gloss: '[수어] 오늘 · 꼭 · 살다 · 있다 · 정말 · 고맙다'
  },
  {
    id: 5,
    title: '환승연애 3',
    platform: 'TVING',
    isDemo: false,
