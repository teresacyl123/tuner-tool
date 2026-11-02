<template>
  <div class="app">
    <header class="nav">
      <div class="logo">🎼 口琴工具箱</div>
      <nav>
        <router-link to="/tuner" active-class="active">调音器</router-link>
        <router-link to="/metronome" active-class="active">节拍器</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app { min-height: 100vh; background: #0d1117; color: #e0e0e0; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid #30363d; }
.logo { font-size: 18px; font-weight: 600; color: #8cb4ff; }
nav { display: flex; gap: 24px; }
nav a { color: #8b949e; text-decoration: none; font-size: 15px; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; }
nav a:hover { color: #e0e0e0; background: #161b2e; }
nav a.active { color: #8cb4ff; background: rgba(140,180,255,0.1); }
main { padding: 32px; max-width: 900px; margin: 0 auto; }
</style>