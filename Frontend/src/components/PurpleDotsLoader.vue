<template>
  <div class="loader-container">
    <div class="purple-dot-loader">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
      <div class="dot dot-4"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PurpleDotLoader'
};
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.purple-dot-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 40%;
  animation: fadeInOut 1.4s ease-in-out infinite;
}

.dot-1 {
  background-color: #D8BFE8;
  animation-delay: 0s;
}

.dot-2 {
  background-color: #C5A3DC;
  animation-delay: 0.2s;
}

.dot-3 {
  background-color: #B187D0;
  animation-delay: 0.4s;
}

.dot-4 {
  background-color: #6E3894;
  animation-delay: 0.6s;
}

@keyframes fadeInOut {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>