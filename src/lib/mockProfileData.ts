import { UserProfile, ProfileAnswer } from './profileTemplate';

export const mockProfileData: UserProfile[] = [
  // 아빠 프로필
  {
    userId: '1',
    answers: [
      { questionId: 'birthdate', answer: '1980-05-15' },
      { questionId: 'nickname', answer: '아빠곰' },
      { questionId: 'favorite_food', answer: '삼겹살, 냉면' },
      { questionId: 'favorite_music', answer: '송창식, 김광석' },
      { questionId: 'best_friend', answer: '대학동기 민수' },
      { questionId: 'hobby', answer: ['독서', '낚시', '영화감상'] },
      { questionId: 'favorite_movie', answer: '쇼생크 탈출' },
      { questionId: 'favorite_color', answer: '파랑' },
      { questionId: 'dream', answer: '가족과 함께 건강하게 살아가면서 아이들이 꿈을 이룰 수 있도록 뒷받침해주는 것' },
      { questionId: 'favorite_subject', answer: '역사, 경제' },
      { questionId: 'hate_food', answer: '매운 음식' },
      { questionId: 'personality', answer: ['차분함', '신중함', '따뜻함'] },
      { questionId: 'favorite_season', answer: '가을' },
      { questionId: 'special_skill', answer: '요리, 수영' },
      { questionId: 'favorite_place', answer: '바닷가' },
      { questionId: 'bucket_list', answer: '가족과 함께 세계여행하기\n제주도에 작은 펜션 운영하기\n손자 손녀와 함께 시간 보내기' },
      { questionId: 'email', answer: 'dad@example.com' },
      { questionId: 'sns', answer: ['페이스북: @dad_bear', '카카오스토리: @father_kim'] },
      { questionId: 'education', answer: '서울대학교 졸업\n연세대학교원 졸업' },
    ],
    updatedAt: '2025-09-01T10:00:00Z',
  },
  // 장남 프로필
  {
    userId: '2',
    answers: [
      { questionId: 'birthdate', answer: '2010-03-22' },
      { questionId: 'nickname', answer: '축구왕' },
      { questionId: 'favorite_food', answer: '치킨, 피자' },
      { questionId: 'favorite_music', answer: 'BTS, NewJeans' },
      { questionId: 'best_friend', answer: '민준이' },
      { questionId: 'hobby', answer: ['축구', '게임', '피아노'] },
      { questionId: 'favorite_movie', answer: '어벤져스' },
      { questionId: 'favorite_color', answer: '초록' },
      { questionId: 'dream', answer: '프로 축구선수가 되어서 월드컵에 나가고 싶어요!' },
      { questionId: 'favorite_subject', answer: '체육, 수학' },
      { questionId: 'hate_food', answer: '당근, 양파' },
      { questionId: 'personality', answer: ['활발함', '리더십', '친화적'] },
      { questionId: 'favorite_season', answer: '봄' },
      { questionId: 'special_skill', answer: '축구, 피아노' },
      { questionId: 'favorite_place', answer: '축구장' },
      { questionId: 'bucket_list', answer: '프로축구선수 되기\n유럽 축구 구경하기\n가족과 함께 캠핑하기' },
      { questionId: 'email', answer: 'soccer_king@email.com' },
      { questionId: 'sns', answer: ['유튜브: @soccer_king_14', '인스타그램: @futbol_boy'] },
      { questionId: 'education', answer: '서울초등학교 재학중\n영형초등학교 졸업' },
    ],
    updatedAt: '2025-09-02T14:30:00Z',
  },
  // 막둥이 프로필
  {
    userId: '3',
    answers: [
      { questionId: 'birthdate', answer: '2013-11-08' },
      { questionId: 'nickname', answer: '책벌레' },
      { questionId: 'favorite_food', answer: '짜장면, 딸기' },
      { questionId: 'favorite_music', answer: 'IU, 동요' },
      { questionId: 'best_friend', answer: '서연이' },
      { questionId: 'hobby', answer: ['독서', '그림그리기', '만들기'] },
      { questionId: 'favorite_movie', answer: '겨울왕국' },
      { questionId: 'favorite_color', answer: '분홍' },
      { questionId: 'dream', answer: '그림책 작가가 되어서 재미있는 이야기를 만들고 싶어요' },
      { questionId: 'favorite_subject', answer: '국어, 미술' },
      { questionId: 'hate_food', answer: '피망, 버섯' },
      { questionId: 'personality', answer: ['상상력풍부', '섬세함', '호기심많음'] },
      { questionId: 'favorite_season', answer: '겨울' },
      { questionId: 'special_skill', answer: '그림 그리기, 이야기 만들기' },
      { questionId: 'favorite_place', answer: '도서관' },
      { questionId: 'bucket_list', answer: '그림책 작가 되기\n파리 여행하기\n강아지 키우기' },
      { questionId: 'email', answer: 'bookworm@email.com' },
      { questionId: 'sns', answer: ['인스타그램: @little_artist', '유튜브: @story_dreamer'] },
      { questionId: 'education', answer: '효명초등학교 재학중\n영재유치원 졸업' },
    ],
    updatedAt: '2025-09-02T16:45:00Z',
  },
];

export const getProfileByUserId = (userId: string): UserProfile | undefined => {
  return mockProfileData.find(profile => profile.userId === userId);
};

export const updateProfileData = (userId: string, answers: ProfileAnswer[]): void => {
  const profileIndex = mockProfileData.findIndex(profile => profile.userId === userId);
  
  if (profileIndex >= 0) {
    mockProfileData[profileIndex] = {
      userId,
      answers,
      updatedAt: new Date().toISOString(),
    };
  } else {
    mockProfileData.push({
      userId,
      answers,
      updatedAt: new Date().toISOString(),
    });
  }
};