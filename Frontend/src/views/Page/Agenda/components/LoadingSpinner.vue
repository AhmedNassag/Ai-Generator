<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="dot-loader">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner"
};
</script>

<style scoped>
.dot-loader {
  gap: 0.75rem;
  display: flex;
}

.dot-loader div {
  width: 10px;
  height: 10px;
  background-color: #44225c;
  border-radius: 50%;
  animation: bounce 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-15px); }
}
</style>
