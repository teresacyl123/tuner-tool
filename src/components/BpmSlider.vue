<template>
  <div class="bpm-slider">
    <label class="label">BPM: <span class="value">{{ modelValue }}</span></label>
    <input
      type="range"
      :value="modelValue"
      min="40"
      max="208"
      step="1"
      @input="onInput"
      class="slider"
    />
    <div class="presets">
      <button v-for="p in presets" :key="p" class="preset-btn" @click="$emit('update:modelValue', p)">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const presets = [60, 80, 100, 120, 140, 160]

const onInput = (e: Event) => {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<style scoped>
.bpm-slider { padding: 16px 0; }
.label { font-size: 16px; color: #e0e0e0; }
.value { color: #4facfe; font-weight: 600; font-size: 20px; }
.slider { width: 100%; margin: 12px 0; accent-color: #4facfe; }
.presets { display: flex; gap: 8px; flex-wrap: wrap; }
.preset-btn { padding: 4px 12px; background: #161b2e; border: 1px solid #30363d; border-radius: 4px; color: #8b949e; cursor: pointer; font-size: 13px; }
.preset-btn:hover { border-color: #4facfe; color: #4facfe; }
</style>