import test from 'node:test';
import assert from 'node:assert/strict';
import { countCorrectCharacters, metrics, ranking, validEdit } from '../shared/race';
import type { Player } from '../shared/types';
test('mistakes do not block later correct Turkish characters', () => {
  assert.equal(countCorrectCharacters('İstanbul güzel.', 'İstanbul güzel.'), 14);
  assert.equal(countCorrectCharacters('Istanbul', 'İstanbul'), 7);
  assert.equal(countCorrectCharacters('Koşx pisti', 'Koşu pisti'), 8);
});
test('wrong characters cost two points, corrected errors remain charged', () => {
  assert.deepEqual(metrics(100, 120, 20, 200, 60000, 110), {
    typed: 110,
    penalty: 40,
    score: 60,
    progress: 30,
    wpm: 20,
    accuracy: 83,
  });
  assert.deepEqual(metrics(0, 0, 0, 10, 0, 0), {
    typed: 0,
    penalty: 0,
    score: 0,
    progress: 0,
    wpm: 0,
    accuracy: 100,
  });
  assert.equal(metrics(0, 1, 1, 10, 1000, 1).score, -2);
});
test('distance follows net score instead of input length and penalties can lower it', () => {
  assert.equal(metrics(4, 4, 0, 10, 60000, 4).progress, 40);
  assert.equal(metrics(4, 5, 1, 10, 60000, 5).progress, 20);
  assert.equal(metrics(0, 5, 5, 10, 60000, 5).progress, 0);
  assert.equal(metrics(1, 1, 0, 0, 1000, 1).progress, 0);
});
test('correct spaces earn no points and a perfect text reaches 100 percent', () => {
  const text = 'a b c';
  assert.equal(countCorrectCharacters('a ', text), 1);
  const correct = countCorrectCharacters(text, text);
  assert.equal(correct, 3);
  assert.equal(metrics(correct, 5, 0, text.replace(/\s/g, '').length, 60000, 5).progress, 100);
  assert.equal(countCorrectCharacters('     ', text), 0);
});
test('edit validation still rejects paste and mid-text replacement', () => {
  assert.ok(validEdit('', 'İ'));
  assert.ok(validEdit('ab', 'abc'));
  assert.ok(validEdit('abc', 'ab'));
  assert.equal(validEdit('', 'abc'), false);
  assert.equal(validEdit('abc', 'axc'), false);
});
test('net score comes first, equal scores use finish time', () => {
  const base: Player = {
    id: 'a',
    name: 'A',
    color: 0,
    ready: false,
    connected: true,
    correct: 10,
    typed: 10,
    attempts: 10,
    errors: 0,
    penalty: 0,
    score: 10,
    progress: 10,
    wpm: 50,
    accuracy: 100,
    finishedAt: null,
  };
  const sorted = ranking([
    base,
    { ...base, id: 'b', score: 8, finishedAt: 1 },
    { ...base, id: 'c', finishedAt: 20 },
    { ...base, id: 'd', finishedAt: 10 },
    { ...base, id: 'e', score: 20 },
  ]);
  assert.deepEqual(
    sorted.map((p) => p.id),
    ['e', 'd', 'c', 'a', 'b'],
  );
});
