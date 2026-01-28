<template>
     <VContainer fluid>
          <VCard>
               <VCardText>
                    <div class="d-flex justify-space-between align-center dashboard-header mb-6">
                         <h1 class="text-h4 font-weight-bold">Dashboard</h1>
                         <div class="d-flex gap-3">
                              <VBtn v-if="this.activeTab != 'all'" @click="deleteDashboard" variant="outlined"
                                   color="red-darken-3" style=" border: 2px solid #b00020 !important;"
                                   prepend-icon="mdi-delete" rounded="xl">
                                   Delete
                              </VBtn>

                              <VBtn v-if="this.activeTab != 'all'" @click="editDashboard" variant="outlined"
                                   color="yellow-darken-2" style=" border: 2px solid #fbc02c !important;"
                                   prepend-icon="mdi-pencil" rounded="xl">
                                   Edit
                              </VBtn>
                              <VBtn color="purple-darken-1" prepend-icon="mdi-plus" rounded="xl"
                                   @click="addNewDashboard = true">
                                   Add
                              </VBtn>
                         </div>
                    </div>


                    <!-- Tabs -->


                    <TabsComponent :tabs="tabs" v-model="activeTab" @update:modelValue="handleTabChange" />

                    <!-- Widget Controls -->
                    <VCard style="background-color: #F5F5F5;">
                         <VCardText>
                              <div class="d-flex justify-space-between align-center mb-6">
                                   <VChip size="large" color="#404040">
                                        {{ cards.length }} Widgets
                                   </VChip>
                                   <div class="d-flex gap-3">
                                        <VBtn @click="saveWidgets" class="secondary-btn" variant="outlined"
                                             color="purple-darken-1" prepend-icon="mdi-content-save" rounded="xl">
                                             Save
                                        </VBtn>
                                        <VBtn color="purple-darken-1" @click="addWidgets" prepend-icon="mdi-plus"
                                             rounded="xl">
                                             Add Widgets
                                        </VBtn>
                                   </div>
                              </div>


                              <!-- Grid Stack -->
                              <div ref="grid" class="grid-stack">
                                   <div class="grid-stack-item" v-for="(card, index) in cards" :key="index"
                                        :gs-w="card.w" :gs-h="card.h" :gs-x="card.x" :gs-y="card.y" :id="index">
                                        <div class="grid-stack-item-content">
                                             <Count v-if="card.type === 'count'" :data="card" :color="card.color"
                                                  :openSetting="() => openSetting(card, index)"  :remove="() => removeWidget(index)" 
                                                 />
                                             <ChartWrapper v-else :data="card" :options="chartOptions" :height="200"
                                                  :openSetting="() => openSetting(card, index)"   :remove="() => removeWidget(index)" :chart-id="index"
                                                  :ref="'chart' + index" />
                                        </div>
                                   </div>
                              </div>
                         </VCardText>
                    </VCard>
               </VCardText>
          </VCard>
          <!-- Settings Dialog -->
          <VDialog v-model="dialog" max-width="1400" scrollable>
               <VCard>
                    <VCardTitle class="d-flex align-center justify-space-between dialog-header">
                         <span class="text-h5">Widget Configuration</span>
                         <VBtn icon="mdi-close" variant="text" @click="dialog = false" />
                    </VCardTitle>

                    <VDivider />

                    <VCardText class="pa-0" style="height: 600px;">
                         <VRow no-gutters style="height: 100%;" class="dialog-row">
                              <!-- Main Content Area -->
                              <VCol cols="12" md="8" class="pa-4 overflow-y-auto main-content-col" style="height: 100%;">
                                   <!-- Basic Settings -->
                                   <VCard elevation="0" class="mb-4 d-flex settings-card">
                                        <VCardTitle class="text-subtitle-1 pb-2">Basic Settings</VCardTitle>
                                        <VCardText>
                                             <VRow>
                                                  <VCol cols="12" md="6">
                                                       <VTextField label="Widget Title" v-model="data.title"
                                                            variant="outlined" density="comfortable"
                                                            prepend-inner-icon="mdi-format-title" />
                                                  </VCol>
                                                  <VCol cols="12" md="6">
                                                       <VSelect :items="types" label="Chart Type" v-model="data.type"
                                                            variant="outlined" density="comfortable"
                                                            prepend-inner-icon="mdi-chart-box" />
                                                  </VCol>
                                             </VRow>
                                        </VCardText>
                                   </VCard>

                                   <!-- Active Filters -->
                                   <VCard v-if="filterGroups.length > 0" elevation="0" class="mb-4">
                                        <VCardTitle class="text-subtitle-1 pb-2 d-flex filters-title">Active Filters</VCardTitle>
                                        <VCardText>
                                             <div class="d-flex flex-wrap ga-2">
                                                  <VChip v-for="(group, idx) in filterGroups" :key="idx" closable
                                                       @click:close="removeFilterGroup(idx)" color="primary"
                                                       variant="tonal">
                                                       <VIcon start icon="mdi-filter" size="small" />
                                                       Group {{ idx + 1 }} ({{ group?.filter.length +
                                                            group?.filterIn.length }})
                                                  </VChip>
                                             </div>
                                        </VCardText>
                                   </VCard>

                                   <!-- Preview -->
                                   <VCard elevation="0">
                                        <VCardTitle class="text-subtitle-1 pb-2 d-flex preview-title">Preview</VCardTitle>
                                        <VCardText>
                                             <div class="chart-preview pa-4"
                                                  style="min-height: 300px; background: #f5f5f5; border-radius: 8px;">
                                                  <Count v-if="data.type === 'count'" :data="data" :color="data.color"
                                                       :openSetting="() => { }" />
                                                  <ChartWrapper v-else :data="data" :options="chartOptions"
                                                       :openSetting="() => { }" ref="chart" />
                                             </div>
                                        </VCardText>
                                   </VCard>
                              </VCol>

                              <!-- Right Sidebar -->
                              <VCol cols="12" md="4" class="sidebar-col pa-4 overflow-y-auto"
                                   style="height: 100%;">
                                   <VTabs v-model="tab" color="primary" class="mb-4 sidebar-tabs">
                                        <VTab value="data" @click="applyFiltersIfNeeded">
                                             <VIcon start icon="mdi-database" />
                                             Data
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
                                                  <VCardTitle class="text-subtitle-2 pb-2">Data Configuration
                                                  </VCardTitle>
                                                  <VCardText>
                                                       <VAutocomplete :items="items" label="Module"
                                                            v-model="selectmodel.y.model"
                                                            @update:modelValue="getFillable" variant="outlined"
                                                            density="compact" prepend-inner-icon="mdi-database"
                                                            class="mb-3" />
                                                  </VCardText>
                                             </VCard>

                                             <!-- Field Selection (not for count) -->
                                             <VCard v-if="data.type !== 'count' && (nonRelationFields.length > 0 || modelRelations.length > 0)" elevation="0" class="mb-4">
                                                  <VCardTitle class="text-subtitle-2 pb-2">Group By Field
                                                  </VCardTitle>
                                                  <VCardText>
                                                       <!-- Regular Fields Buttons -->
                                                       <div v-if="nonRelationFields.length > 0" class="mb-4">
                                                            <div class="text-caption text-grey mb-2">Select a field to group by:</div>
                                                            <div class="d-flex flex-wrap ga-2">
                                                                 <VBtn
                                                                      v-for="field in nonRelationFields"
                                                                      :key="field.value"
                                                                      :color="selectedField === field.value && !selectedRelation ? 'primary' : 'default'"
                                                                      :variant="selectedField === field.value && !selectedRelation ? 'flat' : 'outlined'"
                                                                      size="small"
                                                                      @click="onFieldButtonClick(field)"
                                                                      class="text-capitalize"
                                                                 >
                                                                      <VIcon start icon="mdi-form-textbox" size="small" />
                                                                      {{ field.title }}
                                                                 </VBtn>
                                                            </div>
                                                       </div>

                                                       <!-- Relation Buttons -->
                                                       <div v-if="modelRelations.filter(r => r.foreign_key).length > 0">
                                                            <div class="text-caption text-grey mb-2">Or select a relation to group by:</div>
                                                            <div class="d-flex flex-wrap ga-2 mb-3">
                                                                 <VBtn
                                                                      v-for="relation in modelRelations.filter(r => r.foreign_key)"
                                                                      :key="relation.name"
                                                                      :color="selectedRelation?.name === relation.name ? 'primary' : 'default'"
                                                                      :variant="selectedRelation?.name === relation.name ? 'flat' : 'outlined'"
                                                                      size="small"
                                                                      @click="onRelationButtonClick(relation)"
                                                                      class="text-capitalize"
                                                                 >
                                                                      <VIcon start icon="mdi-link-variant" size="small" />
                                                                      {{ relation.display_name || relation.name }}
                                                                 </VBtn>
                                                            </div>
                                                       </div>

                                                       <!-- Relation Fields Selection as Buttons -->
                                                       <VExpandTransition>
                                                            <div v-if="selectedRelation && relationFields.length > 0">
                                                                 <VDivider class="mb-3" />
                                                                 <div class="text-caption text-grey mb-2">
                                                                      Select field from {{ selectedRelation.display_name || selectedRelation.name }}:
                                                                 </div>
                                                                 <div class="d-flex flex-wrap ga-2">
                                                                      <VBtn
                                                                           v-for="field in relationFields"
                                                                           :key="field"
                                                                           :color="selectmodel.x.field === field ? 'secondary' : 'default'"
                                                                           :variant="selectmodel.x.field === field ? 'flat' : 'outlined'"
                                                                           size="small"
                                                                           @click="onRelationFieldChange(field)"
                                                                           class="text-capitalize"
                                                                      >
                                                                           <VIcon start icon="mdi-form-textbox" size="small" />
                                                                           {{ formatFieldName(field) }}
                                                                      </VBtn>
                                                                 </div>
                                                            </div>
                                                       </VExpandTransition>

                                                       <!-- Loading State -->
                                                       <div v-if="loadingRelationFields" class="text-center py-2">
                                                            <VProgressCircular indeterminate color="primary" size="20" />
                                                            <span class="ml-2 text-caption">Loading fields...</span>
                                                       </div>
                                                  </VCardText>
                                             </VCard>

                                             <!-- No Fields or Relations Available -->
                                             <VAlert v-else-if="data.type !== 'count' && selectmodel.y.model && nonRelationFields.length === 0 && modelRelations.length === 0" 
                                                  type="info" variant="tonal" class="mb-4" density="compact">
                                                  No fields or relations available for grouping in this module.
                                             </VAlert>

                                             <!-- Count Widget Customization -->
                                             <template v-if="data.type === 'count'">
                                                  <VCard elevation="0" class="mb-3">
                                                       <VCardTitle class="text-subtitle-2 pb-2">Appearance</VCardTitle>
                                                       <VCardText>
                                                            <ColorSelector @colorSelected="handleColorChange" />
                                                            <MDIIconSelector @icon-selected="handleIconSelected" />
                                                       </VCardText>
                                                  </VCard>
                                             </template>
                                        </VWindowItem>

                                        <!-- Filter Tab -->
                                        <VWindowItem value="filter">
                                             <FilterVue :fields="groupFields" :or-filter="filterData"
                                                  @filter-data="updateFilterData" :entityName="entityName"
                                                  :key="'filter-' + dialogRenderKey" />

                                             <!-- Apply Filters Button -->
                                             <VCard elevation="0" class="mt-4"
                                                  v-if="filterData.length > 0 && filterData[0] && filterData[0].length > 0">
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
                         <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
                         <VBtn color="primary" variant="flat" @click="closeDialog">
                              <VIcon start icon="mdi-content-save" />
                              Save Widget
                         </VBtn>
                    </VCardActions>
               </VCard>
          </VDialog>

          <v-dialog v-model="addNewDashboard" max-width="500">
               <VCard>
                    <v-card-text>
                         <div class="form-group">
                              <!-- Field Label -->
                              <label for="Dashboard Name">
                                   Dashboard Name
                              </label>
                              <v-row dense>
                                   <v-col cols="12">
                                        <input id="name" type="text" v-model="dashboardName" class="form-control"
                                             name="name" label="Dashboard Name">
                                   </v-col>
                              </v-row>
                         </div>
                    </v-card-text>
                    <v-card-actions>
                         <v-btn text="Close" variant="plain"
                              @click="addNewDashboard = false; editDashboardData = {}"></v-btn>
                         <v-btn color="primary" text="Save" variant="tonal" @click="saveNewDashboard"></v-btn>
                    </v-card-actions>
               </VCard>


          </v-dialog>
     </VContainer>
</template>

<script>
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import ChartWrapper from './ChartWrapper.vue';
import Count from './Count.vue';
import Permission from "@/API/Permission/Permission";
import DashboardAPI from "@/API/Dashboard/Dashboard";
import FilterVue from '../../../components/FilterDiv.vue';
import MDIIconSelector from '../../../components/MDIIconSelector.vue';
import ColorSelector from '../../../components/ColorSelector.vue';
import Widget from "@/API/Widget/Widget";
import Auth from '@/API/Auth';
import TabsComponent from "@/components/TabsComponent.vue";
import modelServiceRelationMap from "@/core/data/model_service_relation_map.json";



export default {
     name: 'Dashboard',

     components: {
          ChartWrapper,
          Count,
          FilterVue,
          MDIIconSelector,
          ColorSelector,
          TabsComponent
     },
     setup() {
          // Initialize API and other required properties
          const api = new Widget(); // Initialize the API class
          const apiParams = {}; // Set API parameters for fetching related dat
          // Return properties for setup to be used in the template
          const dashboardAPI = new DashboardAPI();
          return {
               api,
               apiParams,
               dashboardAPI
          };
     },
     data() {
          const labels = [];
          const sData = [];

          return {
               dashboardName: "",
               labels,
               sData,
               filterData: [],
               groupFields: [],
               filterGroups: [],
               entityName: "",
               tab: "data",
               activeTab: "",
               addNewDashboard: false,
               newD: {},
               tabs: [


               ],

               data: {
                    title: '',
                    labels: labels,
                    data: sData,
                    type: "count",
                    icon: "mdi-progress-check",
                    w: 3,
                    h: 2,


               },
               fromData: {},
               items: [],
               fields: [],
               fieldsX: [],
               modelRelations: [], // Store relations for the selected Y model
               selectedRelation: null, // Currently selected relation button
               selectedField: null, // Currently selected regular field
               relationFields: [], // Fields from the selected relation model
               loadingRelationFields: false, // Loading state for relation fields
               types: ["count", "bar", "line",  "pie","doughnut","polarArea",  "radar" ],
               dialog: false,
               chartOptions: {
                    responsive: true,
                    maintainAspectRatio: false,
                  

               },

               cards: [
               ],

               dialogMode: '',
               queryType: "sample",

               selectmodel: {
                    y: {
                         model: "",
                         field: ""
                    },
                    x: {
                         model: "",
                         field: ""
                    }
               },
               dashboards: [],
               grid: null,
               dialogRenderKey: 0,
          };
     },

     computed: {
          // Filter out fields that are foreign keys (relations)
          nonRelationFields() {
               if (!this.fields || this.fields.length === 0) return [];
               
               // Get all foreign keys from relations
               const foreignKeys = new Set();
               if (this.modelRelations && this.modelRelations.length > 0) {
                    this.modelRelations.forEach(rel => {
                         if (rel.foreign_key) {
                              foreignKeys.add(rel.foreign_key);
                         }
                    });
               }
               
               // Return fields that are not foreign keys
               return this.fields.filter(field => !foreignKeys.has(field.value));
          }
     },

     mounted() {
          this.$nextTick(() => {
               this.initGrid();
          });
     },

     async created() {
          try {
               await this.getDashboard();
               await this.getWidgets();
               const perm = await new Permission().getAll();
               this.items = perm.map(item => item.name);
          } catch (error) {
               console.error("Error loading permissions:", error);
          }
     },

     watch: {
          tab(newTab) {
               // When switching from filter to data tab, apply filters
               if (newTab === 'data' && this.filterData.length > 0) {
                    this.$nextTick(() => {
                         this.processFilters();
                    });
               }
          }
     },

     methods: {
          async getDashboard() {
               let tabs = await this.dashboardAPI.getAll({ filter: "user_id|" + Auth.USER.id });
               tabs.push({
                    id: 'all',
                    label: `ALL`
               });
               this.tabs = tabs.map(re => ({
                    id: re.id,
                    label: re.name || re.label || ''
               }));
               if (this.activeTab == "") {
                    this.activeTab = tabs[0].id
               }

          },
          async deleteDashboard() {
               const data = this.tabs.find(a => a.id == this.activeTab);
               await this.dashboardAPI.delete(this.activeTab);
               await this.getDashboard();

          },
          editDashboard() {
               this.addNewDashboard = true;
               console.log("this.tab", this.activeTab);

               this.editDashboardData = this.tabs.find(a => a.id == this.activeTab);
               this.dashboardName = this.editDashboardData.label;


          },
          removeWidget(index) {
               console.log(index);
               console.log("this.cards", this.cards);

               this.cards.splice(index, 1);
               console.log("this.cards", this.cards);

               this.reloadGrid();

          },
          async saveNewDashboard() {
               if (this.editDashboardData?.label) {
                    await this.dashboardAPI.from({ id: this.editDashboardData.id, name: this.dashboardName });
               } else {
                    await this.dashboardAPI.from({ name: this.dashboardName, user_id: Auth.USER.id });
               }
               await this.getDashboard();
               this.addNewDashboard = false;
          },
          async handleTabChange() {
               await this.getWidgets()

          },
          async getWidgets() {
               let tab = "&&data.tab|" + this.activeTab;
               if (this.activeTab == "all")
                    tab = "";
               this.apiParams.filter = "user_id|" + Auth.USER.id + tab;
               const res = await this.api.getAll(this.apiParams);
               this.fromData = res[0];
               //  console.log("fromData",this.fromData);
               if (res.length > 0) {
                    this.cards = this.fromData.data;
                    console.log("cards", this.fromData);
                    this.reloadGrid();
                    // this.resetDataState();
               } else {
                    this.fromData = { data: [], user_id: Auth.USER.id }
                    this.cards = [];
                    this.reloadGrid();
                    this.resetDataState();
               }
          },
          saveWidgets() {
               // Sync current grid positions before saving
               this.syncGridPositions();
               console.log('Saving widgets:', this.cards);
               // Add your save logic here (e.g., API call, localStorage, etc.)
               this.fromData.data = this.cards;
               console.log("this.fromData", this.fromData);
               this.api.from(this.fromData);
          },
          initGrid() {
               this.grid = GridStack.init({
                    float: true,
                    cellHeight: '100px',
                    margin: 8,
               }, this.$refs.grid);

               // Listen for any change event (this captures both resize and move)
               this.grid.on('change', (event, items) => {
                    if (!items || items.length === 0) return;

                    items.forEach(item => {
                         const index = parseInt(item.el.id);
                         if (this.cards[index]) {
                              this.cards[index].x = item.x;
                              this.cards[index].y = item.y;
                              this.cards[index].w = item.w;
                              this.cards[index].h = item.h;

                              console.log(`Widget ${index} updated:`, {
                                   x: item.x,
                                   y: item.y,
                                   w: item.w,
                                   h: item.h
                              });
                         }
                    });
               });

               // Keep resizestop for chart reloading
               this.grid.on('resizestop', (event, element) => {
                    const index = parseInt(element.id);
                    const chartRef = this.$refs['chart' + index];
                    if (chartRef && chartRef[0]) {
                         this.$nextTick(() => {
                              // chartRef[0].reload();
                         });
                    }
               });
          },

          onWidgetResize(element) {
               const index = parseInt(element.id);
               const gridNode = element.gridstackNode;

               if (this.cards[index]) {
                    this.cards[index].w = gridNode.w;
                    this.cards[index].h = gridNode.h;
                    this.cards[index].x = gridNode.x;
                    this.cards[index].y = gridNode.y;

                    console.log(`Widget ${index} resized:`, {
                         w: gridNode.w,
                         h: gridNode.h,
                         x: gridNode.x,
                         y: gridNode.y
                    });

                    // Trigger chart reload if needed
                    const chartRef = this.$refs['chart' + index];
                    if (chartRef && chartRef[0]) {
                         this.$nextTick(() => {
                              // chartRef[0].reload();
                         });
                    }
               }
          },

          onWidgetMove(element) {
               const index = parseInt(element.id);
               const gridNode = element.gridstackNode;

               if (this.cards[index]) {
                    this.cards[index].x = gridNode.x;
                    this.cards[index].y = gridNode.y;

                    console.log(`Widget ${index} moved:`, {
                         x: gridNode.x,
                         y: gridNode.y
                    });
               }
          },

          onWidgetChange(items) {
               // This fires for any grid change (batch updates)
               if (!items || items.length === 0) return;

               items.forEach(item => {
                    const index = parseInt(item.el.id);
                    if (this.cards[index]) {
                         this.cards[index].x = item.x;
                         this.cards[index].y = item.y;
                         this.cards[index].w = item.w;
                         this.cards[index].h = item.h;
                    }
               });

               console.log('Grid changed, cards updated:', this.cards);
          },

          syncGridPositions() {
               // Manually sync all current positions from grid to cards
               if (!this.grid) return;

               this.grid.engine.nodes.forEach(node => {
                    const index = parseInt(node.el.id);
                    if (this.cards[index]) {
                         this.cards[index].x = node.x;
                         this.cards[index].y = node.y;
                         this.cards[index].w = node.w;
                         this.cards[index].h = node.h;
                         this.cards[index].tab = this.activeTab;
                    }
               });
          },



          async reloadGrid() {
               if (this.grid) {
                    this.grid.destroy(false);
                    this.grid = null;
               }
               await this.$nextTick();
               this.initGrid();
          },

          closeFilter() {
               console.log("closeFilter called, filterData:", this.filterData);

               if (!this.filterData || this.filterData.length === 0) {
                    this.filterGroups = [];
                    this.getData();
                    return;
               }

               let filterGroups = [];

               this.filterData.forEach(fil => {
                    // Skip empty filter groups
                    if (!fil || fil.length === 0) return;

                    let groupObj = {
                         filter: [],
                         filterIn: []
                    };

                    fil.forEach(group => {
                         let value = group.value;
                         let type = group.field.type;

                         // Convert field types to standard types
                         if (['text', 'textarea', 'email', 'options', 'flexibleOptions', 'client_list', 'user_list'].includes(group.field.type)) {
                              type = 'string';
                         }

                         // Handle different operator types
                         if (group.operator.value === 'not_like') {
                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: "/" + value + "/i",
                                   type: "string",
                                   operator: 'not regexp'
                              });
                         } else if (['starts_with', 'ends_with', 'like'].includes(group.operator.value)) {
                              // Format value based on the operator
                              if (group.operator.value === "like") {
                                   value = "%" + group.value + "%";
                              } else if (group.operator.value === "starts_with") {
                                   value = group.value + "%";
                              } else {
                                   value = "%" + group.value;
                              }

                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: value,
                                   type: "string",
                                   operator: "like"
                              });
                         } else if (group.operator.value === 'in') {
                              groupObj.filterIn.push({
                                   field: group.field.name,
                                   values: Array.isArray(value) ? value : [value],
                                   type: "string"
                              });
                         } else {
                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: value,
                                   type: type,
                                   operator: group.operator.value
                              });
                         }
                    });

                    // Only add group if it has filters
                    if (groupObj.filter.length > 0 || groupObj.filterIn.length > 0) {
                         filterGroups.push(groupObj);
                    }
               });

               console.log("Generated filterGroups:", filterGroups);
               this.filterGroups = filterGroups;

               // Switch to data tab and force data refresh
               this.tab = 'data';
               this.$nextTick(() => {
                    this.getData();
               });
          },

          updateFilterData(filterData) {
               console.log("updateFilterData called with:", filterData);
               this.filterData = filterData;

               if (filterData.length === 0 || (filterData.length === 1 && filterData[0].length === 0)) {
                    console.log("Clearing filters");
                    this.filterData = [];
                    this.filterGroups = [];
                    // Refresh data with empty filters
                    this.getData();
               }

               // Don't auto-apply here, wait for user to switch tabs or click apply
          },

          removeFilterGroup(index) {
               this.filterGroups.splice(index, 1);
               this.filterData.splice(index, 1);
               this.getData();
          },

          applyFiltersIfNeeded() {
               console.log("applyFiltersIfNeeded called");
               console.log("Current filterData:", this.filterData);

               // Apply filters when switching back to data tab
               if (this.filterData && this.filterData.length > 0 && this.filterData[0] && this.filterData[0].length > 0) {
                    console.log("Applying filters...");
                    // Don't switch tabs here, just process filters
                    const currentTab = this.tab;
                    this.processFilters();
                    this.tab = currentTab;
               } else {
                    console.log("No filters to apply");
               }
          },

          processFilters() {
               // Process filters without switching tabs
               if (!this.filterData || this.filterData.length === 0) {
                    this.filterGroups = [];
                    this.getData();
                    return;
               }

               let filterGroups = [];

               this.filterData.forEach(fil => {
                    if (!fil || fil.length === 0) return;

                    let groupObj = {
                         filter: [],
                         filterIn: []
                    };

                    fil.forEach(group => {
                         let value = group.value;
                         let type = group.field.type;

                         if (['text', 'textarea', 'email', 'options', 'flexibleOptions', 'client_list', 'user_list'].includes(group.field.type)) {
                              type = 'string';
                         }

                         if (group.operator.value === 'not_like') {
                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: "/" + value + "/i",
                                   type: "string",
                                   operator: 'not regexp'
                              });
                         } else if (['starts_with', 'ends_with', 'like'].includes(group.operator.value)) {
                              if (group.operator.value === "like") {
                                   value = "%" + group.value + "%";
                              } else if (group.operator.value === "starts_with") {
                                   value = group.value + "%";
                              } else {
                                   value = "%" + group.value;
                              }

                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: value,
                                   type: "string",
                                   operator: "like"
                              });
                         } else if (group.operator.value === 'in') {
                              groupObj.filterIn.push({
                                   field: group.field.name,
                                   values: Array.isArray(value) ? value : [value],
                                   type: "string"
                              });
                         } else {
                              groupObj.filter.push({
                                   field: group.field.name,
                                   value: value,
                                   type: type,
                                   operator: group.operator.value
                              });
                         }
                    });

                    if (groupObj.filter.length > 0 || groupObj.filterIn.length > 0) {
                         filterGroups.push(groupObj);
                    }
               });

               this.filterGroups = filterGroups;
               this.$nextTick(() => {
                    this.getData();
               });
          },

          handleIconSelected(iconName) {
               this.data.icon = iconName;
          },

          handleColorChange(color) {
               this.data.color = color;
          },

          formatFieldName(field) {
               if (!field) return '';
               return field
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
          },

          async getFillable() {
               this.fields = [];
               this.modelRelations = []; // Store relations for later use

               try {
                    const model = await this.loadFile(this.selectmodel.y.model);
                    let rawFields = [];
                    
                    // Check if fillable is a method or property
                    if (typeof model.fillable === 'function') {
                         const res = await model.fillable();
                         rawFields = [...res];
                    } else if (Array.isArray(model.fillable)) {
                         rawFields = [...model.fillable];
                    } else {
                         console.warn(`Model ${this.selectmodel.y.model} does not have fillable method or property`);
                         rawFields = [];
                    }
                    
                    // Get model config for relations
                    let modelConfig = modelServiceRelationMap.Models[this.selectmodel.y.model];
                    
                    // Try to find model with different casing if not found
                    if (!modelConfig) {
                         const modelKeys = Object.keys(modelServiceRelationMap.Models);
                         const matchingKey = modelKeys.find(key => 
                              key.toLowerCase() === this.selectmodel.y.model.toLowerCase()
                         );
                         if (matchingKey) {
                              modelConfig = modelServiceRelationMap.Models[matchingKey];
                         }
                    }
                    
                    // Create a map of foreign_key -> relation for quick lookup
                    const foreignKeyToRelation = {};
                    if (modelConfig && modelConfig.relations) {
                         this.modelRelations = modelConfig.relations;
                         modelConfig.relations.forEach(relation => {
                              if (relation.foreign_key) {
                                   foreignKeyToRelation[relation.foreign_key] = relation;
                              }
                         });
                    } else {
                         this.modelRelations = [];
                    }
                    
                    // Transform fields to objects with title and value
                    // For foreign keys, show relation display_name or name instead
                    this.fields = rawFields.map(field => {
                         const relation = foreignKeyToRelation[field];
                         if (relation) {
                              return {
                                   title: relation.display_name || relation.name,
                                   value: field
                              };
                         }
                         return {
                              title: field,
                              value: field
                         };
                    });
                    
                    // Add any foreign keys from relations that are not already in fields
                    if (modelConfig && modelConfig.relations) {
                         modelConfig.relations.forEach(relation => {
                              if (relation.foreign_key && !rawFields.includes(relation.foreign_key)) {
                                   this.fields.push({
                                        title: relation.display_name || relation.name,
                                        value: relation.foreign_key
                                   });
                              }
                         });
                    }
                    
                    await this.loadFromFields(this.selectmodel.y.model);
               } catch (error) {
                    console.error("Error loading fillable fields:", error);
                    this.fields = [];
               }
          },

          async getFillableX() {
               this.fieldsX = [];

               try {
                    const model = await this.loadFile(this.selectmodel.x.model);
                    
                    // Check if fillable is a method or property
                    if (typeof model.fillable === 'function') {
                         const res = await model.fillable();
                         this.fieldsX = res;
                    } else if (Array.isArray(model.fillable)) {
                         this.fieldsX = model.fillable;
                    } else {
                         console.warn(`Model ${this.selectmodel.x.model} does not have fillable method or property`);
                         this.fieldsX = [];
                    }
               } catch (error) {
                    console.error("Error loading X-axis fields:", error);
                    this.fieldsX = [];
               }
          },

          async onYFieldChange(selectedField) {
               // Check if the selected field is a foreign key for a relation
               if (this.modelRelations.length > 0) {
                    const relation = this.modelRelations.find(rel => rel.foreign_key === selectedField);
                    
                    if (relation && relation.model) {
                         // Determine queryType based on relation type
                         // manyToMany or belongsToMany -> sample
                         // belongsTo, hasOne, hasMany -> group
                         if (relation.type === 'manyToMany' || relation.type === 'belongsToMany') {
                              this.queryType = 'sample';
                         } else {
                              this.queryType = 'group';
                              
                              // Auto-select the relation model in X-axis
                              this.selectmodel.x.model = relation.model;
                              
                              // Get fillable fields for X model
                              await this.getFillableX();
                              
                              // Set the default_field from model_service_relation_map
                              const xModelConfig = modelServiceRelationMap.Models[relation.model];
                              if (xModelConfig && xModelConfig.default_field) {
                                   this.selectmodel.x.field = xModelConfig.default_field;
                              }
                              
                              // Trigger data refresh
                              await this.getDataX();
                         }
                    } else {
                         // Regular field (not a relation) -> group
                         this.queryType = 'group';
                    }
               } else {
                    // No relations defined -> group
                    this.queryType = 'group';
               }
          },

          async onFieldButtonClick(field) {
               // Toggle selection if clicking the same field
               if (this.selectedField === field.value) {
                    this.selectedField = null;
                    this.selectmodel.y.field = '';
                    this.selectmodel.x.field = '';
                    this.selectmodel.x.model = '';
                    return;
               }

               // Clear relation selection when selecting a regular field
               this.selectedRelation = null;
               this.relationFields = [];
               
               // Set the selected field
               this.selectedField = field.value;
               this.selectmodel.y.field = field.value;
               this.selectmodel.x.field = field.value;
               this.selectmodel.x.model = this.selectmodel.y.model;
               this.queryType = 'group';
               
               // Trigger data refresh
               await this.$nextTick();
               this.getData();
          },

          async onRelationButtonClick(relation) {
               // Clear field selection when selecting a relation
               this.selectedField = null;
               
               // Toggle selection if clicking the same relation
               if (this.selectedRelation?.name === relation.name) {
                    this.selectedRelation = null;
                    this.relationFields = [];
                    this.selectmodel.y.field = '';
                    this.selectmodel.x.model = '';
                    this.selectmodel.x.field = '';
                    return;
               }

               this.selectedRelation = relation;
               this.loadingRelationFields = true;
               this.relationFields = [];

               try {
                    // Set the Y field to the foreign key of this relation
                    this.selectmodel.y.field = relation.foreign_key;
                    
                    // Set queryType based on relation type
                    if (relation.type === 'manyToMany' || relation.type === 'belongsToMany') {
                         this.queryType = 'sample';
                    } else {
                         this.queryType = 'group';
                    }

                    // Load fields from the related model
                    const model = await this.loadFile(relation.model);
                    let fields = [];
                    
                    if (typeof model.fillable === 'function') {
                         fields = await model.fillable();
                    } else if (Array.isArray(model.fillable)) {
                         fields = [...model.fillable];
                    }
                    
                    // Get foreign keys from the related model's relations to filter them out
                    const relatedModelConfig = modelServiceRelationMap.Models[relation.model];
                    const foreignKeys = new Set();
                    if (relatedModelConfig && relatedModelConfig.relations) {
                         relatedModelConfig.relations.forEach(rel => {
                              if (rel.foreign_key) {
                                   foreignKeys.add(rel.foreign_key);
                              }
                         });
                    }
                    
                    // Filter out foreign key fields - only show actual data fields
                    this.relationFields = fields.filter(field => !foreignKeys.has(field));
                    
                    // Set X-axis model
                    this.selectmodel.x.model = relation.model;
                    
                    // Auto-select default field if available
                    const modelConfig = modelServiceRelationMap.Models[relation.model];
                    if (modelConfig && modelConfig.default_field) {
                         this.selectmodel.x.field = modelConfig.default_field;
                    } else if (this.relationFields.length > 0) {
                         // If no default field, select the first available field
                         this.selectmodel.x.field = this.relationFields[0];
                    }
                    
                    // Use nextTick to ensure state is updated before triggering data refresh
                    await this.$nextTick();
                    this.getData();
               } catch (error) {
                    console.error("Error loading relation fields:", error);
                    this.relationFields = [];
               } finally {
                    this.loadingRelationFields = false;
               }
          },

          onRelationFieldChange(field) {
               // Update X field and refresh data
               this.selectmodel.x.field = field;
               this.getData();
          },

          openSetting(data, chartId) {
               this.dialog = true;
               this.dialogMode = 'edit';
               // Deep clone to avoid mutating original data
               this.data = JSON.parse(JSON.stringify(data));
               console.log(" this.data", this.data);

               // Deep clone selectmodel to avoid shared references
               this.selectmodel = JSON.parse(JSON.stringify(data.selectmodel || { y: { model: '', field: '' }, x: { model: '', field: '' } }));
               this.queryType = data.queryType || 'sample';
               this.data.index = chartId;

               // Reset filters when opening existing widget
               // Load existing filters if they exist in the widget data

               this.filterData = data.filterData ? JSON.parse(JSON.stringify(data.filterData)) : [[]];
               this.filterGroups = data.filterGroups ? JSON.parse(JSON.stringify(data.filterGroups)) : [];
               console.log(this.filterData, this.filterGroups, "this.filterGroups");

               // Restore selected relation and fields if editing
               this.selectedRelation = null;
               this.relationFields = [];
               
               // Load model relations and restore selection
               if (this.selectmodel.y.model) {
                    this.getFillable().then(() => {
                         // Find and select the relation that matches the Y field
                         if (this.selectmodel.y.field && this.modelRelations.length > 0) {
                              const relation = this.modelRelations.find(rel => rel.foreign_key === this.selectmodel.y.field);
                              if (relation) {
                                   this.onRelationButtonClick(relation);
                              }
                         }
                    });
               }

               this.dialogRenderKey++; // Force re-render of filter component
          },

          async getData() {
               this.data.queryType = "";
               console.log("getData called");
               console.log("selectmodel.y.model:", this.selectmodel.y.model);
               console.log("filterGroups:", this.filterGroups);

               if (!this.selectmodel.y.model) {
                    console.log("No model selected, returning");
                    return;
               }

               try {
                    // const model = await this.loadFile(this.selectmodel.y.model);
                    let query = { filterGroups: this.filterGroups };

                    console.log("Query being sent:", query);
                    this.data.selectmodel = this.selectmodel;
                    this.data.filterGroups = this.filterGroups
                    if (this.data.type === 'count') {
                         return;
                    }
                    if (this.queryType === 'sample') { this.data.queryType = 'sample' }



               } catch (error) {
                    console.error("Error getting data:", error);
               }
          },

          async getDataX() {
               if (!this.selectmodel.x.model || !this.data.labels?.length) return;
               this.data.selectmodel = this.selectmodel;
               this.data.filterGroups = this.filterGroups
          },

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
                         fromFieldsNew: [],
                         fromFieldsEdit: [],
                         required: { password: 'required' },
                         newItem: { id: '' },
                         selectedItem: {},
                         jobsList: [],
                         positionsList: [],
                    };

                    if (Module.created) {
                         await Module.created.call(mockContext);
                    }

                    // Try to get fields from different possible property names
                    this.groupFields = mockContext.fromFields || mockContext.fromFieldsNew || [];
               } catch (error) {
                    console.error("Error loading form fields:", error);
               }
          },

          onWidgetResize(widgetId) {
               const chartRef = this.$refs['chart' + widgetId];
               if (chartRef && chartRef[0]) {
                    // chartRef[0].reload();
               }
          },

          closeDialog() {
               if (this.dialogMode === 'edit') {
                    const chartRef = this.$refs['chart' + this.data.index];
                    if (chartRef && chartRef[0]) {
                         // chartRef[0].reload();
                    }
                    // Update the card in the array and save filter data
                    const index = this.data.index;
                    if (index !== undefined && this.cards[index]) {
                         this.cards[index] = {
                              ...this.data,
                              filterData: this.filterData,
                              filterGroups: this.filterGroups
                         };
                    }
               } else if (this.dialogMode === 'new') {
                    this.cards.push({
                         ...this.data,

                         filterData: this.filterData,
                         filterGroups: this.filterGroups
                    });
               }

               this.reloadGrid();
               this.resetDataState();
               this.dialog = false;
          },

          addWidgets() {
               this.resetDataState();
               this.dialog = true;
               this.dialogMode = 'new';
               this.dialogRenderKey++; // Force re-render with empty filters
          },

          resetDataState() {
               this.data = {
                    title: '',
                    labels: this.labels,
                    data: this.sData,
                    type: "count",
                    icon: "mdi-progress-check",
                    w: 3,
                    h: 2,
               };
               this.selectmodel = {
                    y: { model: "", field: "" },
                    x: { model: "", field: "" }
               };
               this.modelRelations = [];
               this.selectedRelation = null;
               this.selectedField = null;
               this.relationFields = [];
               this.loadingRelationFields = false;
               this.filterData = [[]];
               this.filterGroups = [];
               this.tab = "data";
               this.groupFields = [];
               this.entityName = "";
          },
     },
};
</script>

<style scoped>
.secondary-btn {
     text-transform: capitalize !important;
     border: 2px solid #8e24aa !important;
}

.grid-stack-item-content {
     background: #fff;
     border-radius: 8px;
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
     overflow: hidden;
}

.grid-stack {
     min-height: 500px;
     padding: 0;
     background-color: transparent;

}

.widget {
     min-height: 100%;
     /* border-radius: 16px; */
     background-color: transparent;
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

     /* background-color: #fff; */
     /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.chart-preview {
     transition: all 0.3s ease;
}

/* ===== RTL Support Styles ===== */

/* Main Dashboard Header */
[dir="rtl"] .dashboard-header {
     flex-direction: row-reverse;
}

/* Dialog Header */
[dir="rtl"] .dialog-header {
     flex-direction: row-reverse;
}

/* Dialog Row - Reverse columns order */
[dir="rtl"] .dialog-row {
     flex-direction: row-reverse;
}

/* Sidebar Column */
[dir="rtl"] .sidebar-col {
     border-left: none !important;
     border-right: 1px solid rgba(0, 0, 0, 0.12) !important;
     background-color: #fafafa;
}

/* LTR Sidebar border */
[dir="ltr"] .sidebar-col,
:not([dir="rtl"]) .sidebar-col {
     border-left: 1px solid rgba(0, 0, 0, 0.12);
     border-right: none;
     background-color: #fafafa;
}

/* Settings Card */
[dir="rtl"] .settings-card {
     flex-direction: row-reverse;
}

/* Filters Title */
[dir="rtl"] .filters-title {
     flex-direction: row-reverse;
}

/* Preview Title */
[dir="rtl"] .preview-title {
     flex-direction: row-reverse;
}

/* Sidebar Tabs */
[dir="rtl"] .sidebar-tabs {
     direction: rtl;
}

/* Form Controls */
[dir="rtl"] .form-group,
[dir="rtl"] .form-control {
     text-align: end;
}

/* Tabs Content */
[dir="rtl"] .v-slide-group__content {
     flex-direction: row-reverse !important;
}

/* Search Input */
[dir="rtl"] .search-input {
     text-align: end !important;
}

/* V-Card Titles */
[dir="rtl"] .v-card-title {
     text-align: right;
}

/* V-Card Text */
[dir="rtl"] .v-card-text {
     text-align: right;
}

/* V-Card Actions */
[dir="rtl"] .v-card-actions {
     flex-direction: row-reverse;
}

/* Flex gap elements */
[dir="rtl"] .gap-3 {
     flex-direction: row-reverse;
}

/* Chips wrapper */
[dir="rtl"] .ga-2 {
     flex-direction: row-reverse;
}

/* Radio Group */
[dir="rtl"] .v-radio-group {
     direction: rtl;
}

/* Text Fields and Selects */
[dir="rtl"] .v-text-field,
[dir="rtl"] .v-select,
[dir="rtl"] .v-autocomplete {
     direction: rtl;
}

/* Select Field RTL */
[dir="rtl"] .v-select .v-field {
     flex-direction: row-reverse;
}

[dir="rtl"] .v-select .v-field__input {
     text-align: right;
}

[dir="rtl"] .v-select .v-field__append-inner {
     margin-left: 0;
     margin-right: auto;
}

[dir="rtl"] .v-select .v-field__prepend-inner {
     order: 2;
     margin-left: 8px;
     margin-right: 0;
}

/* Select Menu/Dropdown RTL */
[dir="rtl"] .v-select__menu-icon {
     margin-left: 0;
     margin-right: -4px;
}

/* Autocomplete RTL */
[dir="rtl"] .v-autocomplete .v-field {
     flex-direction: row-reverse;
}

[dir="rtl"] .v-autocomplete .v-field__input {
     text-align: right;
}

/* TextField RTL */
[dir="rtl"] .v-text-field .v-field {
     flex-direction: row-reverse;
}

[dir="rtl"] .v-text-field .v-field__input {
     text-align: right;
}

/* Labels RTL */
[dir="rtl"] .v-label {
     right: 12px !important;
     left: auto !important;
     transform-origin: right top;
}

[dir="rtl"] .v-field--variant-outlined .v-label {
     right: 12px !important;
     left: auto !important;
}

/* Input prepend icons position swap */
[dir="rtl"] .v-field__prepend-inner {
     margin-right: 0;
     margin-left: 8px;
}

/* GridStack RTL Support */
[dir="rtl"] .grid-stack {
     direction: rtl;
}

[dir="rtl"] .grid-stack > .grid-stack-item {
     direction: rtl;
}

/* Dialog content alignment */
[dir="rtl"] .v-dialog .v-card {
     text-align: right;
}

/* Button icons in RTL */
[dir="rtl"] .v-btn .v-icon--start {
     margin-right: 0;
     margin-left: 8px;
}

[dir="rtl"] .v-btn .v-icon--end {
     margin-left: 0;
     margin-right: 8px;
}

/* Chip close button */
[dir="rtl"] .v-chip .v-chip__close {
     margin-right: 8px;
     margin-left: 0;
}

/* Tab icons */
[dir="rtl"] .v-tab .v-icon--start {
     margin-right: 0;
     margin-left: 8px;
}
</style>