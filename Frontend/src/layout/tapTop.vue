<template>
  <div  @click="executeScroll" class="tap-top" :style="[display ? { 'display': 'block' } : { 'display': 'none' }]">
    <vue-feather type="chevrons-up"></vue-feather>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue"

const display = ref<boolean>(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll);

})


function executeScroll() {
  console.log('scroll');
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}
function handleScroll() {
  if (window.scrollY > 300) {
    display.value = true;
  } else {
    display.value = false;
  }
}
</script>