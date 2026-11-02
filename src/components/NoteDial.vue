//表针组件（Canvas 或 CSS 旋转）
<template>
  <div class="dial">
    <svg width="260" height="260" viewBox="0 0 260 260">
      <!-- 外圈弧线 -->
      <path d="M 40 200 A 100 100 0 1 1 220 200" fill="none" stroke="#30363d" stroke-width="8" stroke-linecap="round"/>
      <!-- 刻度线 -->
      <g v-for="i in 21" :key="i">
        <line
          :x1="130 + 110 * Math.cos(angle(i))"
          :y1="130 + 110 * Math.sin(angle(i))"
          :x2="130 + 120 * Math.cos(angle(i))"
          :y2="130 + 120 * Math.sin(angle(i))"
          :stroke="i === 11 ? '#4facfe' : '#6a7088'"
          :stroke-width="i % 5 === 1 ? 2 : 1"
        />
      </g>
      <!-- 指针 -->
      <line
        x1="130" y1="130"
        :x2="130 + 80 * Math.cos(pointerAngle)"
        :y2="130 + 80 * Math.sin(pointerAngle)"
        stroke="#4facfe"
        stroke-width="3"
        stroke-linecap="round"
      />
      <!-- 中心点 -->
      <circle cx="130" cy="130" r="6" fill="#4facfe"/>
    </svg>
    <div class="cents-label">{{ cents }} ¢</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ cents: number }>()

const cents = computed(() => props.cents)

// 指针角度：cents 范围 -50 到 +50，映射到 -90° 到 +90°
const pointerAngle = computed(() => {
  const clamped = Math.max(-50, Math.min(50, props.cents))
  const deg = (clamped / 50) * 90 - 90 // -90° 到 +90°，但 SVG 坐标从顶部开始
  return (deg + 90) * Math.PI / 180
})

function angle(i: number): number {
  const deg = ((i - 1) / 20) * 180 - 90
  return deg * Math.PI / 180
}
</script>

<style scoped>
.dial { position: relative; display: flex; flex-direction: column; align-items: center; }
.cents-label { margin-top: 12px; font-size: 14px; color: #8b949e; }
</style>