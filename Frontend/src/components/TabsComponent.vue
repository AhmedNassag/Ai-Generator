<template>
  <div class="figma-tabs-center" :dir="direction">
    <div class="figma-tabs-container">
      <!-- Left Arrow - Top Left (or Right in RTL) -->
      <button v-if="showArrows" @click="scrollLeft" :disabled="!showLeftArrow" class="scroll-arrow scroll-arrow-left"
        aria-label="Scroll left">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>

      <!-- Tabs Wrapper -->
      <div class="figma-tabs-wrapper" ref="tabsWrapper" @scroll="checkArrows">
        <button v-for="tab in tabs" :key="tab.id" :ref="el => setTabRef(tab.id, el)" @click="handleTabClick(tab.id)"
          :class="['figma-tab', { 'figma-tab-active': modelValue === tab.id }]">
          {{ tab.label }}
        </button>
      </div>

      <!-- Right Arrow - Top Right (or Left in RTL) -->
      <button v-if="showArrows" @click="scrollRight" :disabled="!showRightArrow" class="scroll-arrow scroll-arrow-right"
        aria-label="Scroll right">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabsComponent',

  props: {
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => {
        return tabs.every(tab =>
          tab.hasOwnProperty('id') &&
          tab.hasOwnProperty('label')
        );
      }
    },
    modelValue: {
      type: String,
      required: true
    },
    showArrows: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'ltr',
      validator: (value) => ['ltr', 'rtl'].includes(value)
    }
  },

  emits: ['update:modelValue', 'tab-change'],

  data() {
    return {
      showLeftArrow: false,
      showRightArrow: false,
      tabRefs: {}
    };
  },

  computed: {
    isRTL() {
      return this.direction === 'rtl';
    }
  },

  mounted() {
    this.checkArrows();
    window.addEventListener('resize', this.checkArrows);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkArrows);
  },

  methods: {
    setTabRef(id, el) {
      if (el) {
        this.tabRefs[id] = el;
      }
    },

    handleTabClick(tabId) {
      this.$emit('update:modelValue', tabId);
      // Scroll active tab into view
      this.$nextTick(() => {
        this.scrollToTab(tabId);
      });
    },

    scrollToTab(tabId) {
      const tabElement = this.tabRefs[tabId];
      const wrapper = this.$refs.tabsWrapper;

      if (tabElement && wrapper) {
        const tabLeft = tabElement.offsetLeft;
        const tabWidth = tabElement.offsetWidth;
        const wrapperWidth = wrapper.offsetWidth;
        const scrollLeft = this.isRTL ? Math.abs(wrapper.scrollLeft) : wrapper.scrollLeft;

        // Check if tab is not fully visible
        if (tabLeft < scrollLeft || tabLeft + tabWidth > scrollLeft + wrapperWidth) {
          // Center the tab
          const scrollPosition = tabLeft - (wrapperWidth / 2) + (tabWidth / 2);
          wrapper.scrollTo({
            left: this.isRTL ? -scrollPosition : scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    },

    scrollLeft() {
      const wrapper = this.$refs.tabsWrapper;
      if (wrapper) {
        const scrollAmount = this.isRTL ? 200 : -200;
        wrapper.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    },

    scrollRight() {
      const wrapper = this.$refs.tabsWrapper;
      if (wrapper) {
        const scrollAmount = this.isRTL ? -200 : 200;
        wrapper.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    },

    checkArrows() {
      const wrapper = this.$refs.tabsWrapper;
      if (!wrapper) return;

      const { scrollLeft, scrollWidth, clientWidth } = wrapper;
      const absScrollLeft = Math.abs(scrollLeft);

      if (this.isRTL) {
        // RTL: scrollLeft is negative, starts at 0 and goes negative
        this.showRightArrow = absScrollLeft > 5;
        this.showLeftArrow = absScrollLeft < scrollWidth - clientWidth - 5;
      } else {
        // LTR: normal behavior
        this.showLeftArrow = scrollLeft > 5;
        this.showRightArrow = scrollLeft < scrollWidth - clientWidth - 5;
      }
    }
  }
};
</script>

<style scoped>
/* Tabs Center Wrapper */
.figma-tabs-center {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  width: 100%;
}

/* Container - Row Layout with Arrows on Sides */
.figma-tabs-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

/* Tabs - Exact Figma Design */
.figma-tabs-wrapper {
  display: flex;
  background: #F5F5F5;
  border-radius: 10px;
  padding: 4px;
  gap: 0;
  box-shadow: none;
  flex: 1;
  overflow-x: hidden;
  /* Hide scrollbar */
  scroll-behavior: smooth;
}

.figma-tab {
  flex: 1;
  padding: 12px 24px;
  margin: 6px;
  border: none;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
  text-align: center;
  min-width: fit-content;
}

.figma-tab:hover:not(.figma-tab-active) {
  background: #6E3894;
  color: #FFFFFF;
}

.figma-tab-active {
  background: #6E3894;
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
}

/* Scroll Arrows - Positioned on Left and Right */
.scroll-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F5F5F5;
  color: #6E3894;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.scroll-arrow:hover:not(:disabled) {
  background: #6E3894;
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(110, 56, 148, 0.3);
}

.scroll-arrow:active:not(:disabled) {
  transform: scale(0.95);
}

/* Disabled State */
.scroll-arrow:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.scroll-arrow svg {
  pointer-events: none;
}

/* RTL Support - Flip arrows visually */
[dir="rtl"] .scroll-arrow-left svg {
  transform: scaleX(-1);
}

[dir="rtl"] .scroll-arrow-right svg {
  transform: scaleX(-1);
}

/* Responsive */
@media (max-width: 768px) {
  .figma-tabs-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */
  }

  .figma-tabs-wrapper::-webkit-scrollbar {
    display: none;
    /* Chrome/Safari */
  }

  .figma-tab {
    padding: 8px 20px;
    font-size: 13px;
    flex: 0 0 auto;
  }

  .scroll-arrow {
    width: 32px;
    height: 32px;
  }

  .scroll-arrow svg {
    width: 18px;
    height: 18px;
  }

  .figma-tabs-container {
    gap: 8px;
  }
}

/* Desktop - hide arrows if all tabs fit */
@media (min-width: 769px) {
  .figma-tabs-wrapper {
    flex-wrap: nowrap;
  }
}
</style>