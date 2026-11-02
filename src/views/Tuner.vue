# 调音器页
<template>
  <div class="tuner">
    <h2>🎯 口琴调音器</h2>
    <p class="hint">对着麦克风吹一个长音，保持单音稳定</p>

    <div class="display">
      <div class="note-big">{{ currentNote || '--' }}</div>
      <div class="freq">{{ currentFreq ? currentFreq.toFixed(1) + ' Hz' : '-- Hz' }}</div>
    </div>

    <NoteDial :cents="cents" />

    <div class="controls">
      <button class="btn" :class="{ active: isListening }" @click="toggleListening">
        {{ isListening ? '停止' : '开始校音' }}
      </button>
      <button class="btn btn-ref" @click="playReference">
        播放参考音 A4 (440Hz)
      </button>
    </div>

    <div class="status" :class="{ active: isListening }">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { autoCorrelate, freqToNote } from '../utils/pitch'
import { getAudioContext, resumeAudio } from '../utils/audio'
import NoteDial from '../components/NoteDial.vue'

const isListening = ref(false)
const currentNote = ref('')
const currentFreq = ref<number | null>(null)
const cents = ref(0)
const statusText = ref('点击"开始校音"获取麦克风权限')
let stream: MediaStream | null = null
let analyser: AnalyserNode | null = null
let rafId = 0
let audioCtx: AudioContext | null = null

const toggleListening = async () => {
  if (isListening.value) {
    stopListening()
  } else {
    await startListening()
  }
}

const startListening = async () => {
  try {
    await resumeAudio()
    audioCtx = getAudioContext()
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false }
    })
    const source = audioCtx.createMediaStreamSource(stream)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 4096
    source.connect(analyser)
    isListening.value = true
    statusText.value = '正在收音...吹一个长音'
    tick()
  } catch (e) {
    statusText.value = '麦克风权限被拒绝，请在浏览器设置中允许'
  }
}

const stopListening = () => {
  isListening.value = false
  cancelAnimationFrame(rafId)
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  currentNote.value = ''
  currentFreq.value = null
  cents.value = 0
  statusText.value = '已停止'
}

const tick = () => {
  if (!analyser || !audioCtx || !isListening.value) return
  const buf = new Float32Array(4096)
  analyser.getFloatTimeDomainData(buf)
  const f = autoCorrelate(buf, audioCtx.sampleRate)
  if (f > 50 && f < 1500) {
    currentFreq.value = f
    const result = freqToNote(f)
    currentNote.value = result.name
    cents.value = result.cents
    statusText.value = Math.abs(result.cents) < 5 ? '✅ 音准！' : (result.cents < 0 ? '⬇ 偏低' : '⬆ 偏高')
  } else {
    currentNote.value = ''
    currentFreq.value = null
    cents.value = 0
    statusText.value = '未检测到有效音高，请吹响口琴'
  }
  rafId = requestAnimationFrame(tick)
}

const playReference = async () => {
  await resumeAudio()
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 440
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
  osc.connect(gain).connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 1.5)
  statusText.value = '正在播放 A4 = 440Hz 参考音'
}

onUnmounted(() => {
  stopListening()
})
</script>

<style scoped>
.tuner { text-align: center; }
h2 { font-size: 24px; margin-bottom: 8px; color: #e0e0e0; }
.hint { color: #6a7088; font-size: 13px; margin-bottom: 24px; }
.display { margin: 24px 0; }
.note-big { font-size: 64px; font-weight: 700; color: #4facfe; line-height: 1; }
.freq { font-size: 16px; color: #8b949e; margin-top: 8px; }
.controls { display: flex; gap: 16px; justify-content: center; margin: 24px 0; }
.btn { padding: 12px 28px; border-radius: 8px; border: none; font-size: 15px; cursor: pointer; transition: all 0.2s; }
.btn.active { background: #f5576c; color: #fff; }
.btn:not(.active) { background: #4facfe; color: #fff; }
.btn:hover { opacity: 0.9; }
.btn-ref { background: #161b2e; color: #8cb4ff; border: 1px solid #30363d; }
.status { margin-top: 16px; font-size: 14px; color: #6a7088; }
.status.active { color: #4facfe; }
</style>