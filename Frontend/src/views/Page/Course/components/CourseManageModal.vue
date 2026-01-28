<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content manage-modal">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("course.managecourse") }}</h5>
        <button
          @click="$emit('close')"
          class="btn-close"
          aria-label="Close"
          type="button"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <!-- Course Levels Only -->
        <div class="levels-container">
          <div class="levels-header">
            <h6 class="levels-title">{{ $t("course.courselevels") }}</h6>
            <button
              class="btn btn-sm btn-add-level"
              @click="$emit('add-level')"
            >
              <i class="fa fa-plus"></i>
              {{ $t("course.addlevel") }}
            </button>
          </div>

          <div class="levels-list">
            <div
              v-for="(level, index) in courseLevels"
              :key="index"
              class="level-card"
            >
              <div
                class="level-header"
                :class="{ expanded: expandedLevel === level.id }"
              >
                <div class="level-info" @click="toggleLevel(level.id)">
                  <button class="expand-btn">
                    <i
                      class="fa fa-chevron-right"
                      :class="{ 'rotate-down': expandedLevel === level.id }"
                    ></i>
                  </button>
                  <div class="level-details">
                    <span class="level-title">{{ level.title }}</span>
                  </div>
                  <span class="level-badge"
                    >{{ $t("course.level") }} {{ level.order }}</span
                  >
                </div>

                <div class="level-actions">
                  <button
                    class="btn-dots"
                    @click.stop="toggleDropdown(level.id)"
                  >
                    <i class="fa fa-ellipsis-v"></i>
                  </button>

                  <!-- Dropdown menu -->
                  <div
                    v-if="activeDropdown === level.id"
                    v-permission:addTrainingModule
                    class="dropdown-menu-custom show"
                  >
                    <button
                      class="dropdown-item-custom"
                      @click="handleAddTrainingModule(level)"
                    >
                      <i class="fa fa-plus dropdown-icon add-icon"></i>
                      <span>{{ $t("course.addtrainingmodule") }}</span>
                    </button>
                    <button
                      class="dropdown-item-custom"
                      @click="handleEditLevel(level)"
                    >
                      <i class="fa fa-edit dropdown-icon edit-icon"></i>
                      <span>{{ $t("course.editlevel") }}</span>
                    </button>
                    <button
                      class="dropdown-item-custom"
                      @click="handleDeleteLevel(level.id)"
                    >
                      <i class="fa fa-trash dropdown-icon delete-icon"></i>
                      <span>{{ $t("course.deletelevel") }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Training Modules Section -->
              <transition name="slide-down">
                <div
                  v-if="expandedLevel === level.id"
                  class="modules-container"
                >
                  <div
                    v-if="level.modules.length === 0"
                    class="no-modules-message"
                  >
                    {{
                      $t("course.There_are_no_modules_available_for_this_level")
                    }}
                  </div>
                  <div
                    v-for="(module, moduleIndex) in level.modules"
                    :key="moduleIndex"
                    class="module-card"
                  >
                    <span class="module-name">{{ module.name }}</span>
                    <div class="module-actions">
                      <button
                        class="btn-icon-module edit"
                        @click="$emit('edit-module', module)"
                        title="Edit"
                      >
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button
                        class="btn-icon-module delete"
                        @click="$emit('delete-module', module.id)"
                        title="Delete"
                      >
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="modal-footer">
        <button class="btn btn-cancel" @click="$emit('close')">
          {{ $t("course.cancel") }}
        </button>
        <button class="btn btn-save" @click="$emit('close')">
          {{ $t("course.save") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseManageModal",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    selectedCourse: {
      type: Object,
      required: true,
    },
    courseLevels: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "close",
    "add-level",
    "edit-level",
    "delete-level",
    "add-training-module",
    "edit-module",
    "delete-module",
  ],
  data() {
    return {
      expandedLevel: null,
      activeDropdown: null,
    };
  },
  methods: {
    toggleLevel(levelId) {
      this.expandedLevel = this.expandedLevel === levelId ? null : levelId;
    },
    toggleDropdown(levelId) {
      this.activeDropdown = this.activeDropdown === levelId ? null : levelId;
    },
    handleAddTrainingModule(level) {
      this.activeDropdown = null;
      this.$emit("add-training-module", level);
    },
    handleEditLevel(level) {
      this.activeDropdown = null;
      this.$emit("edit-level", level);
    },
    handleDeleteLevel(levelId) {
      this.activeDropdown = null;
      this.$emit("delete-level", levelId);
    },
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".level-actions")) {
        this.activeDropdown = null;
      }
    });
  },
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.manage-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-close {
  font-size: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.levels-container {
  width: 100%;
}

.levels-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.levels-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-add-level {
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-level:hover {
  background-color: #5a2d7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.level-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.level-header {
  background-color: #f8f9fa;
  padding: 5px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.level-header:hover {
  background-color: #e9ecef;
}

.level-header.expanded {
  background-color: #e9ecef;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
  /* flex: 1; */
  cursor: pointer;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.expand-btn i {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.rotate-down {
  transform: rotate(90deg);
}

.level-details {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
}

.level-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}

.level-badge {
  font-size: 11px;
  color: #666;
  background-color: #e0e0e0;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
  margin-left: auto;
  font-weight: 500;
}

.level-actions {
  position: relative;
}

.btn-dots {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  color: #666;
  font-size: 16px;
  transition: all 0.2s;
  border-radius: 6px;
}

.btn-dots:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
  z-index: 1000;
  display: none;
}

.dropdown-menu-custom.show {
  display: block;
}

.dropdown-item-custom {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 14px;
  color: #333;
}

.dropdown-item-custom:hover {
  background-color: #f8f9fa;
}

.dropdown-icon {
  width: 16px;
  font-size: 14px;
}

.add-icon {
  color: #28a745;
}

.edit-icon {
  color: #6c757d;
}

.delete-icon {
  color: #a92525;
}

.modules-container {
  padding: 40px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.no-modules-message {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.module-card {
  /* background-color: #f8f9fa; */
  border-radius: 8px;
  padding: 5px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.module-card:last-child {
  margin-bottom: 0;
}

.module-card:hover {
  background-color: #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.module-name {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.module-actions {
  display: flex;
  gap: 8px;
}

.btn-icon-module {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-icon-module.edit {
  background-color: #fff;
  color: #c4951b;
  border: 1px solid #c4951b;
}

.btn-icon-module.edit:hover {
  background-color: #c4951b;
  color: white;
}

.btn-icon-module.delete {
  background-color: #fff;
  color: #a92525;
  border: 1px solid #a92525;
}

.btn-icon-module.delete:hover {
  background-color: #a92525;
  color: white;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 12px 12px;
}

.btn {
  border-radius: 11px;
  font-weight: 500;
  font-size: 14px;
  /* padding: 7px 24px; */
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: white;
  color: #6e3894;
  border: 1px solid #6e3894;
}

.btn-cancel:hover {
  background: #f8f5ff;
}

.btn-save {
  background: #6e3894;
  color: white;
}

.btn-save:hover {
  background: #5a2d7a;
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}
</style>
