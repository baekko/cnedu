// 화면, 난이도, 상어와 카드 설정을 이 파일에서 조정합니다.
export const GAME = Object.freeze({
  width: 390, height: 844, duration: 50, health: 3, flashes: 3,
  sharkSpawnRate: .8, speed: 180, hitRadius: 34.5, submarineScale: 1.2995, invincibleSeconds: 1.2,
  field: { left: 49, right: 348, top: 188, bottom: 634 },
  storageKey: 'ptb_aquarium_v2',
});

export const CHARACTERS = [
  { id: 'haru', name: '하루', color: '#ffc950', description: '호기심이 많아요', asset: 'kid-0.png' },
  { id: 'doyun', name: '도윤', color: '#79d7c2', description: '씩씩한 바다 친구', asset: 'kid-1.png' },
  { id: 'narin', name: '나린', color: '#ffb3a7', description: '새로운 것을 찾는 걸 좋아해요', asset: 'kid-2.png' },
  { id: 'soi', name: '소이', color: '#c2acf5', description: '차분한 단서 수집가', asset: 'kid-3.png' },
];

export const SHARKS = {
  basic: { name: '기본 상어', description: '같은 높이로 곧게 헤엄쳐요.', width: 111.55, height: 51.75, speed: 72, asset: 'aquarium-v19/shark-0.webp' },
  sturgeon: { name: '철갑상어', description: '위아래 물결을 그리며 지나가요.', width: 135.7, height: 46, speed: 68, wave: 48, asset: 'aquarium-v19/shark-1.webp' },
  baby: { name: '꼬마 상어', description: '경고 표시 뒤 빠르게 달려와요.', width: 79.35, height: 39.1, speed: 300, warning: 1.1, asset: 'aquarium-v19/shark-2.webp' },
  hammer: { name: '망치상어', description: '조금 큰 몸으로 느리게 지나가요.', width: 134.55, height: 58.65, speed: 58, asset: 'aquarium-v19/shark-3.webp' },
  big: { name: '큰 상어', description: '가장 크지만 가장 느리게 움직여요.', width: 158.7, height: 70.15, speed: 48, asset: 'aquarium-v19/shark-4.webp' },
};

// 실제 방탈출 단서 내용은 다음 제작 단계에서 교체합니다.
export const CLUES = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, number: String(i + 1).padStart(2, '0'), title: `단서 카드 ${String(i + 1).padStart(2, '0')}` }));

export const PUZZLE = Object.freeze({
  answer: '코끼리',
  hints: ['초식 동물입니다.', '코가 아주 긴 동물입니다.'],
  nextTitle: '어서오세요, 이곳은 미술관입니다',
});
export const MOTIONS = Object.freeze({ frames: 16, columns: 4, cell: 256, fps: 8 });

export const FAST_SHARK = Object.freeze({start:1.3,gap:.06,lanes:[215,280,345,410,475,540,605]});
