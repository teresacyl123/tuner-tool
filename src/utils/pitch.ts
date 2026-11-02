//自相关+音名转换
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let bestOffset = -1
  let bestCorr = 0
  const rms = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / buf.length)
  if (rms < 0.01) return -1

  for (let offset = 0; offset < buf.length; offset++) {
    let corr = 0
    for (let i = 0; i < buf.length - offset; i++) {
      corr += buf[i] * buf[i + offset]
    }
    if (corr > bestCorr) {
      bestCorr = corr
      bestOffset = offset
    }
  }
  return sampleRate / bestOffset
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function freqToNote(freq: number): { name: string; cents: number; midi: number } {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440))
  const noteName = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  const exactMidi = 69 + 12 * Math.log2(freq / 440)
  const cents = Math.floor(1200 * Math.log2(freq / (440 * Math.pow(2, (midi - 69) / 12))))
  return { name: `${noteName}${octave}`, cents, midi }
}