import test from 'node:test';
import assert from 'node:assert/strict';
import { TEXTS, normalizeRaceText } from '../shared/texts';
import { createTextDeck } from '../server/textDeck';
test('the complete pool is varied, lowercase, Turkish and punctuation free', () => {
  assert.equal(TEXTS.length, 36);
  assert.equal(new Set(TEXTS).size, TEXTS.length);
  for (const text of TEXTS) {
    assert.equal(text, text.toLocaleLowerCase('tr-TR'));
    assert.match(text, /^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+)*$/u);
    assert.ok(text.length >= 170 && text.length <= 320);
  }
  assert.equal(normalizeRaceText('İSTANBUL, IŞIK!  Yeni\n Bir Gün.'), 'istanbul ışık yeni bir gün');
});
test('a room exhausts the pool before repeating and avoids cycle-boundary repeats', () => {
  const next = createTextDeck(TEXTS);
  let previous = '';
  for (let cycle = 0; cycle < 10; cycle++) {
    const seen = new Set<string>();
    for (let i = 0; i < TEXTS.length; i++) {
      const text = next();
      assert.notEqual(text, previous);
      assert.ok(!seen.has(text));
      seen.add(text);
      previous = text;
    }
    assert.equal(seen.size, TEXTS.length);
  }
});
test('single-item fixture remains usable and duplicates are deduplicated', () => {
  const next = createTextDeck(['a', 'a']);
  assert.equal(next(), 'a');
  assert.equal(next(), 'a');
  assert.throws(() => createTextDeck([]));
});
