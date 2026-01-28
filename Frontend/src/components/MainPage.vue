<template>
  <slot name="modal"></slot>

  <!-- Loading State -->
  <PurpleDotsLoader v-if="loading" />

  <!-- Main Content -->
  <div v-else class="container-fluid">
    <div class="flip-container" :class="{ flip: isFlipped }">
      <div class="flipper">
        <!-- Front Side: Data Grid -->
        <div class="front">
          <div class="tabs">
            <div v-if="showInsightsTab" class="tabs-wrapper" style="margin-top: 15px; margin-bottom: 15px; width: 100%;">
              <v-tabs v-model="activeTab" dark>
                <v-tab value="tab1">
                  <v-icon color="#44225c" class="mr-2">mdi-chart-bar</v-icon>
                  Insights</v-tab
                >
                <v-tab value="tab2">{{ titlePage }}</v-tab>
              </v-tabs>
            </div>

            <v-window v-if="showInsightsTab" v-model="activeTab">
              <v-window-item value="tab1">
                <v-card flat>
                  <v-card-text>
                    <slot name="statistics"> </slot>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="tab2">
                <v-card flat>
                  <v-card-text>
                    <slot name="datatable"> </slot>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>

            <!-- Show datatable by default when showInsightsTab is false -->
            <div v-if="!showInsightsTab">
              <v-card flat style="margin-top: 35px">
                <v-card-text>
                  <slot name="datatable"> </slot>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <!-- Back Side: Form -->
        <div class="back">
          <div class="form-container">
            <slot name="form" v-if="isFlipped"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["flip-toggle", "breadcrumb-update"],
  props: {
    isFlipped: {
      type: Boolean,
      default: false,
      required: true,
    },
    titlePage: {
      type: String,
      default: "",
      required: true,
    },
    mainPage: {
      type: String,
      default: "",
      required: true,
    },
    mainSubPage: {
      type: String,
      default: "",
      required: false,
    },
    subPage: {
      type: String,
      default: "",
      required: true,
    },
    showInsightsTab: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  methods: {
    toggleFlip() {
      this.$emit("flip-toggle");
    },
    updateBreadcrumb() {
      const breadcrumbData = {
        titlePage: this.$t(this.titlePage),
        mainPage: this.$t(this.mainPage),
        mainSubPage: this.$t(this.mainSubPage),
        subPage: this.$t(this.subPage),
      };

      this.dataBreadCrumb = {
        mainPage: this.mainPage,
        subPage: this.subPage,
      };

      // Update global breadcrumb data
      if (typeof window !== "undefined") {
        window.dataBreadCrumb = breadcrumbData;

        // Dispatch custom event for breadcrumb update
        const event = new CustomEvent("breadcrumb-update", {
          detail: breadcrumbData,
        });
        window.dispatchEvent(event);
      }

      // Emit the breadcrumb update
      this.$emit("breadcrumb-update", breadcrumbData);
    },
  },
  data() {
    return {
      activeTab: this.showInsightsTab ? "tab1" : "tab2",
      dataBreadCrumb: {
        mainPage: this.mainPage,
        subPage: this.subPage,
      },
    };
  },
  mounted() {
    this.updateBreadcrumb();
  },
  watch: {
    mainPage() {
      this.updateBreadcrumb();
    },
    subPage() {
      this.updateBreadcrumb();
    },
    mainSubPage() {
      this.updateBreadcrumb();
    },
    titlePage() {
      this.updateBreadcrumb();
    },
    showInsightsTab(newVal) {
      // If insights tab is hidden and we're on tab1, switch to tab2
      if (!newVal && this.activeTab === "tab1") {
        this.activeTab = "tab2";
      }
    },
  },
};
</script>
<style>
/* .page-wrapper .page-body-wrapper .page-title .breadcrumb {
    justify-content: flex-start;
} */

/* Flip Container Styles */
.flip-container {
  perspective: 1000px;
  width: 100%;
  height: auto;
  min-height: 400px;
}

.flip-container.flip .flipper {
  transform: rotateY(180deg);
}

.flipper {
  transition: transform 0.8s ease-in-out;
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}

.front,
.back {
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 400px;
}

.front {
  z-index: 2;
  transform: rotateY(0deg);
}

.back {
  transform: rotateY(180deg);
  z-index: 1;
}

/* Form container styling */
.form-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Ensure content doesn't interfere with flip */
.flip-container .card {
  transform-style: preserve-3d;
}
[dir="rtl"] .v-slide-group__content {
  flex-direction: row-reverse;
}

/* Tabs wrapper styling */
.tabs-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 8px;
  display: inline-block;
}
.v-card-text {
    overflow-y: auto;
}
</style>
