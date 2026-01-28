<template>
     <VCard>
          <VCardText class="pa-0">
               <VRow no-gutters>
                    <VCol cols="12" class="border-s bg-grey-lighten-5 pa-4 overflow-y-auto" style="height: 100%;">
                         <VTabs v-model="tab" color="primary" class="mb-4">
                              <VTab value="data" @click="applyFiltersIfNeeded">
                                   <VIcon start icon="mdi-database" />
                                   Data
                              </VTab>
                              <VTab value="columns">
                                   <VIcon start icon="mdi-table-column" />
                                   Columns
                              </VTab>
                              <VTab value="filter">
                                   <VIcon start icon="mdi-filter" />
                                   Filter
                              </VTab>
                         </VTabs>

                         <VWindow v-model="tab">
                              <!-- Data Configuration Tab -->
                              <VWindowItem value="data">
                                   <VCard elevation="0" class="mb-4">
                                        <VCardTitle class="text-subtitle-2 pb-2">Configuration</VCardTitle>
                                        <VCardText>
                                             <!-- Report Name -->
                                             <VTextField v-model="data.reportName" label="Report Name"
                                                  variant="outlined" density="compact"
                                                  prepend-inner-icon="mdi-file-document" class="mb-3"
                                                  :rules="[v => !!v || 'Report name is required']" />

                                             <VAutocomplete :items="items" label="Module" v-model="selectmodel.y.model"
                                                  @update:modelValue="getFillable" variant="outlined" density="compact"
                                                  prepend-inner-icon="mdi-database" class="mb-3" />

                                             <!-- Group Fields Section -->
                                             <VCard elevation="0" outlined class="mb-3">
                                                  <VCardTitle class="text-caption pb-2">Group By Fields</VCardTitle>
                                                  <VCardText>
                                                       <template v-for="(gor, index) in group" :key="index">
                                                            <div class="mb-2 pa-3 border rounded d-flex align-center"
                                                                 draggable="true" @dragstart="onDragStart(index)"
                                                                 @dragover.prevent @drop="onDrop(index)">
                                                                 <VIcon icon="mdi-drag"
                                                                      class="drag-handle cursor-move mr-3"
                                                                      size="small" />

                                                                 <VAutocomplete :items="fields" v-model="group[index]"
                                                                      density="compact" variant="outlined" hide-details
                                                                      placeholder="Select field" class="flex-grow-1" />

                                                                 <VBtn icon="mdi-close" size="x-small" variant="text"
                                                                      color="error" class="ml-2"
                                                                      @click="deleteGroup(index)" />
                                                            </div>
                                                       </template>

                                                       <!-- Add Group Button -->
                                                       <div class="row">
                                                            <VBtn prepend-icon="bx-plus" color="primary"
                                                                 @click="addGroup" variant="text" size="small">
                                                                 Add Group
                                                            </VBtn>
                                                       </div>
                                                  </VCardText>
                                             </VCard>
                                        </VCardText>
                                   </VCard>
                              </VWindowItem>

                              <!-- Table Columns Tab -->
                              <VWindowItem value="columns"class="dir-rtl">
                                   <VCard elevation="0" class="mb-4">
                                        <VCardTitle class="text-subtitle-2 pb-2">Select Table Columns</VCardTitle>
                                        <VCardText>
                                             <VAlert type="info" variant="tonal" class="mb-3" density="compact">
                                                  Select and reorder the columns to display in your report
                                             </VAlert>

                                             <!-- Selected Columns -->
                                             <VCard elevation="0" outlined class="mb-3">
                                                  <VCardTitle class="text-caption pb-2">Selected Columns</VCardTitle>
                                                  <VCardText v-if="selectedColumns.length === 0"
                                                       class="text-center text-grey">
                                                       <VIcon icon="mdi-table-off" size="48" class="mb-2" />
                                                       <div class="text-caption">No columns selected</div>
                                                  </VCardText>

                                                  <VCardText v-else>
                                                       <template v-for="(column, index) in selectedColumns"
                                                            :key="index">
                                                            <div class="mb-2 pa-3 border rounded d-flex align-center"
                                                                 draggable="true" @dragstart="onColumnDragStart(index)"
                                                                 @dragover.prevent @drop="onColumnDrop(index)">
                                                                 <VIcon icon="mdi-drag"
                                                                      class="drag-handle cursor-move mr-3"
                                                                      size="small" />

                                                                 <div class="flex-grow-1">
                                                                      <div class="font-weight-medium">{{ column.title }}
                                                                      </div>
                                                                      <div class="text-caption text-grey">{{ column.data
                                                                           }}</div>
                                                                 </div>

                                                                 <VChip size="x-small"
                                                                      :color="column.isRelation ? 'purple' : 'blue'"
                                                                      class="mr-2">
                                                                      {{ column.isRelation ? 'Relation' : 'Direct' }}
                                                                 </VChip>

                                                                 <VBtn icon="mdi-close" size="x-small" variant="text"
                                                                      color="error" @click="removeColumn(index)" />
                                                            </div>
                                                       </template>
                                                  </VCardText>
                                             </VCard>

                                             <!-- Available Columns from Base Model -->
                                             <VCard elevation="0" outlined class="mb-3">
                                                  <VCardTitle class="text-caption pb-2">Base Model Columns</VCardTitle>
                                                  <VCardText>
                                                       <VChipGroup column>
                                                            <VChip v-for="column in availableColumns" :key="column.id"
                                                                 @click="addColumn(column)" variant="outlined"
                                                                 prepend-icon="mdi-plus" color="primary">
                                                                 {{ column.title }}
                                                            </VChip>
                                                       </VChipGroup>
                                                  </VCardText>
                                             </VCard>

                                             <!-- Add Relation Column -->
                                             <VCard elevation="0" outlined>
                                                  <VCardTitle class="text-caption pb-2">
                                                       <VIcon icon="mdi-link-variant" size="small" class="mr-1" />
                                                       Add Relation Column
                                                  </VCardTitle>
                                                  <VCardText>
                                                       <VRow>
                                                            <VCol cols="12" md="4">
                                                                 <VAutocomplete v-model="newRelation.model"
                                                                      :items="items" label="Related Model"
                                                                      variant="outlined" density="compact"
                                                                      @update:modelValue="loadRelationFields"
                                                                      prepend-inner-icon="mdi-database" />
                                                            </VCol>
                                                            <VCol cols="12" md="4">
                                                                 <VAutocomplete v-model="newRelation.field"
                                                                      :items="relationFields" label="Field"
                                                                      variant="outlined" density="compact"
                                                                      :disabled="!newRelation.model"
                                                                      prepend-inner-icon="mdi-table-column" />
                                                            </VCol>
                                                            <VCol cols="12" md="4">
                                                                 <VTextField v-model="newRelation.displayName"
                                                                      label="Display Name" variant="outlined"
                                                                      density="compact" prepend-inner-icon="mdi-label"
                                                                      placeholder="e.g., Department Name" />
                                                            </VCol>
                                                       </VRow>
                                                       <VRow>
                                                            <VCol cols="12">
                                                                 <VTextField v-model="newRelation.relationPath"
                                                                      label="Relation Path (optional)"
                                                                      variant="outlined" density="compact"
                                                                      prepend-inner-icon="mdi-map-marker-path"
                                                                      placeholder="e.g., department (leave empty for direct relation)"
                                                                      hint="The relationship name in your model"
                                                                      persistent-hint />
                                                            </VCol>
                                                       </VRow>
                                                       <VBtn color="primary" @click="addRelationColumn"
                                                            :disabled="!canAddRelation" prepend-icon="mdi-plus"
                                                            class="mt-2" block>
                                                            Add Relation Column
                                                       </VBtn>
                                                  </VCardText>
                                             </VCard>
                                        </VCardText>
                                   </VCard>
                              </VWindowItem>

                              <!-- Filter Tab -->
                              <VWindowItem value="filter">
                                   <FilterVue :fields="allColumns" :or-filter="filterData"
                                        @filter-data="updateFilterData" :entityName="entityName"
                                        :key="'filter-' + dialogRenderKey" />

                                   <!-- Apply Filters Button -->
                                   <VCard elevation="0" class="mt-4" v-if="hasActiveFilters">
                                        <VCardText>
                                             <VBtn color="primary" block @click="closeFilter"
                                                  prepend-icon="mdi-filter-check">
                                                  Apply Filters & View Data
                                             </VBtn>
                                        </VCardText>
                                   </VCard>
                              </VWindowItem>
                         </VWindow>
                    </VCol>
               </VRow>
          </VCardText>

          <VDivider />

          <VCardActions class="pa-4">
               <VSpacer />
               <div class="row d-flex justify-content-end" v-anyPermission="['update', 'insert']"
                    v-if="!noSubmit && !show">
                    <div class="d-flex justify-content-end  align-items-center">

                         <div>
                              <button class="btn-cancel" @click.prevent="closeForm">
                                   {{ $t("common.cancel") }}
                              </button>
                         </div>
                         <div>
                              <button class="btn-save ms-2 " id="submitFormBtn" @click.prevent="save">
                                   {{ $t("common.save") }}
                              </button>
                         </div>
                    </div>
               </div>
          </VCardActions>
     </VCard>
</template>

<script>
import FilterVue from '@/components/FilterDiv.vue';
import Permission from "@/API/Permission/Permission";
import userreport from "@/API/UserReport/UserReport";
import Auth from '../../../API/Auth';

export default {
     components: {
          FilterVue,
     },

     props: {
          closeForm: {
               type: Function
          }
     },

     data() {
          return {
               dialog: false,
               tab: "data",
               dialogRenderKey: 0,
               draggedColumnIndex: null,

               data: {
                    reportName: '',
                    title: '',

               },

               selectmodel: {
                    y: {
                         model: "",
                         field: ""
                    }
               },

               items: [],
               fields: [],
               selectedGroupFields: [],

               filterData: [[]],
               groupFieldsForFilter: [],
               filterGroups: [],
               fromFields: [],
               entityName: "",
               group: [],

               // Table columns management
               selectedColumns: [],
               allColumns: [],

               // Relation column builder
               newRelation: {
                    model: null,
                    field: null,
                    displayName: '',
                    relationPath: ''
               },
               relationFields: [],
               relationsWith: []
          };
     },

     computed: {
          availableColumns() {
               return this.allColumns.filter(col =>
                    !this.selectedColumns.find(selected => selected.id === col.id)
               );
          },

          canAddRelation() {
               return this.newRelation.model &&
                    this.newRelation.field &&
                    this.newRelation.displayName.trim() !== '';
          }
     },

     async created() {
          try {
               const perm = await new Permission().getAll();
               this.items = perm.map(item => item.name);
          } catch (error) {
               console.error("Error loading permissions:", error);
          }
     },

     watch: {
          modelValue(val) {
               this.dialog = val;
          },
          dialog(val) {
               this.$emit('update:modelValue', val);
          },
          tab(newTab) {
               if (newTab === 'data' && this.hasActiveFilters) {
                    this.$nextTick(() => {
                         this.processFilters();
                    });
               }
          }
     },

     methods: {
          // Relation column methods
          async loadRelationFields() {
               if (!this.newRelation.model) {
                    this.relationFields = [];
                    return;
               }

               try {
                    const model = await this.loadFile(this.newRelation.model);
                    const fields = await model.fillable();
                    this.relationFields = fields;
               } catch (error) {
                    console.error("Error loading relation fields:", error);
                    this.relationFields = [];
               }
          },

          addRelationColumn() {
               if (!this.canAddRelation) return;

               // Generate unique ID
               const columnId = `relation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

               // Build the data path
               const relationPath = this.newRelation.relationPath.trim() ||
                    this.newRelation.model.toLowerCase();
               const dataPath = `${relationPath}.${this.newRelation.field}`;

               // Create the new column
               const newColumn = {
                    id: columnId,
                    title: this.newRelation.displayName,
                    data: dataPath,
                    defaultContent: "N/A",
                    isRelation: true,
                    relationModel: this.newRelation.model,
                    relationField: this.newRelation.field,
                    relationPath: relationPath
               };

               // Add to selected columns
               this.selectedColumns.push(newColumn);

               // Track relation for API params
               if (!this.relationsWith.includes(relationPath)) {
                    this.relationsWith.push(relationPath);
               }

               // Reset form
               this.newRelation = {
                    model: null,
                    field: null,
                    displayName: '',
                    relationPath: ''
               };
               this.relationFields = [];

               this.$toast?.success('Relation column added successfully');
          },

          // Column management methods
          addColumn(column) {
               this.selectedColumns.push({ ...column });
          },

          removeColumn(index) {
               const column = this.selectedColumns[index];

               // Remove from relationsWith if it's a relation column
               if (column.isRelation && column.relationPath) {
                    const stillUsed = this.selectedColumns.some((col, idx) =>
                         idx !== index && col.relationPath === column.relationPath
                    );

                    if (!stillUsed) {
                         const withIndex = this.relationsWith.indexOf(column.relationPath);
                         if (withIndex > -1) {
                              this.relationsWith.splice(withIndex, 1);
                         }
                    }
               }

               this.selectedColumns.splice(index, 1);
          },

          onColumnDragStart(index) {
               this.draggedColumnIndex = index;
               document.body.classList.add("sortable-chosen");
          },

          onColumnDrop(index) {
               document.body.classList.remove("sortable-chosen");

               if (this.draggedColumnIndex !== null && this.draggedColumnIndex !== index) {
                    const temp = this.selectedColumns[this.draggedColumnIndex];
                    this.selectedColumns.splice(this.draggedColumnIndex, 1);
                    this.selectedColumns.splice(index, 0, temp);
               }
               this.draggedColumnIndex = null;
          },

          // Group management methods
          resetGroup() {
               this.group = [];
               this.close();
          },

          getChildPayload(index) {
               return this.group[index];
          },

          onDragStart(index) {
               this.draggedIndex = index;
               document.body.classList.add("sortable-chosen");
          },

          onDrop(index) {
               document.body.classList.remove("sortable-chosen");

               if (this.draggedIndex !== null && this.draggedIndex !== index) {
                    const temp = this.group[this.draggedIndex];
                    this.group.splice(this.draggedIndex, 1);
                    this.group.splice(index, 0, temp);
               }
               this.draggedIndex = null;
          },

          deleteGroup(index) {
               this.group = this.group.filter((_, i) => i !== index);
               this.close();
          },

          addGroup() {
               this.group.push("");
          },

          // Filter management
          closeFilter() {
               this.processFilters();
               this.tab = 'data';
          },

          applyFiltersIfNeeded() {
               if (this.hasActiveFilters) {
                    const currentTab = this.tab;
                    this.processFilters();
                    this.tab = currentTab;
               }
          },

          // Field loading
          async getFillable() {
               this.fields = [];
               this.selectedGroupFields = [];
               this.allColumns = [];
               this.selectedColumns = [];

               try {
                    const model = await this.loadFile(this.selectmodel.y.model);
                    const res = await model.fillable();
                    this.fields = res;

                    // Load table columns from the module
                    const tableColumns = await this.loadFromFields(this.selectmodel.y.model);

                    // Convert tableColumns to the format needed for column selection
                    this.allColumns = tableColumns.map((col, index) => {
                         // Check if it's a relation column (has dot notation in data property)
                         const isRelation = col.data && col.data.includes('.');

                         return {
                              id: col.id || `col_${index}`,
                              title: col.title || col.data,
                              data: col.data,
                              defaultContent: col.defaultContent || "N/A",
                              isRelation: isRelation,
                              relationModel: isRelation ? col.data.split('.')[0] : null,
                              relationPath: isRelation ? col.data.split('.')[0] : null
                         };
                    });
                    // updated_at
                    this.allColumns.push({ id: "updated_at", title: "user.updated_at", data: "updated_at", defaultContent: "N/A", isRelation: false },)
                    this.allColumns.push({ id: "created_at", title: "user.created_at", data: "created_at", defaultContent: "N/A", isRelation: false },)
                    // Auto-select all columns by default
                    this.selectedColumns = [...this.allColumns];

                    // Track existing relations
                    this.relationsWith = [];
                    this.allColumns.forEach(col => {
                         if (col.isRelation && col.relationPath && !this.relationsWith.includes(col.relationPath)) {
                              this.relationsWith.push(col.relationPath);
                         }
                    });

               } catch (error) {
                    console.error("Error loading fillable fields:", error);
               }
          },

          // File loading utilities
          async loadFile(fileName) {
               const { default: Module } = await import(`@/API/${fileName}/${fileName}.ts`);
               return new Module();
          },

          async loadFromFields(fileName) {
               try {
                    this.entityName = fileName;
                    const { default: Module } = await import(`@/views/Page/${fileName}/${fileName}.vue`);

                    const mockContext = {
                         $t: (key) => key,
                         tableColumns: [],
                         fromFields: [],
                         required: { password: 'required' }
                    };

                    if (Module.created) {
                         Module.created.call(mockContext);
                    }

                    this.groupFieldsForFilter = mockContext.fromFields || [];

                    // Return tableColumns for use in getFillable
                    return mockContext.tableColumns || [];
               } catch (error) {
                    console.error("Error loading form fields:", error);
                    return [];
               }
          },

          // Build API with params from relations
          buildApiWithParams() {
               const withParams = [];

               // Collect all unique relation paths from selected columns
               this.selectedColumns.forEach(col => {
                    if (col.isRelation && col.relationPath) {
                         // Add the relation with its fields if not already added
                         if (!withParams.some(param => param.startsWith(col.relationPath))) {
                              withParams.push(col.relationPath);
                         }
                    }
               });

               return withParams.length > 0 ? { with: withParams } : {};
          },

          // Dialog actions
          save() {
               // Validate report name
               if (!this.data.reportName || this.data.reportName.trim() === '') {
                    this.$toast?.error('Please enter a report name');
                    this.tab = 'data';
                    return;
               }

               // Validate module selection
               if (!this.selectmodel.y.model) {
                    this.$toast?.error('Please select a module');
                    this.tab = 'data';
                    return;
               }

               // Validate that at least one column is selected
               if (this.selectedColumns.length === 0) {
                    this.$toast?.error('Please select at least one column');
                    this.tab = 'columns';
                    return;
               }

               const data = {
                    baseModle: this.selectmodel.y.model,
                    apiParams: this.buildApiWithParams(),
                    filterGroups: this.filterGroups,
                    group: this.group,
                    groupFields: this.groupFieldsForFilter,
                    tableColumns: this.selectedColumns,
                    name: this.data.reportName,
               }

               console.log('Saving report with data:', data);

               const api = new userreport();
               api.from({ "user_id": Auth.USER.id, "name": this.data.reportName, data })
               this.closeForm();
          },
     }
}
</script>

<style scoped>
.cursor-move {
     cursor: move;
}
[dir="rtl"] .dir-rtl {
     direction: rtl;
}
</style>