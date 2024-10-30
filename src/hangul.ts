/**
 * 문자열에 한글 문자가 포함되었는지 검사합니다.
 * @param text 검사할 문자열.
 * @returns 한글 문자가 포함되었을 경우 `true`; 아닐 경우 `false`.
 */
export function includesHangul(text: string): boolean {
  return /[가-힣ㄱ-ㅣ]/.test(text);
}

/**
 * 문자열에 포함된 한글 문자가 모두 초성인지 검사합니다.
 * @param text 검사할 문자열.
 * @returns 한글 문자가 모두 초성일 경우 `true`; 아닐 경우 `false`.
 */
export function isOnlyChoseong(text: string): boolean {
  return !/[ㅏ-ㅣ가-힣]/.test(text);
}

/**
 * 완전한 한글 문자의 초성을 반환합니다.
 */
export function getChoseong(code: number) {
  return CHOSEONGS[getChoseongIndex(code)];
}

function getChoseongIndex(code: number) {
  code -= startCode;
  return Math.floor(code / 28 / 21);
}

/**
 * 완전한 한글 문자의 중성을 반환합니다.
 */
export function getJungseong(code: number) {
  return JUNGSEONGS[getJungseongIndex(code)];
}

function getJungseongIndex(code: number) {
  code -= startCode;
  return Math.floor(code / 28) % 21;
}

/**
 * 완전한 한글 문자의 종성을 반환합니다.
 */
export function getJongseong(code: number) {
  return JONGSEONGS[getJongseongIndex(code)];
}

function getJongseongIndex(code: number) {
  code -= startCode;
  return code % 28;
}

/**
 * 두 완전한 한글 문자의 초성이 같은지 검사합니다.
 */
export function equalChoseong(code1: number, code2: number) {
  return getChoseongIndex(code1) === getChoseongIndex(code2);
}

/**
 * 두 완전한 한글 문자의 중성이 같은지 검사합니다.
 */
export function equalJungseong(code1: number, code2: number) {
  return getJungseongIndex(code1) === getJungseongIndex(code2);
}

/**
 * 두 완전한 한글 문자의 종성이 같은지 검사합니다.
 */
export function equalJongseong(code1: number, code2: number) {
  return getJongseongIndex(code1) === getJongseongIndex(code2);
}

/**
 * 초성, 중성, 종성 인덱스를 받아 완전한 한글 문자 코드를 계산합니다.
 */
function assemble(
  choseongIndex: number,
  jungseongIndex: number,
  jongseongIndex: number = 0,
): number {
  return (
    (choseongIndex * 21 + jungseongIndex) * 28 + jongseongIndex + startCode
  );
}

export function disassembleChoseong(choseongText: string) {
  let result = '';
  for (let i = 0; i < choseongText.length; i++) {
    const char = choseongText[i];
    if (doubleMap.has(char)) {
      result += doubleMap.get(char);
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * 한글 문자일 경우 code2가 code1의 부분인지 검사합니다.
 * 아닐 경우 동일한 문자인지 검사합니다.
 */
export function isPartial(code1: number, code2: number) {
  if (code1 === code2) {
    return true;
  }
  if (isFullHangul(code1)) {
    if (canBeChoseong(code2)) {
      return getChoseong(code1).charCodeAt(0) === code2;
    }
    if (isFullHangul(code2)) {
      if (equalChoseong(code1, code2) && equalJungseong(code1, code2)) {
        if (hasBatchim(code2)) {
          return equalJongseong(code1, code2);
        }
        return true;
      }
      return false;
    }
  }
  return false;
}

/**
 * 완전한 한글 문자를 완전한 한글 문자 코드와 초성 문자로 분리합니다.
 */
export function disassembleToHangulCodeAndChoseong(
  code: number,
): [number, string] {
  const choseongIndex = getChoseongIndex(code);
  const jungseongIndex = getJungseongIndex(code);
  const jongseongIndex = getJongseongIndex(code);
  const jongseong = JONGSEONGS[jongseongIndex];
  if (jongseong.length == 2) {
    const leftJongseongIndex = JONGSEONGS.indexOf(jongseong[0]);
    return [
      assemble(choseongIndex, jungseongIndex, leftJongseongIndex),
      jongseong[1],
    ];
  } else {
    return [assemble(choseongIndex, jungseongIndex), jongseong];
  }
}

export function isFullHangul(code: number) {
  return startCode <= code && code <= endCode;
}

export function hasBatchim(code: number) {
  return getJongseongIndex(code) != 0;
}

export function canBeChoseong(code: number) {
  return CHOSEONGS.find((ch) => ch.charCodeAt(0) === code);
}

export function canBeJungseong(code: number) {
  return JUNGSEONGS.find((ch) => ch.charCodeAt(0) === code);
}

const startCode = '가'.charCodeAt(0);
const endCode = '힣'.charCodeAt(0);

const doubleMap = new Map([
  ['ㄳ', 'ㄱㅅ'],
  ['ㄵ', 'ㄴㅈ'],
  ['ㄶ', 'ㄴㅎ'],
  ['ㄺ', 'ㄹㄱ'],
  ['ㄻ', 'ㄹㅁ'],
  ['ㄼ', 'ㄹㅂ'],
  ['ㄽ', 'ㄹㅅ'],
  ['ㄾ', 'ㄹㅌ'],
  ['ㄿ', 'ㄹㅍ'],
  ['ㅀ', 'ㄹㅎ'],
  ['ㅄ', 'ㅂㅅ'],
]);

const CHOSEONGS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const;

const JUNGSEONGS = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅗㅏ',
  'ㅗㅐ',
  'ㅗㅣ',
  'ㅛ',
  'ㅜ',
  'ㅜㅓ',
  'ㅜㅔ',
  'ㅜㅣ',
  'ㅠ',
  'ㅡ',
  'ㅡㅣ',
  'ㅣ',
];

const JONGSEONGS = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄱㅅ',
  'ㄴ',
  'ㄴㅈ',
  'ㄴㅎ',
  'ㄷ',
  'ㄹ',
  'ㄹㄱ',
  'ㄹㅁ',
  'ㄹㅂ',
  'ㄹㅅ',
  'ㄹㅌ',
  'ㄹㅍ',
  'ㄹㅎ',
  'ㅁ',
  'ㅂ',
  'ㅂㅅ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
