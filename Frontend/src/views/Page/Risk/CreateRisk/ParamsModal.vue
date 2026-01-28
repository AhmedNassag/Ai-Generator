<template>
  <v-dialog v-model="internalShow" max-width="1200px" persistent>
    <v-card class="params-modal">
      <!-- Header -->
      <v-card-title class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <p class="modal-subtitle">Select Your Preferred Level</p>
        </div>
        <v-btn icon @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <div class="modal-body">
        <!-- Left Sidebar Navigation -->
        <div class="sidebar-nav">
          <div 
            v-for="(param, pIndex) in activeParams.params" 
            :key="param.id" 
            class="nav-item"
            :class="{ active: activeSection === param.id }" 
            @click="scrollToSection(param.id)">
            <div class="nav-number">{{ pIndex + 1 }}</div>
            <div class="nav-label" :title="param.name">{{ truncateNavLabel(param.name) }}</div>
          </div>
        </div>

        <!-- Parameters Content -->
        <div class="content-area">
          <div 
            v-for="(param, pIndex) in activeParams.params" 
            :key="param.id" 
            class="param-section"
            :id="`param-${param.id}`">
            
            <!-- Section Header -->
            <div class="section-header">
              <div class="section-icon">{{ pIndex + 1 }}</div>
              <h3 class="section-title">{{ param.name }}</h3>
            </div>

            <!-- Level Cards Grid -->
            <div class="levels-grid">
              <div 
                v-for="(level, lIndex) in param.levels" 
                :key="lIndex" 
                class="level-card"
                :class="{ selected: isSelected(param.id, level) }"
                :style="getCardStyle(param.id, level)"
                @click="selectLevel(param.id, level)">
                
                <!-- Selection Circle -->
                <div class="selection-circle" :style="getCircleStyle(param.id, level)">
                  <div v-if="isSelected(param.id, level)" class="check-icon">
                    <v-icon color="white" size="small">mdi-check</v-icon>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="card-body">
                  <h4 class="level-name">{{ level.levelName }}</h4>
                  <p class="level-value">Value: {{ level.levelNumber }}</p>
                  <p class="level-description">
                    {{ truncateDescription(level.description) }}
                    <a v-if="level.description && level.description.length > 80" 
                       href="#" 
                       class="see-more-link"
                       :style="{ color: level.color || '#6E3894' }"
                       @click.prevent="openDescriptionModal(level)">
                      See More
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <v-card-actions class="modal-footer">
        <v-spacer></v-spacer>
        <v-btn 
          variant="outlined" 
          @click="close" 
          class="cancel-btn">
          Cancel
        </v-btn>
        <v-btn 
          color="primary" 
          @click="apply" 
          class="apply-btn">
          Apply ({{ Object.keys(selectedLevels || {}).length }})
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Description Modal -->
    <v-dialog v-model="showDescriptionModal" max-width="600px" persistent>
      <v-card class="description-modal">
        <v-card-title class="desc-modal-header">
          <span class="desc-modal-title">{{ currentLevel?.levelName }}</span>
          <v-btn icon @click="closeDescriptionModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="desc-modal-body">
          <div class="desc-value">Value: {{ currentLevel?.levelNumber }}</div>
          <div class="desc-content">{{ currentLevel?.description }}</div>
        </v-card-text>

        <v-card-actions class="desc-modal-footer">
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            @click="closeDescriptionModal"
            class="close-desc-btn">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
export default {
  name: "ParamsModal",
  props: {
    show: Boolean,
    modalTitle: String,
    activeParams: { type: Object, default: () => ({ params: [] }) },
    initialSelectedLevels: { type: Object, default: () => ({}) },
  },
  emits: ["update:show", "apply"],
  data() {
    return {
      internalShow: this.show,
      selectedLevels: { ...this.initialSelectedLevels },
      activeSection: null,
      showDescriptionModal: false,
      currentLevel: null
    };
  },
  watch: {
    show(val) {
      this.internalShow = val;
      if (val && this.activeParams.params.length > 0) {
        this.activeSection = this.activeParams.params[0].id;
      }
    },
    internalShow(val) {
      this.$emit("update:show", val);
    },
    initialSelectedLevels: {
      handler(val) {
        this.selectedLevels = { ...val };
      },
      deep: true,
    },
  },
  mounted() {
    if (Array.isArray(this.activeParams?.params) && this.activeParams.params.length > 0) {
      this.activeSection = this.activeParams.params[0].id;
    }
  },
  methods: {
    apply() {
      this.$emit("apply", this.selectedLevels);
      this.close();
    },
    close() {
      this.internalShow = false;
    },
    selectLevel(paramId, level) {
      this.selectedLevels[paramId] = level;
    },
    isSelected(paramId, level) {
      return this.selectedLevels[paramId] === level;
    },
    scrollToSection(paramId) {
      this.activeSection = paramId;
      const element = document.getElementById(`param-${paramId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    truncateDescription(description) {
      if (!description) return 'No description available';
      if (description.length <= 80) return description;
      return description.substring(0, 80) + '...';
    },
    truncateNavLabel(label) {
      if (!label) return '';
      // Truncate to 30 characters for sidebar
      if (label.length <= 30) return label;
      return label.substring(0, 30) + '...';
    },
    openDescriptionModal(level) {
      this.currentLevel = level;
      this.showDescriptionModal = true;
    },
    closeDescriptionModal() {
      this.showDescriptionModal = false;
      this.currentLevel = null;
    },
    getCardStyle(paramId, level) {
      const isSelected = this.isSelected(paramId, level);
      const color = level.color || '#6E3894';
      
      if (isSelected) {
        return {
          borderColor: color,
          backgroundColor: this.lightenColor(color, 0.95),
          boxShadow: `0 4px 12px ${this.hexToRgba(color, 0.2)}`
        };
      }
      
      return {};
    },
    getCircleStyle(paramId, level) {
      const isSelected = this.isSelected(paramId, level);
      const color = level.color || '#6E3894';
      
      if (isSelected) {
        return {
          backgroundColor: color,
          borderColor: color
        };
      }
      
      return {};
    },
    lightenColor(color, amount) {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Lighten
      const newR = Math.round(r + (255 - r) * amount);
      const newG = Math.round(g + (255 - g) * amount);
      const newB = Math.round(b + (255 - b) * amount);
      
      return `rgb(${newR}, ${newG}, ${newB})`;
    },
    hexToRgba(hex, alpha) {
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  },
};
</script>

<style scoped>
.v-dialog .v-card .v-card-title .v-btn {
    color: black !important;
    background: white !important;
    border-radius: 8px !important;
}
.params-modal {
  border-radius: 16px !important;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
    background: #F0F0F0;
  padding: 0.5rem 2rem !important;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.close-btn {
  color: #6b7280 !important;
  background: transparent !important;
}

.close-btn:hover {
  background: #f3f4f6 !important;
  color: #1a1a1a !important;
}

/* Body Layout */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 500px;
}

/* Sidebar Navigation */
.sidebar-nav {
  width: 280px;
  min-width: 280px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  min-height: 60px;
  box-sizing: border-box;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #ede9fe;
  border-left-color: #6E3894;
}

.nav-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #6E3894;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.nav-item.active .nav-number {
  background: #6E3894;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  flex: 1;
  min-width: 0; /* Important for text truncation */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item.active .nav-label {
  color: #6E3894;
  font-weight: 600;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.param-section {
  margin-bottom: 3rem;
}

.param-section:last-child {
  margin-bottom: 0;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #6E3894;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* Levels Grid */
.levels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.level-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.level-card:hover {
  border-color: #6E3894;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.level-card.selected {
  border-color: #6E3894;
  background: #f5f3ff;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

/* Selection Circle */
.selection-circle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.level-card.selected .selection-circle {
  background: #6E3894;
  border-color: #6E3894;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card Body */
.card-body {
  padding-right: 2rem;
}

.level-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.level-value {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.level-description {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
}

.see-more-link {
  color: #6E3894;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.see-more-link:hover {
  text-decoration: underline;
}

/* Footer */
.modal-footer {
  padding: 1rem 2rem !important;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.cancel-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  color: #6b7280 !important;
  border-color: #d1d5db !important;
  padding: 0.5rem 1.5rem !important;
}

.cancel-btn:hover {
  background: #f9fafb !important;
  border-color: #9ca3af !important;
}

.apply-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  background: #6E3894 !important;
  color: white !important;
  padding: 0.5rem 1.5rem !important;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.apply-btn:hover {
  background: #6E3894 !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Description Modal */
.description-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.desc-modal-header {
    background: #F0F0F0;
    color: black !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.desc-modal-title {
    font-weight: 700 !important;
    font-size: 1.25rem !important;
    color: black;
}

.desc-modal-header .close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.desc-modal-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.desc-modal-body {
  padding: 2rem !important;
}

.desc-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
}

.desc-content {
  font-size: 1rem;
  color: #1a1a1a;
  line-height: 1.6;
}

.desc-modal-footer {
  padding: 1rem 1.5rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.close-desc-btn {
  background: linear-gradient(135deg, #6E3894 0%, #6E3894 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0.5rem 2rem !important;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.close-desc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .levels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }

  .sidebar-nav {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.5rem 0;
    max-height: 200px;
  }

  .nav-item {
    padding: 0.5rem 1rem;
    min-height: 50px;
  }

  .content-area {
    padding: 1.5rem;
  }

  .levels-grid {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar Styling */
.content-area::-webkit-scrollbar,
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track,
.sidebar-nav::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-area::-webkit-scrollbar-thumb,
.sidebar-nav::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb:hover,
.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #6E3894;
}
</style>