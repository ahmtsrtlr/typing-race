import { randomInt } from 'node:crypto';
/** Each room sees the whole shuffled pool before repeating a text. */
export function createTextDeck(texts: readonly string[]): () => string {
  const pool = [...new Set(texts)];
  if (!pool.length) throw new Error('Race text pool must not be empty');
  let deck: string[] = [];
  let lastText = '';
  return () => {
    if (!deck.length) {
      deck = [...pool];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck.length > 1 && deck[deck.length - 1] === lastText) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    lastText = deck.pop()!;
    return lastText;
  };
}
