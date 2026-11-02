# 节拍器页
<template>
  <div class="metronome">
    <h2>🥁 节拍器</h2>

    <BpmSlider v-model="bpm" />

    <div class="beats">
      <label>拍号：</label>
      <button v-for="b in [2,3,4,6]" :key="b" class="beat-btn" :class="{ active: beats === b }" @click="beats = b">
        {{ b }}/4
      </button>
    </div>

    <div class="indicator">
      <span v-for="i in beats" :key="i" class="dot" :class="{ active: currentBeat === i, accent: i === 1 }" />
    </div>

    <button class="btn-start" :class="{ running: isRunning }" @click="toggle">
      {{ isRunning ? '停止' : '开始' }}
    </button>

    <div class="bpm-display">{{ bpm }} BPM</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { getAudioContext, resumeAudio } from '../utils/audio'
import BpmSlider from '../components/BpmSlider.vue'

const bpm = ref(100)
const beats = ref(4)
const isRunning = ref(false)
const currentBeat = ref(0)
let nextTime = 0
let timer: ReturnType<typeof setTimeout> | null = null

const toggle = async () => {
  if (isRunning.value) stop()
  else await start()
}

const start = async () => {
  await resumeAudio()
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') await ctx.resume()
  isRunning.value = true
  currentBeat.value = 0
  nextTime = ctx.currentTime + 0.1
  schedule()
}

const stop = () => {
  isRunning.value = false
  currentBeat.value = 0
  if (timer) { clearTimeout(timer); timer = null }
}

const schedule = () => {
  if (!isRunning.value) return
  const ctx = getAudioContext()
  const interval = 60 / bpm.value
  while (nextTime < ctx.currentTime + 0.1) {
    currentBeat.value = (currentBeat.value % beats.value) + 1
    playClick(nextTime, currentBeat.value === 1)
    nextTime += interval
  }
  timer = setTimeout(schedule, 25)
}

const playClick = (time: number, accent: boolean) => {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = accent ? 1500 : 1000
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(0.25, time + 0.001)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.05)
}

onUnmounted(() => { stop() })
</script>

<style scoped>
.metronome { text-align: center; }
h2 { font-size: 24px; margin-bottom: 24px; color: #e0e0e0; }
.beats { margin: 20px 0; display: flex; align-items: center; justify-content: center; gap: 12px; }
.beats label { color: #8b949e; font-size: 14px; }
.beat-btn { padding: 6px 14px; background: #161b2e; border: 1px solid #30363d; border-radius: 6px; color: #8b949e; cursor: pointer; font-size: 14px; }
.beat-btn.active { border-color: #4facfe; color: #4facfe; background: rgba(79,172,254,0.1); }
.indicator { display: flex; gap: 12px; justify-content: center; margin: 28px 0; }
.dot { width: 16px; height: 16px; border-radius: 50%; background: #30363d; transition: all 0.15s; }
.dot.active { background: #4facfe; transform: scale(1.3); }
.dot.accent.active { background: #f5576c; }
.btn-start { margin-top: 16px; padding: 14px 48px; border-radius: 10px; border: none; font-size: 18px; font-weight: 600; cursor: pointer; background: #4facfe; color: #fff; transition: all 0.2s; }
.btn-start.running { background: #f5576c; }
.bpm-display { margin-top: 16px; font-size: 14px; color: #6a7088; }
</style>