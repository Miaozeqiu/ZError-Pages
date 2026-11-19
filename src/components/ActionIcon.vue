<template>
  <span class="action-icon" :class="name" aria-hidden="true"></span>
</template>

<script setup lang="ts">
defineProps<{ name: 'download' | 'chevron-down' }>()
</script>

<style scoped>
.action-icon {
  position: relative;
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
}

.action-icon::before,
.action-icon::after {
  position: absolute;
  box-sizing: border-box;
}

.chevron-down::before,
.download::before {
  left: 50%;
  width: 0.48em;
  height: 0.48em;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translate(-50%, -50%) rotate(45deg);
  content: '';
}

.chevron-down::before {
  top: 40%;
}

.download {
  background: linear-gradient(currentColor, currentColor) center 0.08em / 1.5px 0.52em no-repeat;
}

.download::before {
  top: 0.43em;
}

.download::after {
  right: 0.05em;
  bottom: 0.045em;
  left: 0.05em;
  height: 0.28em;
  border: 1.5px solid currentColor;
  border-top: 0;
  border-radius: 0 0 2px 2px;
  content: '';
}
</style>
