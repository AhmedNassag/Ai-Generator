<template>
  <v-footer class="d-flex rtl-end">
    <div class="d-flex items-center justify-between max-w-full">
      <!-- Left side with copyright info -->
      <div class="d-flex items-center justify-start text-sm text-gray-600 rtl">
        <div
          class="rounded-full border-2 border-gray-400 flex items-center justify-center"
        >
        </div>
        <p class="mb-0">
          ©️ Advanced Controls IT Co. – All Software & Intellectual Property
          Rights Reserved. Licensed for Use Under Subscription. GRC V4.0.1
        </p>
      </div>
    </div>
  </v-footer>
</template>

<script>
export default {
  name: "FooterComponent",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
.footer {
  transition: padding-left 0.3s ease-in-out !important;
  margin-left: 0 !important;
}

.footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}

.copyright-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.copyright-icon {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copyright-symbol {
  font-size: 0.75rem;
  font-weight: bold;
  color: #4b5563;
}

.version {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
}
[dir="rtl"] .rtl-end {
  justify-content: end;
}
</style>
