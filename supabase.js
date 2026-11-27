/* supabase.js — MoA 중앙 데이터 & 안전한 폴백 스토어 */
(function () {
  const SUPABASE_URL = 'https://your-project.supabase.co';
  const SUPABASE_ANON_KEY = 'your-anon-key';

  let sbClient = null;
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function' && !SUPABASE_URL.includes('your-project')) {
      sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.warn('Supabase 초기화 건너뜀 (로컬 폴백 모드 동작):', e);
  }

  const CONTENTS = [
    {
      id: 1,
      title: '모아 (MoA) — 배리어프리 시네마 시연작',
      platform: '모아',
      genre: 'MoA 오리지널 · 실시간 수어 시연',
      year: '2026',
      duration: '00:15 시연',
      isDemo: true,
      officialUrl: 'player.html?id=1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80',
      summary: '공식 OTT 스트리밍 위에 실시간 AI 수어 아바타를 PIP로 동기화하는 MoA 핵심 시연 영상입니다.',
      signGloss: '[수어] 지금 · 선택 · 변화 · 함께 보다',
      timeline: [
        { time: 0, dialogue: '“자막을 넘어, 표정과 손끝의 감정까지 하나의 화면으로 모아냅니다.”', gloss: '[수어] 자막 · 넘다 · 표정 · 손짓 · 감정 · 하나로 · 모으다', action: '오프닝 내레이션 통역' },
        { time: 5, dialogue: '“원하는 위치와 크기로 아바타를 옮겨 장면의 몰입을 방해하지 않습니다.”', gloss: '[수어] 원하다 · 위치 · 크기 · 조절 · 몰입 · 지키다', action: 'PIP 위치·투명도 안내' },
        { time: 10, dialogue: '“콘텐츠를 즐기는 방식은 달라도, 즐길 권리는 모두에게 있습니다.”', gloss: '[수어] 콘텐츠 · 방식 · 다르다 · 권리 · 모두 · 같다', action: '엔딩 메시지 통역' }
      ]
    },
    {
      id: 2,
      title: '폭싹 속았수다',
      platform: 'Netflix',
      genre: '드라마 · 로맨스 · 시대극',
      year: '2025',
      duration: '16부작',
      isDemo: false,
      officialUrl: 'https://www.netflix.com/kr/',
      poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      summary: '제주에서 태어난 요망진 반항아 애순이와 팔불출 무쇠 관식이의 모험 가득한 일생을 사계절로 풀어낸 작품.',
      signGloss: '[수어] 제주 · 계절 · 사랑 · 세월 · 함께 걷다'
    },
    {
      id: 3,
      title: '중증외상센터',
      platform: 'Netflix',
      genre: '메디컬 · 휴먼 · 액션',
      year: '2025',
      duration: '8부작',
      isDemo: false,
      officialUrl: 'https://www.netflix.com/kr/',
      poster: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      summary: '전장을 누비던 천재 외과 전문의 백강혁이 유명무실한 중증외상팀을 심폐 소생하기 위해 부임하면서 벌어지는 통쾌한 이야기.',
      signGloss: '[수어] 생명 · 골든타임 · 구하다 · 팀 · 다시 뛰다'
    },
    {
      id: 4,
      title: '오징어 게임 시즌 2',
      platform: 'Netflix',
      genre: '스릴러 · 서바이벌',
      year: '2024',
      duration: '7부작',
      isDemo: false,
      officialUrl: 'https://www.netflix.com/kr/',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      summary: '복수를 다짐하고 다시 돌아와 게임에 참가하는 기훈과 그를 맞이하는 프론트맨의 치열한 대결.',
      signGloss: '[수어] 선택 · 게임 · 다시 · 돌아오다 · 맞서다'
    },
    {
      id: 5,
      title: '선재 업고 튀어',
      platform: 'TVING',
      genre: '판타지 · 로맨스 · 청춘',
      year: '2024',
      duration: '16부작',
      isDemo: false,
      officialUrl: 'https://www.tving.com/',
      poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      summary: '삶의 의지를 놓아버린 순간 자신을 살게 해줬던 유명 아티스트 류선재를 살리기 위해 열성팬 임솔이 2008년으로 돌아가는 타임슬립 로맨스.',
      signGloss: '[수어] 시간 · 거슬러 · 너를 · 지키다 · 빛나다'
    },
    {
      id: 6,
      title: '눈물의 여왕',
      platform: 'TVING',
      genre: '로맨스 · 가족 · 드라마',
      year: '2024',
      duration: '16부작',
      isDemo: false,
      officialUrl: 'https://www.tving.com/',
      poster: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
      summary: '퀸즈 그룹 재벌 3세 홍해인과 용두리 이장 아들 백현우, 3년 차 부부의 아찔한 위기와 기적처럼 다시 시작되는 사랑 이야기.',
      signGloss: '[수어] 위기 · 진심 · 기억 · 다시 · 사랑하다'
    },
    {
      id: 7,
      title: '스터디그룹',
      platform: 'TVING',
      genre: '학원 · 액션 · 코미디',
      year: '2025',
      duration: '10부작',
      isDemo: false,
      officialUrl: 'https://www.tving.com/',
      poster: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      summary: '공부를 잘하고 싶지만 싸움에만 재능이 몰린 윤가민이 최악의 꼴통 학교에서 피 튀기는 입시에 뛰어들며 스터디그룹을 결성하는 이야기.',
      signGloss: '[수어] 공부 · 목표 · 친구 · 함께 · 돌파하다'
    },
    {
      id: 8,
      title: '약한영웅 Class 1',
      platform: 'Wavve',
      genre: '학원 · 액션 · 성장',
      year: '2022',
      duration: '8부작',
      isDemo: false,
      officialUrl: 'https://www.wavve.com/',
      poster: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      summary: '겉보기엔 연약해 보이는 상위 1% 모범생 연시은이 타고난 두뇌와 도구로 학교 안팎의 폭력에 맞서 나가는 액션 성장 드라마.',
      signGloss: '[수어] 지혜 · 용기 · 선을 넘지 마라 · 맞서다'
    },
    {
      id: 9,
      title: '모범택시 2',
      platform: 'Wavve',
      genre: '범죄 · 액션 · 복수',
      year: '2023',
      duration: '16부작',
      isDemo: false,
      officialUrl: 'https://www.wavve.com/',
      poster: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
      summary: '베일에 가려진 택시회사 무지개 운수와 택시기사 김도기가 억울한 피해자를 대신해 복수를 완성하는 사적 복수 대행극.',
      signGloss: '[수어] 정의 · 운행 시작 · 대신 · 갚아주다'
    },
    {
      id: 10,
      title: '열혈사제 2',
      platform: 'Wavve',
      genre: '코미디 · 범죄 · 액션',
      year: '2024',
      duration: '12부작',
      isDemo: false,
      officialUrl: 'https://www.wavve.com/',
      poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      summary: '낮에는 사제, 밤에는 벨라또의 역할을 위해 천사파 보스로 활약하는 분노 조절 장애 열혈 신부 김해일의 부산 공조 수사극.',
      signGloss: '[수어] 부산 · 공조 · 정의 · 끝까지 · 추적하다'
    },
    {
      id: 11,
      title: '무빙',
      platform: 'Disney+',
      genre: '초능력 · 액션 · 휴먼',
      year: '2023',
      duration: '20부작',
      isDemo: false,
      officialUrl: 'https://www.disneyplus.com/ko-kr',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      summary: '초능력을 숨긴 채 현재를 살아가는 아이들과 아픈 비밀을 감춘 채 과거를 살아온 부모들의 이야기를 그린 휴먼 액션 시리즈.',
      signGloss: '[수어] 하늘 · 날다 · 가족 · 비밀 · 지켜내다'
    },
    {
      id: 12,
      title: '조명가게',
      platform: 'Disney+',
      genre: '미스터리 · 휴먼 · 판타지',
      year: '2024',
      duration: '8부작',
      isDemo: false,
      officialUrl: 'https://www.disneyplus.com/ko-kr',
      poster: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
      summary: '어두운 골목 끝을 밝히는 유일한 곳 조명가게에 어딘가 수상한 비밀을 가진 손님들이 찾아오면서 벌어지는 이야기.',
      signGloss: '[수어] 어둠 · 빛 · 경계 · 기억 · 다시 만나다'
    },
    {
      id: 13,
      title: '트리거',
      platform: 'Disney+',
      genre: '오피스 · 스릴러 · 추적',
      year: '2025',
      duration: '12부작',
      isDemo: false,
      officialUrl: 'https://www.disneyplus.com/ko-kr',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      summary: '이 꽃 같은 세상, 나쁜 놈들의 잘못을 활짝 까발리기 위해 일단 카메라부터 들이대고 보는 지독한 탐사보도 프로들의 이야기.',
      signGloss: '[수어] 카메라 · 진실 · 추적 · 끝까지 · 밝히다'
    }
  ];

  const DEFAULT_POSTS = [
    {
      id: 101,
      category: '작품 추천 & 후기',
      author: '부산시청자_민수 (농인 시청자)',
      title: '모아 시연 영상 PIP 위치 조절 기능이 진짜 편하네요',
      body: '기존 수어 방송은 자막이랑 겹칠 때가 많았는데, 우측 상단이나 좌측 하단으로 아바타를 바로 옮길 수 있어서 영상 몰입이 훨씬 좋습니다.',
      likes: 24,
      createdAt: '방금 전'
    },
    {
      id: 102,
      category: '수어 표현 질문',
      author: '수어입문자_지은',
      title: '드라마 감정선이 빠른 장면에서 싱크 속도 몇 배속 쓰시나요?',
      body: '대사가 빠른 메디컬 드라마 볼 때 0.9x로 살짝 늦춰서 보면 손동작과 표정 연결이 훨씬 잘 들어오더라고요. 다른 분들 설정이 궁금합니다!',
      likes: 15,
      createdAt: '2시간 전'
    },
    {
      id: 103,
      category: '함께 수어 공부',
      author: '경성대_미디어팀',
      title: '주말 온라인 수어 & 배리어프리 영화 감상 모임 모집',
      body: '매주 토요일 저녁 MoA 추천작을 함께 보고 인상 깊었던 수어 표현을 정리하는 소모임을 운영하고 있습니다.',
      likes: 19,
      createdAt: '1일 전'
    }
  ];

  window.MOA_DATA = {
    client: sbClient,
    contents: CONTENTS,
    defaultPosts: DEFAULT_POSTS,
    getContents: async function () {
      return CONTENTS;
    },
    getContentById: async function (id) {
      const numId = Number(id) || 1;
      return CONTENTS.find((item) => item.id === numId) || CONTENTS[0];
    }
  };
})();
