import { includesHangul, matchHangul } from './match';

describe(matchHangul.name, () => {
  it('두 문자열이 동일할 경우 true를 반환한다.', () => {
    expect(matchHangul('a', 'a')).toBe(true);
    expect(matchHangul('가 나', '가 나')).toBe(true);
    expect(matchHangul('ㄱ나다라123', 'ㄱ나다라123')).toBe(true);
    expect(matchHangul('Zx0ㅡㅡ', 'Zx0ㅡㅡ')).toBe(true);
  });

  it('검색어가 부분 문자열일 경우 true를 반환한다.', () => {
    expect(matchHangul('가 나', '가')).toBe(true);
    expect(matchHangul('라123', '라123')).toBe(true);
    expect(matchHangul('x0', 'x0')).toBe(true);
    expect(matchHangul('xyz', 'a')).toBe(false);
  });

  it('검색어가 분리된 부분 문자열일 경우 true를 반환한다.', () => {
    expect(matchHangul('가나다라', '가다')).toBe(true);
    expect(matchHangul('1234567', '147')).toBe(true);
    expect(matchHangul('한국123', '한3')).toBe(true);
    expect(matchHangul('k케이j제이', 'k이이')).toBe(true);
  });

  it('검색어가 대소문자를 무시하고 분리된 부분 문자열일 경우 true를 반환한다.', () => {
    expect(matchHangul('ABC', 'abc')).toBe(true);
    expect(matchHangul('abc', 'ABC')).toBe(true);
    expect(matchHangul('Hello', 'heLLo')).toBe(true);
  });

  it('검색어가 대상 문자열의 초성일 경우 true를 반환한다.', () => {
    expect(matchHangul('감난닭뢈', 'ㄱㄴㄷㄹ')).toBe(true);
    expect(matchHangul('a가1항', 'aㄱ1ㅎ')).toBe(true);
    expect(matchHangul('보석', 'ㅄ')).toBe(true);
    expect(matchHangul('ㄱ', '가')).toBe(false);
    expect(matchHangul('ㄱ', 'ㄱ')).toBe(true);
    expect(matchHangul('가나다', 'ㄱ나')).toBe(false);
  });

  it('검색어가 분리된 부분 문자열의 초성일 경우 true를 반환한다.', () => {
    expect(matchHangul('감난닭뢈몂뷷셺', 'ㄱㄴㅁㅂㅅ')).toBe(true);
    expect(matchHangul('뿡뿡붕2짱', 'ㅃ2ㅉ')).toBe(true);
    expect(matchHangul('경나뎜릐망', 'ㄱㄴㅁ')).toBe(true);
    expect(matchHangul('낫 놓고 ㄱ자도 know', 'ㄴ ㄱkow')).toBe(true);
    expect(matchHangul('좋은 보석 2개', 'ㅈㅄ 2')).toBe(true);
  });

  it('term의 마지막 문자가 받침이 없고 받침을 추가했을 때 text 의 분리된 부분 문자열이 될 수 있는 경우 true를 반환한다.', () => {
    expect(matchHangul('앱', '애')).toBe(true);
    expect(matchHangul('등앱', '등애')).toBe(true);
    expect(matchHangul('앱', '앳')).toBe(false);
    expect(matchHangul('등앱', '드애')).toBe(false);
  });

  it('term 마지막 문자의 받침을 다음 글자의 초성으로 이동하여 분리된 부분 문자열의 일부가 초성일 경우 true를 반환한다.', () => {
    expect(matchHangul('수명', '숨')).toBe(true);
    expect(matchHangul('수명', '솜')).toBe(false);
    expect(matchHangul('2사이다', '2사읻')).toBe(true);
    expect(matchHangul('밥사', '밦')).toBe(true);
    expect(matchHangul('아라비안', '앏')).toBe(false);
    expect(matchHangul('장난감', '장낙')).toBe(false);
    expect(matchHangul('애벌레', '애버')).toBe(true);
    expect(matchHangul('수박', '숩')).toBe(true);
  });

  it.for([
    ['마력이 깃든 안대', 'ㅁ', true],
    ['마력이 깃든 안대', '마', true],
    ['마력이 깃든 안대', '말', true],
    ['마력이 깃든 안대', '말ㅇ', false],
    ['마력이 깃든 안대', '마려', true],
    ['마력이 깃든 안대', '마력', true],
    ['마력이 깃든 안대', '마력ㅇ', true],
    ['마력이 깃든 안대', '마력이', true],
    ['마력이 깃든 안대', '막', true],
    ['마력이 깃든 안대', '마기', true],
    ['마력이 깃든 안대', '마기 ', false],
    ['마력이 깃든 안대', '마깃', true],
    ['마력이 깃든 안대', '마깃ㅇ', true],
    ['마력이 깃든 안대', '마깃아', true],
    ['마력이 깃든 안대', '마깃안', true],
    ['루즈 컨트롤 머신 마크', '루', true],
    ['루즈 컨트롤 머신 마크', '룾', true],
    ['루즈 컨트롤 머신 마크', '뤀', true],
    ['루즈 컨트롤 머신 마크', '루커', true],
    ['루즈 컨트롤 머신 마크', '루컨', true],
    ['루즈 컨트롤 머신 마크', '루컨마', true],
    ['루즈 컨트롤 머신 마크', '루즈컨', true],
    ['루즈 컨트롤 머신 마크', '루머마', true],
  ] as const)(
    '("%s", "%s") 를 넣으면 %s를 반환한다.',
    ([target, search, expected]) => {
      expect(matchHangul(target, search)).toBe(expected);
    },
  );

  it('마지막 문자 보정을 포함하지 않은 10000회 호출이 평균 10ms 이상 걸리지 않는다.', () => {
    const iter = 100;
    const start = performance.now();
    for (let i = 0; i < 10000 * iter; i++) {
      matchHangul('루즈 컨트롤 머신 마크', '루즈 컨롤 머신');
    }
    const end = performance.now();
    expect((end - start) / iter).toBeLessThan(10);
  });

  it('마지막 문자 보정을 포함한 10000회 호출이 평균 10ms 이상 걸리지 않는다.', () => {
    const iter = 100;
    const start = performance.now();
    for (let i = 0; i < 10000 * iter; i++) {
      matchHangul('루즈 컨트롤 머신 마크', '루즈 컨롤 머맠');
    }
    const end = performance.now();
    expect((end - start) / iter).toBeLessThan(10);
  });

  it('초성 검색의 10000회 호출이 평균 10ms 이상 걸리지 않는다.', () => {
    const iter = 100;
    const start = performance.now();
    for (let i = 0; i < 10000 * iter; i++) {
      matchHangul('루즈 컨트롤 머신 마크', 'ㄹㅈ ㅋㅌㄹ ㅁㅁㅋ');
    }
    const end = performance.now();
    expect((end - start) / iter).toBeLessThan(10);
  });
});

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

test('ㅄ은 ㄱ-ㅎ 사이의 값이다.', () => {
  expect(/[ㄱ-ㅎ]/.test('ㅄ')).toBe(true);
});

test('NFC 문자열에서 charCodeAt과 [i]는 동일한 인덱스를 사용한다.', () => {
  const str = 'a1가뷁B_@영슈왊';
  for (let i = 0; i < str.length; i++) {
    expect(str.charCodeAt(i)).toBe(str[i].charCodeAt(0));
  }
});

test('가의 charCode는 44032이다.', () => {
  expect('가'.charCodeAt(0)).toBe(44032);
});
