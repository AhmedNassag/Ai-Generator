<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'generalrelation.generalrelation'"
    :subPage="'generalrelation.generalrelation'" :titlePage="'generalrelation.generalrelation'">

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="formFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"
        :customSubmit="handleSave">
        <template #relations>
          <div class="relations-repeater">
            <div class="repeater-header">
              <h3 class="repeater-title">
                <i class="fas fa-project-diagram"></i>
                {{ this.$t("general_relation.relations") }}
              </h3>
              <button type="button" class="btn-add" @click="addRelation(newItem)">
                <i class="fas fa-plus"></i>
                <span>{{ this.$t("general_relation.add_relation") }}</span>
              </button>
            </div>

            <!-- Loop through each relation with unique key -->
            <div class="relations-container">
              <transition-group name="relation-list" tag="div">
                <div v-for="(relation, index) in getRelations(newItem)"
                  :key="`relation-${newItem.name}-${index}-${relation._uid}`" class="relation-card">

                  <div class="card-header">
                    <div class="card-index">
                      <span>#{{ index + 1 }}</span>
                    </div>
                    <button type="button" class="btn-remove" @click="removeRelation(newItem, index)"
                      :title="this.$t('general_relation.remove_relation')">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  <div class="relation-fields">
                    <!-- Row 1: Name, Model, Display Name -->
                    <div class="field-row">
                      <div class="field-group">
                        <label class="field-label">
                          <i class="fas fa-tag"></i>
                          {{ this.$t("general_relation.relation_name") }}
                        </label>
                        <input v-model="relation.name" type="text" class="form-control"
                          placeholder="e.g., departments" />
                      </div>

                      <div class="field-group">
                        <label class="field-label">
                          <i class="fas fa-database"></i>
                          {{ this.$t("general_relation.model") }}
                        </label>
                        <LazySelectField :name="`model-${relation._uid}`" :options="permissionModels"
                          option-label="name" option-value="name" clearable :id="`model-${relation._uid}`"
                          v-model="relation.model" @update:modelValue="onRelationModelChange(relation, index)" />
                      </div>

                      <div class="field-group">
                        <label class="field-label">
                          <i class="fas fa-signature"></i>
                          {{ this.$t("general_relation.display_name") }}
                        </label>
                        <input v-model="relation.display_name" type="text" class="form-control"
                          placeholder="e.g., Departments" />
                      </div>
                    </div>

                    <!-- Row 2: Type and Foreign Key -->
                    <div class="field-row field-row-two">
                      <div class="field-group">
                        <label class="field-label">
                          <i class="fas fa-link"></i>
                          {{ this.$t("general_relation.type") }}
                        </label>
                        <select v-model="relation.type" class="form-control select-control"
                          @change="onRelationTypeChange(relation)">
                          <option value="hasMany">hasMany</option>
                          <option value="hasOne">hasOne</option>
                          <option value="belongsTo">belongsTo</option>
                          <option value="belongsToMany">belongsToMany</option>
                        </select>
                      </div>

                      <div class="field-group">
                        <label class="field-label">
                          <i class="fas fa-key"></i>
                          {{ this.$t("general_relation.foreign_key") }}
                        </label>
                        <LazySelectField :name="`foreign_key-${relation._uid}`" v-model="relation.foreign_key"
                          :options="relation._foreignKeyOptions || []" option-label="name" option-value="name" clearable
                          placeholder="Select foreign key" />
                      </div>
                    </div>

                    <!-- Row 3: Checkboxes -->
                    <div class="checkbox-row">
                      <div class="checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" v-model="relation.is_reverse" class="checkbox-input" />
                          <span class="checkbox-text">
                            <i class="fas fa-exchange-alt"></i>
                            {{ this.$t('general_relation.is_reverse') || 'Is Reverse' }}
                          </span>
                        </label>
                      </div>

                      <div class="checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" v-model="relation.show_at_general_report" class="checkbox-input" />
                          <span class="checkbox-text">
                            <i class="fas fa-file-alt"></i>
                            {{ this.$t('general_relation.show_at_general_report') || 'Show at General Report' }}
                          </span>
                        </label>
                      </div>

                      <div class="checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" v-model="relation.show_at_dashboard" class="checkbox-input" />
                          <span class="checkbox-text">
                            <i class="fas fa-chart-line"></i>
                            {{ this.$t('general_relation.show_at_dashboard') || 'Show at Dashboard' }}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>

              <div v-if="getRelations(newItem).length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No relations defined yet. Click the button above to add your first relation.</p>
              </div>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
import Permission from "@/API/Permission/Permission";
import Form from "@/components/Form.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import MainPage from "@/components/MainPage.vue";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
export default {
  components: {
    MainPage,
    Form,
    LazySelectField,
  },

  setup() {
    const apiParams = { filter: `type|general_relation|=` };
    const formFields = [];
    const api = new SystemSetting();
    const permissionApi = new Permission();

    return {
      api,
      apiParams,
      formFields,
      permissionApi,
    };
  },

  async mounted() {
    // Load existing data from system_settings
    await this.loadExistingData();
    await this.fetchModels();
  },

  data() {
    return {
      isFlipped: true,
      isReadonly: false,
      newItem: {
        type: "general_relation",
        Services: { ...this.services },
        Models: {},
      },
      services: {
        BaseService: "http://145.223.82.98:9494/api",
        UserService: "http://145.223.82.98:7474/api",
        NotificationService: "http://145.223.82.98:6464/api",
        RegulatorService: "http://82.29.175.67:3030/api",
        KpiService: "http://82.29.175.67:4040/api",
        StrategicPlanService: "http://strategic-plan-service:8080/api"
      },
      systemSettingsData: [], // Store loaded data
      relationUidCounter: 0, // Counter for unique IDs
      permissionModels: [],
    };
  },

  created() {
    const serviceOptions = Object.entries(this.services).map(
      ([key, value]) => ({
        name: key,
        id: key,
      })
    );

    this.formFields = [
      {
        type: "options",
        name: "name",
        label: this.$t("general_relation.model_name"),
        options: "Permission",
        optionLabel: "name",
        optionValue: "name",
        col: 6,
        rules: "required",
      },
      {
        type: "options",
        name: "service",
        label: this.$t("general_relation.service"),
        options: serviceOptions,
        optionLabel: "name",
        col: 6,
        rules: "required",
      },
      {
        name: "route",
        label: this.$t("general_relation.route"),
        type: "text",
        rules: "required",
        col: 6,
      },
      {
        type: "options",
        name: "default_field",
        label: this.$t("general_relation.default_field"),
        options: [],
        optionLabel: "name",
        optionValue: "name",
        col: 6,
        rules: "required",
      },
      {
        name: "relations"
      }
    ];
  },

  methods: {
    // Generate unique ID for each relation
    generateRelationUid() {
      return `uid-${Date.now()}-${this.relationUidCounter++}`;
    },

    // Load existing data from system_settings
    async loadExistingData() {
      try {
        const response = await this.api.getAll({ filter: 'type|general_relation|=' });
        this.systemSettingsData = response[0];
      } catch (error) {
        console.error('Failed to load existing data:', error);
      }
    },

    // Custom save handler
    async handleSave() {
      const cleanData = this.prepareDataForSave(this.newItem);
      try {
        const response = await this.api.insert(cleanData);
        this.api.poup(response, this.$t('messages.saved_successfully'));
      } catch (error) {
        console.error('Failed to save:', error);
      }
    },

    // Populate fields when model name is selected
    async populateExistingModelData(modelName) {
      if (!modelName || !this.systemSettingsData) return;

      const existingModel = this.systemSettingsData.data?.Models?.[modelName];

      if (existingModel) {
        // Populate service, route, and default_field at root level for form binding
        this.newItem.service = existingModel.service || '';
        this.newItem.route = existingModel.route || '';
        this.newItem.default_field = existingModel.default_field || '';

        // Also populate in Models structure
        if (!this.newItem.Models[modelName]) {
          this.newItem.Models[modelName] = {
            service: existingModel.service,
            route: existingModel.route,
            default_field: existingModel.default_field,
            relations: []
          };
        } else {
          this.newItem.Models[modelName].service = existingModel.service;
          this.newItem.Models[modelName].route = existingModel.route;
          this.newItem.Models[modelName].default_field = existingModel.default_field;
        }

        // Add existing relations with unique IDs
        if (existingModel.relations && existingModel.relations.length > 0) {
          this.newItem.Models[modelName].relations = existingModel.relations.map(rel => ({
            ...rel,
            _uid: this.generateRelationUid(),
            _foreignKeyOptions: [],
            _loadedModel: null,
            _loadedCacheKey: null
          }));

          // Load foreign key options for each relation
          for (const relation of this.newItem.Models[modelName].relations) {
            if (relation.model) {
              await this.loadForeignKeyOptions(relation);
            }
          }
        }

        this.$forceUpdate();
      }
    },

    closeForm() {
      this.newItem = {
        type: "general_relation",
        Services: { ...this.services },
        Models: {},
      };
    },

    addRelation(item) {
      if (!item.name) return;

      const relations = this.getRelations(item);

      relations.push({
        _uid: this.generateRelationUid(),
        name: "",
        model: "",
        display_name: "",
        foreign_key: "",
        type: "hasMany",
        is_reverse: false,
        show_at_general_report: false,
        show_at_dashboard: false,
        _foreignKeyOptions: [],
        _loadedModel: null,
        _loadedCacheKey: null
      });
    },

    // Sync data from Models object to root level for form display
    syncModelToRoot(item) {
      if (item.name && item.Models[item.name]) {
        item.service = item.Models[item.name].service;
        item.route = item.Models[item.name].route;
        item.default_field = item.Models[item.name].default_field;
      }
    },

    // Sync data from root level to Models object before save
    syncRootToModel(item) {
      if (item.name) {
        if (!item.Models) {
          item.Models = {};
        }

        if (!item.Models[item.name]) {
          item.Models[item.name] = {
            service: "",
            route: "",
            default_field: "",
            relations: []
          };
        }

        item.Models[item.name].service = item.service || "";
        item.Models[item.name].route = item.route || "";
        item.Models[item.name].default_field = item.default_field || "";

        // Preserve relations if they exist
        if (!item.Models[item.name].relations) {
          item.Models[item.name].relations = [];
        }
      }
    },

    // Prepare data for saving - remove internal fields and ensure proper structure
    prepareDataForSave(item) {
      this.syncRootToModel(item);

      // Deep clone to avoid mutating the original data
      const existingModels = JSON.parse(JSON.stringify(this.systemSettingsData?.data?.Models || {}));
      const existingServices = this.systemSettingsData?.data?.Services || this.services;

      // Only update/insert the current model, but keep all others
      if (item.name && item.Models?.[item.name]) {
        const model = item.Models[item.name];
        existingModels[item.name] = {
          service: model.service,
          route: model.route,
          default_field: model.default_field,
          relations: Array.isArray(model.relations)
            ? model.relations
              .filter(rel =>
                rel &&
                rel.name &&
                rel.model &&
                rel.type
              )
              .map(rel => ({
                name: rel.name,
                model: rel.model,
                display_name: rel.display_name || "",
                foreign_key: rel.foreign_key || "",
                type: rel.type,
                is_reverse: !!rel.is_reverse,
                show_at_general_report: !!rel.show_at_general_report,
                show_at_dashboard: !!rel.show_at_dashboard
              }))
            : []
        };
      }

      const cleanData = {
        type: "general_relation",
        data: {
          Services: { ...existingServices },
          Models: { ...existingModels }
        }
      };

      return cleanData;
    },

    removeRelation(item, index) {
      const relations = this.getRelations(item);
      relations.splice(index, 1);
    },

    getRelations(item) {
      if (!item.name) return [];

      // Ensure Models exists
      if (!item.Models) {
        item.Models = {};
      }

      // Ensure current model exists
      if (!item.Models[item.name]) {
        item.Models[item.name] = {
          service: item.service || "",
          route: item.route || "",
          default_field: item.default_field || "",
          relations: []
        };
      }

      // Ensure relations is always an array
      if (!Array.isArray(item.Models[item.name].relations)) {
        item.Models[item.name].relations = [];
      }

      return item.Models[item.name].relations;
    },

    async fetchModelFields(modelName) {
      try {
        const module = await import(`@/API/${modelName}/${modelName}.ts`);
        const ApiClass = module.default;
        const instance = new ApiClass();
        const response = await instance.fetchModelField();

        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Failed to load model fields:", error);
        return [];
      }
    },

    async onRelationModelChange(relation, index) {
      if (!relation.model) {
        relation._foreignKeyOptions = [];
        relation.foreign_key = null;
        relation._loadedModel = null;
        return;
      }

      // Clear foreign key when model changes
      if (relation._loadedModel && relation._loadedModel !== relation.model) {
        relation.foreign_key = null;
      }

      // Load foreign key options based on relation type
      await this.loadForeignKeyOptions(relation);

      relation._loadedModel = relation.model;
      this.$forceUpdate();
    },

    async loadForeignKeyOptions(relation) {
      let modelToFetch;

      // Determine which model's fields to fetch based on relation type
      if (relation.type === 'belongsTo' || relation.type === 'belongsToMany') {
        // For belongsTo/belongsToMany: use main model (outside repeater)
        modelToFetch = this.newItem.name;
      } else {
        // For hasMany/hasOne: use selected relation model (inside repeater)
        modelToFetch = relation.model;
      }

      if (!modelToFetch) {
        relation._foreignKeyOptions = [];
        return;
      }

      // Prevent refetch if already loaded for this model and type combination
      const cacheKey = `${modelToFetch}-${relation.type}`;
      if (relation._loadedCacheKey === cacheKey) return;

      const fields = await this.fetchModelFields(modelToFetch);

      relation._foreignKeyOptions = fields.map(f => ({
        name: f.name,
        id: f.name,
      }));

      relation._loadedCacheKey = cacheKey;
    },

    async onRelationTypeChange(relation) {
      // Clear foreign key when relation type changes
      relation.foreign_key = null;
      relation._loadedCacheKey = null;

      // Reload foreign key options based on new type
      if (relation.model) {
        await this.loadForeignKeyOptions(relation);
        this.$forceUpdate();
      }
    },

    async fetchModels() {
      try {
        const response = await this.permissionApi.getAll({
          select: "id|name",
        });

        this.permissionModels = response;

        this.formFields.find((field) => field.name === "name").options =
          response.map(f => ({
            name: f.name,
            id: f.name
          }));

      } catch (error) {
        console.error("Failed to load permission models:", error);
      }
    },
  },

  watch: {
    async 'newItem.name'(newValue, oldValue) {
      // If model changed, clear previous default_field
      if (newValue !== oldValue) {
        this.newItem.default_field = null;
        this.newItem.service = null;
        this.newItem.route = null;
        this.formFields.find((field) => field.name === "default_field").options = [];
      }

      if (newValue) {
        // First, try to populate from existing data
        await this.populateExistingModelData(newValue);

        // Then fetch fields for default_field dropdown
        const fields = await this.fetchModelFields(newValue);

        this.formFields.find((field) => field.name === "default_field").options =
          fields.map(f => ({
            name: f.name,
            id: f.name
          }));
      }
    },
  },
};
</script>

<style scoped>
/* Hide cancel button */
::v-deep(.btn-cancel) {
  display: none;
}

/* Relations Repeater Styles */
.relations-repeater {
  width: 100%;
  margin-top: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.repeater-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.repeater-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.repeater-title i {
  color: #3498db;
  font-size: 1.15rem;
}

/* Relations Container */
.relations-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Individual Relation Card */
.relation-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #dee2e6;
  border-left: 4px solid #3498db;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #dee2e6;
  z-index: 100;
}

.card-index {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
}

/* Remove Button */
.btn-remove {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3);
}

.btn-remove:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
}

.btn-remove:active {
  transform: translateY(0);
}

/* Add Button */
.btn-add {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(39, 174, 96, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
  background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
}

.btn-add:active {
  transform: translateY(0);
}

.btn-add i {
  font-size: 0.875rem;
}

/* Field Rows */
.relation-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: end;
}

.field-row-two {
  grid-template-columns: repeat(2, 1fr);
}

.checkbox-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #e9ecef;
}

/* Field Groups */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.field-label i {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Form Controls */
.form-control {
  padding: 0.65rem 0.875rem;
  font-size: 0.9rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  color: #495057;
}

.form-control:hover {
  border-color: #cbd5e0;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  background-color: #fff;
}

.select-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23495057' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2.5rem;
}

/* Checkboxes */
.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.65rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.checkbox-label:hover {
  background-color: #f8f9fa;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid #cbd5e0;
  transition: all 0.2s ease;
  accent-color: #3498db;
}

.checkbox-input:checked {
  background-color: #3498db;
  border-color: #3498db;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #495057;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-text i {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border: 2px dashed #cbd5e0;
}

.empty-state i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Transition Animations */
.relation-list-enter-active,
.relation-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.relation-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.relation-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.relation-list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card .card-header {
  position: static;
}
</style>