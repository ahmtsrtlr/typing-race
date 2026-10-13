export function playTone() {
  const audio = new AudioContext();
  const o = audio.createOscillator();
  const gain = audio.createGain();
  o.connect(gain);
  gain.connect(audio.destination);
  o.frequency.value = 680;
  gain.gain.setValueAtTime(0.045, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
  o.start();
  o.stop(audio.currentTime + 0.13);
  o.onended = () => void audio.close();
}
