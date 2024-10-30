import {
  equalChoseong,
  getChoseong,
  getJongseong,
  getJungseong,
  includesHangul,
} from './hangul';

describe(includesHangul.name, () => {
  it.for([
    ['가', true],
    ['ㄱ', true],
    ['ㅢ', true],
    ['1', false],
    ['햏a', true],
    ['a가', true],
    ['1ㄱ1', true],
    ['z', false],
  ] as const)('%s를 받으면 %s를 반환한다.', ([str, expected]) => {
    expect(includesHangul(str)).toBe(expected);
  });
});

test('getChoseong은 문자의 초성을 반환한다.', () => {
  expect(getChoseong('광'.charCodeAt(0))).toBe('ㄱ');
});

test('getJungseong은 문자의 중성을 반환한다.', () => {
  expect(getJungseong('광'.charCodeAt(0))).toBe('ㅗㅏ');
});

test('getJongseong은 문자의 종성을 반환한다', () => {
  expect(getJongseong('광'.charCodeAt(0))).toBe('ㅇ');
});

test('equalChoseong에 초성이 같은 문자를 넣으면 true를 반환한다.', () => {
  expect(equalChoseong('광'.charCodeAt(0), '격'.charCodeAt(0))).toBe(true);
  expect(equalChoseong('광'.charCodeAt(0), '꽝'.charCodeAt(0))).toBe(false);
});
