import type { Player } from './types';
export const TEXTS = [
  'Güneşli bir sabah, küçük bir kaplumbağa koşu pistine geldi. Hızlı olmak güzel, ama pes etmemek daha güzeldi. Derin bir nefes aldı ve ilk adımını attı. Yol boyunca arkadaşları ona destek oldu. Bitiş çizgisine vardığında herkes aynı şeyi öğrendi: Her büyük başarı, küçük bir adımla başlar.',
  'Rüzgar ağaçların arasından geçerken parkta yeni bir yarış başladı. Herkes kendi kulvarında, kendi hızında ilerliyordu. Bir an durmak yolun bittiği anlamına gelmez. Bazen yeniden başlamak için sadece bir nefes gerekir. Gökyüzü maviydi, pist hazırdı ve bugün güzel bir gün olacaktı.',
  'Küçük bir kasabada her cuma meydanda buluşurduk. Yanımızda kitaplar, renkli kalemler ve anlatacak yeni hikayeler olurdu. Kimimiz uzak yerlere gitmek ister, kimimiz bir oyun tasarlardı. Hayallerimiz farklı olsa da birlikte geçirdiğimiz zaman hepimize iyi gelirdi. En güzel fikirler bazen sıradan bir sohbetten doğar.',
];
export const ERROR_PENALTY = 2;
/** Each position is independent: one mistake does not block later characters. */
export function countCorrectCharacters(value: string, target: string): number {
  let correct = 0;
  for (let i = 0; i < value.length; i++) if (value[i] === target[i]) correct++;
  return correct;
}
export function metrics(
  correct: number,
  attempts: number,
  errors: number,
  length: number,
  elapsedMs: number,
  typed: number,
  previousProgress = 0,
) {
  return {
    typed,
    penalty: errors * ERROR_PENALTY,
    score: correct - errors * ERROR_PENALTY,
    progress: Math.max(previousProgress, Math.min(100, Math.floor((typed / length) * 100))),
    wpm: elapsedMs > 0 ? Math.round(correct / 5 / (elapsedMs / 60000)) : 0,
    accuracy: attempts > 0 ? Math.round(((attempts - errors) / attempts) * 100) : 100,
  };
}
export function ranking(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.finishedAt !== null && b.finishedAt !== null) return a.finishedAt - b.finishedAt;
    if (a.finishedAt !== null) return -1;
    if (b.finishedAt !== null) return 1;
    return b.correct - a.correct || b.accuracy - a.accuracy || b.wpm - a.wpm;
  });
}
/** Allow one append or one backspace; prevent paste and fabricated progress. */
export function validEdit(previous: string, next: string): boolean {
  return (
    (next.length === previous.length + 1 && next.startsWith(previous)) ||
    (next.length === previous.length - 1 && previous.startsWith(next))
  );
}
