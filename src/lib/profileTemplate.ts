export interface ProfileQuestion {
  id: string;
  question: string;
  type: 'text' | 'date' | 'textarea' | 'select' | 'tags';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const profileQuestions: ProfileQuestion[] = [
  {
    id: 'birthdate',
    question: '생년월일',
    type: 'date',
    required: true,
  },
  {
    id: 'nickname',
    question: '별명',
    type: 'text',
    placeholder: '가족들이 부르는 별명을 입력하세요',
  },
  {
    id: 'favorite_food',
    question: '좋아하는 음식',
    type: 'text',
    placeholder: '예: 짜장면, 피자, 치킨',
  },
  {
    id: 'favorite_music',
    question: '좋아하는 음악/가수',
    type: 'text',
    placeholder: '예: 발라드, BTS, 아이유',
  },
  {
    id: 'best_friend',
    question: '가장 친한 친구',
    type: 'text',
    placeholder: '친한 친구의 이름을 입력하세요',
  },
  {
    id: 'hobby',
    question: '취미',
    type: 'tags',
    placeholder: '취미를 입력 후 Enter를 눌러주세요',
  },
  {
    id: 'favorite_movie',
    question: '좋아하는 영화',
    type: 'text',
    placeholder: '예: 어벤져스, 타이타닉, 극한직업',
  },
  {
    id: 'favorite_color',
    question: '좋아하는 색깔',
    type: 'select',
    options: ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '검정', '흰색', '회색', '갈색'],
  },
  {
    id: 'dream',
    question: '꿈/목표',
    type: 'textarea',
    placeholder: '미래의 꿈이나 현재 목표를 자유롭게 작성해주세요',
  },
  {
    id: 'favorite_subject',
    question: '좋아하는 과목/분야',
    type: 'text',
    placeholder: '예: 수학, 체육, 요리, 컴퓨터',
  },
  {
    id: 'hate_food',
    question: '싫어하는 음식',
    type: 'text',
    placeholder: '예: 양파, 당근, 피망',
  },
  {
    id: 'personality',
    question: '성격',
    type: 'tags',
    placeholder: '본인의 성격을 입력 후 Enter를 눌러주세요',
  },
  {
    id: 'favorite_season',
    question: '좋아하는 계절',
    type: 'select',
    options: ['봄', '여름', '가을', '겨울'],
  },
  {
    id: 'special_skill',
    question: '특기',
    type: 'text',
    placeholder: '예: 피아노, 축구, 그림 그리기, 요리',
  },
  {
    id: 'favorite_place',
    question: '좋아하는 장소',
    type: 'text',
    placeholder: '예: 집, 도서관, 바다, 산',
  },
  {
    id: 'bucket_list',
    question: '버킷리스트',
    type: 'textarea',
    placeholder: '꼭 해보고 싶은 것들을 자유롭게 작성해주세요',
  },
  {
    id: 'email',
    question: '이메일',
    type: 'text',
    placeholder: '예: example@email.com',
  },
  {
    id: 'sns',
    question: 'SNS 계정',
    type: 'tags',
    placeholder: 'SNS 계정을 입력 후 Enter를 눌러주세요\n예: 페이스북: @myaccount, 인스타그램: @myid',
  },
  {
    id: 'education',
    question: '학력',
    type: 'textarea',
    placeholder: '학교명, 전공, 졸업년도 등을 자유롭게 작성해주세요\n예: 서울대학교 경영학과 졸업 (1998년)',
  },
];

export interface ProfileAnswer {
  questionId: string;
  answer: string | string[];
}

export interface UserProfile {
  userId: string;
  answers: ProfileAnswer[];
  updatedAt: string;
}

export const getDefaultAnswers = (): ProfileAnswer[] => {
  return profileQuestions.map(q => ({
    questionId: q.id,
    answer: q.type === 'tags' ? [] : '',
  }));
};

export const findAnswerByQuestionId = (answers: ProfileAnswer[], questionId: string): ProfileAnswer | undefined => {
  return answers.find(answer => answer.questionId === questionId);
};