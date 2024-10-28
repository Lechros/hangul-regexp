import {
  canBeJungseong,
  convertQwertyToHangul,
  disassemble,
  getChoseong,
  hasBatchim,
} from 'es-hangul';

/**
 * 문자열에 한글 문자가 포함되었는지 검사합니다.
 * @param text 검사할 문자열.
 * @returns 한글 문자가 포함되었을 경우 `true`; 아닐 경우 `false`.
 */
export function includesHangul(text: string): boolean {
  return /[가-힣ㄱ-ㅣ]/.test(text);
}

/**
 * 문자열의 알파벳을 qwerty 자판에 매칭되는 한글로 변환합니다.
 * @param text 변환할 문자열.
 * @returns 한글로 변환된 문자열.
 */
export function convertToHangul(text: string) {
  return convertQwertyToHangul(text);
}

/**
 * 검색 문자열이 대상 문자열과 일치하는지를 너그럽게 판별합니다.
 *
 * - 대소문자를 구분하지 않고 비교합니다.
 * - 연속되지 않은 일치를 허용합니다.
 * - 검색 문자열이 초성만으로 구성된 경우, 대상 문자열의 초성 포함 여부를 판별합니다.
 * - 대상 문자열의 마지막 문자가 완성되지 않은 경우를 고려합니다.
 *
 * @param target 대상 문자열.
 * @param search 검색 문자열. 빈 문자열일 수 없습니다.
 * @returns 일치할 경우 `true`; 아닐 경우 `false`.
 *
 * @example
 * // 대소문자 구분
 * match('Hello', 'heLLo') === true
 *
 * // 연속되지 않은 일치
 * match('가나다라', '가다') === true
 *
 * // 초성 일치
 * match('좋은 보석 2개', 'ㅈㅄ 2') === true
 *
 * // 마지막 문자 일치
 * match('애벌레', '애버') === true
 * match('수박', '숩') === true
 */
export function matchHangul(target: string, search: string) {
  target = target.toLowerCase();
  search = search.toLowerCase();
  if (target === search) {
    return true;
  }
  if (matchChoseong(target, search)) {
    return true;
  }
  let matchedI = -1;
  let j = 0;
  for (let i = 0; i < target.length && j < search.length; i++) {
    if (target[i] === search[j]) {
      j++;
      matchedI = i;
    }
  }
  if (j === search.length - 1) {
    // 검색 문자열의 마지막 문자가 대상 문자열의 일부인 경우 참 반환. ('앱', '애')
    if (includesPartialHangul(target, search[j], matchedI + 1)) {
      return true;
    }
    // 검색 문자열의 마지막 문자를 분리하고 대상 문자열의 일부로 만들 수 있는 경우 참 반환. ('가나', '간')
    if (includesPartialOrSeperatedHangul(target, search[j], matchedI + 1)) {
      return true;
    }
  }
  return j === search.length;
}

/**
 * search가 초성 문자로 이루어져 있고, target의 연속되지 않은 부분 문자열의 초성일 경우 `true`; 아닐 경우 `false`.
 */
function matchChoseong(target: string, search: string) {
  if (/[ㅏ-ㅣ가-힣]/.test(search)) {
    return false;
  }
  // 자음군(ㄻ, ㅄ) 처리. 쌍받침(ㄲ, ㅃ, ㅆ)은 분리되지 않음.
  search = disassemble(search);
  let j = 0;
  for (let i = 0; i < target.length && j < search.length; i++) {
    // 한글이 아닐 경우 동등 비교에서 통과, 한글일 경우 초성 비교.
    if (target[i] === search[j] || getCharChoseong(target[i]) === search[j]) {
      j++;
    }
  }
  return j == search.length;
}

/**
 * targetStartIndex부터 시작하여 target 내에 searchChar를 포함하는 한글 문자가 존재할 경우 `true`; 아닐 경우 `false`.
 */
function includesPartialHangul(
  target: string,
  searchChar: string,
  targetStartIndex: number,
) {
  const disassembled = disassemble(searchChar);
  for (let i = targetStartIndex; i < target.length; i++) {
    if (disassemble(target[i]).startsWith(disassembled)) {
      return true;
    }
  }
  return false;
}

/**
 * targetStartIndex부터 시작하여 target 내에 searchChar를 분리하여 매칭할 수 있는 경우 `true`; 아닐 경우 `false`.
 */
function includesPartialOrSeperatedHangul(
  target: string,
  searchChar: string,
  targetStartIndex: number,
) {
  if (!hasBatchim(searchChar)) {
    return false;
  }
  const disassembled = disassemble(searchChar);
  const [hangul, choseong] = disassembleToHangulAndChoseong(disassembled);
  for (let i = targetStartIndex; i < target.length; i++) {
    if (disassemble(target[i]) === hangul) {
      for (let j = i + 1; j < target.length; j++) {
        if (getCharChoseong(target[j]) === choseong) {
          return true;
        }
      }
      return false;
    }
  }
  return false;
}

/**
 * 한글 문자를 한글 문자와 초성으로 분리합니다.
 */
function disassembleToHangulAndChoseong(disassembledHangulWithBatchim: string) {
  const parts = disassembledHangulWithBatchim;
  let i;
  for (i = parts.length - 1; i >= 0; i--) {
    if (canBeJungseong(parts[i])) {
      break;
    }
  }
  // 겹받침일 경우 하나는 이전 글자에 포함, 하나는 다음 글자의 초성으로 취급.
  if (parts.substring(i + 1).length >= 2) {
    return [parts.substring(0, i + 2), parts.substring(i + 2)];
  } else {
    return [parts.substring(0, i + 1), parts.substring(i + 1)];
  }
}

/**
 * 한글 문자의 초성을 반환합니다. `getChoseong`의 최적화된 버전입니다.
 */
export function getCharChoseong(char: string) {
  return CHOSEONGS[char.normalize('NFD').charCodeAt(0) - 0x1100];
}

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
];
