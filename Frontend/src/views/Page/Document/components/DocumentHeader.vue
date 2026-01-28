<template>
  <div class="document-header mb-4">
    <div class="d-flex align-items-center gap-2 text-secondary mb-2"></div>
    <div class="d-flex align-items-center">
      <router-link to="/document" class="btn btn-back fs-4 fw-bold">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <h1 class="document-title ms-3">
        {{ document.name || 'Loading...' }}
      </h1>
    </div>
  </div>
</template>

<script>
export default {
  name: "DocumentHeader",
  props: {
    document: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
};
</script>