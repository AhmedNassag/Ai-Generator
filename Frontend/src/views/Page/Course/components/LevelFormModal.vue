<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content level-modal">
      <div class="modal-header">
        <h5 class="modal-title">
          {{
            editingLevel
              ? $t("course.edit_level")
              : $t("course.add_new_level")
          }}
        </h5>
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
        <form @submit.prevent="submitLevel">
          <!-- Level Title and Order Row -->
          <div class="form-row">
            <div class="form-group col-half">
              <label for="levelTitle">
                {{ $t("course.leveltitle") }}<span class="required">*</span>
              </label>
              <input
                type="text"
                :placeholder="$t('course.leveltitle')"
                class="form-control"
                id="levelTitle"
                v-model="localLevelForm.title"
                required
              />
            </div>

            <div class="form-group col-half">
              <label for="levelOrder">
                {{ $t("course.levelorder") }}<span class="required">*</span>
              </label>
              <input
                type="number"
                :placeholder="$t('course.levelorder')"
                min="1"
                class="form-control"
                id="levelOrder"
                v-model="localLevelForm.order"
                required
              />
            </div>
          </div>

          <!-- Course Classification -->
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-layer-group"></i>
              {{ $t("course.levelclassification") }} <span class="required">*</span>
            </label>
            <div class="checkbox-row-inline">
              <div class="checkbox-item-box" :class="{ 'active': localLevelForm.levelType.mandatory }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="levelMandatory"
                  v-model="localLevelForm.levelType.mandatory"
                  @change="handleLevelTypeChange"
                />
                <label class="form-check-label" for="levelMandatory">
                  {{ $t("course.mandatory") }}
                </label>
              </div>

              <div class="checkbox-item-box" :class="{ 'active': localLevelForm.levelType.campaign }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="levelCampaign"
                  v-model="localLevelForm.levelType.campaign"
                />
                <label class="form-check-label" for="levelCampaign">
                  {{ $t("course.campaign") }}
                </label>
              </div>

              <div class="checkbox-item-box" :class="{ 'active': localLevelForm.levelType.optional }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="levelOptional"
                  v-model="localLevelForm.levelType.optional"
                />
                <label class="form-check-label" for="levelOptional">
                  {{ $t("course.optional") }}
                </label>
              </div>
            </div>
          </div>

          <!-- Conditional Fields for Mandatory Level -->
          <div v-if="localLevelForm.levelType.mandatory" class="conditional-section">
            <div class="form-row">
              <!-- Departments -->
              <div class="form-group col-half">
                <label for="levelDepartments">{{ $t("course.departments") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="levelDepartments"
                  v-model="localLevelForm.department_ids"
                  :options="departmentList || []"
                  label="name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectdepartments')"
                ></vue-select>
              </div>

              <!-- Teams -->
              <div class="form-group col-half">
                <label for="levelTeams">{{ $t("course.teams") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="levelTeams"
                  v-model="localLevelForm.team_ids"
                  :options="teamList || []"
                  label="name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectteams')"
                ></vue-select>
              </div>
            </div>

            <div class="">
              <!-- Users -->
              <div class="form-group col-md-12 mb-3">
                <label for="levelUsers">{{ $t("course.users") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="levelUsers"
                  v-model="localLevelForm.user_ids"
                  :options="userList || []"
                  label="full_name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectusers')"
                ></vue-select>
              </div>

              <!-- Days to Complete -->
              <div class="form-group col-md-12 mb-3">
                <label for="levelDaysToComplete">{{ $t("course.daystocomplete") }}</label>
                <input
                  type="number"
                  class="form-control"
                  id="levelDaysToComplete"
                  v-model="localLevelForm.days_to_complete"
                  :min="1"
                  :placeholder="$t('course.daystocomplete')"
                />
              </div>
            </div>

            <!-- Disable Menu Toggle -->
            <div class="form-group">
              <div class="disable-menu-box">
                <div class="toggle-container">
                  <div class="toggle-label-section">
                    <label for="levelDisableMenu" class="toggle-label">
                      {{ $t("course.disablemenu") }}
                    </label>
                    <p class="toggle-description">
                      {{
                        $t(
                          "course.This_option_restricts_access_to_the_system_menu_until_the_user_successfully_completes_the_level"
                        )
                      }}
                    </p>
                  </div>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      v-model="localLevelForm.disable_menu"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Buttons -->
      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" @click="$emit('close')">
          {{ $t("course.cancel") }}
        </button>
        <button class="btn btn-save" type="button" @click="submitLevel">
          {{
            editingLevel
              ? $t("course.update")
              : $t("course.save")
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VueSelect from "vue-select";

export default {
  name: 'LevelFormModal',
  components: {
    "vue-select": VueSelect
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    levelForm: {
      type: Object,
      required: true
    },
    editingLevel: {
      type: Object,
      default: null
    },
    departmentList: {
      type: Array,
      default: () => []
    },
    teamList: {
      type: Array,
      default: () => []
    },
    userList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localLevelForm: JSON.parse(JSON.stringify(this.levelForm))
    };
  },
  watch: {
    levelForm: {
      handler(newVal) {
        this.localLevelForm = JSON.parse(JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    handleLevelTypeChange() {
      if (!this.localLevelForm.levelType?.mandatory) {
        this.localLevelForm.department_ids = [];
        this.localLevelForm.team_ids = [];
        this.localLevelForm.user_ids = [];
        this.localLevelForm.days_to_complete = null;
        this.localLevelForm.disable_menu = false;
      }
    },
    submitLevel() {
      this.$emit('submit', this.localLevelForm);
    }
  }
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

.level-modal {
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

.form-group {
  margin-bottom: 20px;
}

.form-label,
label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.required {
  color: #A92525;
  margin-left: 2px;
}

.form-control {
  width: 100%;
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
}

/* Form Row */
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.col-half {
  flex: 1;
  margin-bottom: 0 !important;
}

/* Checkbox Row */
.checkbox-row-inline {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-item-box {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  /* border: 2px solid #ddd; */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

/* .checkbox-item-box:hover { */
  /* border-color: #6e3894; */
  /* background-color: #f8f5ff; */
/* } */

/* .checkbox-item-box.active { */
  /* border-color: #6e3894;
  background-color: #6e3894; */
  /* background-color: #f8f5ff; */

/* } */

/* .checkbox-item-box.active label {
  color: white;
} */

.checkbox-item-box input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: white;
  margin: 0;
  cursor: pointer;
}
.vs__open-indicator {
  display: none !important;
}

.checkbox-item-box label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
}

/* Conditional Section */
.conditional-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

/* Disable Menu Box */
.disable-menu-box {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.toggle-label-section {
  flex: 1;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.toggle-description {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #6E3894;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Modal Footer */
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
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 24px;
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
</style>

<style>
.vs__open-indicator {
  display: none !important;
}
</style>
