/**
 * 무운(MUUN) 사주 브랜드 컬러 팔레트
 * 전통적이면서도 현대적인 감각의 색상 조합
 */

export const MUUN_COLOR_PALETTE = [
  // 프라이머리 컬러 (전통 + 현대)
  {
    name: "Deep Gold",
    value: "#C9A961",
    description: "전통적인 금색, 고급스러움",
  },
  {
    name: "Midnight Blue",
    value: "#1a237e",
    description: "신비로운 밤하늘, 깊이감",
  },
  {
    name: "Sage Green",
    value: "#6b8e23",
    description: "자연의 평온함, 조화",
  },

  // 세컨더리 컬러 (강조)
  {
    name: "Rose Red",
    value: "#c41e3a",
    description: "에너지, 열정",
  },
  {
    name: "Coral",
    value: "#ff6b6b",
    description: "따뜻함, 친근함",
  },
  {
    name: "Purple",
    value: "#7c3aed",
    description: "신비로움, 영성",
  },

  // 뉴트럴 컬러
  {
    name: "Charcoal",
    value: "#2d3748",
    description: "기본 텍스트, 안정감",
  },
  {
    name: "Gray",
    value: "#718096",
    description: "보조 텍스트",
  },
  {
    name: "Light Gray",
    value: "#e2e8f0",
    description: "배경, 구분선",
  },

  // 악센트 컬러
  {
    name: "Amber",
    value: "#f59e0b",
    description: "주의, 강조",
  },
  {
    name: "Teal",
    value: "#14b8a6",
    description: "신선함, 성공",
  },
  {
    name: "Indigo",
    value: "#4f46e5",
    description: "신뢰, 안정성",
  },
];

/**
 * 색상 팔레트를 드롭다운용 배열로 변환
 */
export const getColorOptions = () => {
  return MUUN_COLOR_PALETTE.map((color) => ({
    label: color.name,
    value: color.value,
    description: color.description,
  }));
};

/**
 * 색상 이름으로 색상값 조회
 */
export const getColorByName = (name: string) => {
  return MUUN_COLOR_PALETTE.find((color) => color.name === name);
};

/**
 * 색상값으로 색상 이름 조회
 */
export const getColorNameByValue = (value: string) => {
  return MUUN_COLOR_PALETTE.find((color) => color.value === value)?.name;
};

/**
 * 추천 색상 조합 (칼럼 작성 시 참고)
 */
export const RECOMMENDED_COLOR_COMBINATIONS = [
  {
    name: "전통적 우아함",
    colors: ["Deep Gold", "Charcoal", "Light Gray"],
    description: "고급스럽고 전문적인 느낌",
  },
  {
    name: "신비로운 영성",
    colors: ["Midnight Blue", "Purple", "Coral"],
    description: "신비로우면서도 따뜻한 느낌",
  },
  {
    name: "자연의 조화",
    colors: ["Sage Green", "Charcoal", "Amber"],
    description: "평온하면서도 활기찬 느낌",
  },
  {
    name: "현대적 세련됨",
    colors: ["Indigo", "Teal", "Gray"],
    description: "현대적이고 깔끔한 느낌",
  },
];
