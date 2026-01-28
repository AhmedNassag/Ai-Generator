<template>
     <VCard class="filter-container" elevation="0">
          <!-- Main Filter View -->
          <VCardText v-if="mode === ''">
               <VRow v-for="(filterData, orIndex) in localOrFilter" :key="orIndex" class="mb-4">
                    <VCol cols="12">
                         <!-- Group Header -->
                         <div class="d-flex align-center justify-space-between mb-3">
                              <VChip color="primary" variant="tonal" size="small">
                                   <VIcon start icon="mdi-filter" size="small" />
                                   Group {{ orIndex + 1 }}
                              </VChip>
                              <VBtn icon="mdi-delete" size="small" variant="text" color="error"
                                   @click="deleteFilter(orIndex)" />
                         </div>

                         <!-- Filter Cards -->
                         <VRow>
                              <VCol v-for="(filter, index) in filterData" :key="index" cols="12">
                                   <VCard class="filter-card"                    @click="openFilter(orIndex, filter)"
                                   elevation="1">
                                        <VCardText>
                                             <div class="d-flex justify-space-between align-center mb-2">
                                                  <VChip size="x-small" color="secondary" variant="flat">
                                                       {{ filter.field.label }}
                                                  </VChip>
                                                  <VBtn icon="mdi-close" size="x-small" variant="text"
                                                       @click.stop="deleteFilter(orIndex, index)" />
                                             </div>
                                             <div class="text-body-2 font-weight-medium">
                                                  {{ getText(filter) }}
                                             </div>
                                        </VCardText>
                                   </VCard>
                              </VCol>
                         </VRow>

                         <!-- Add AND Button -->
                         <VBtn color="primary" variant="outlined" class="mt-3" @click="setNewFilter(orIndex)">
                              <VIcon start icon="mdi-plus" />
                              Add AND condition
                         </VBtn>

                         <!-- OR Divider -->
                         <VDivider class="my-6">
                              <template v-slot:default>
                                   <VChip color="primary" size="small">OR</VChip>
                              </template>
                         </VDivider>
                    </VCol>
               </VRow>

               <!-- Add New Group Button -->
               <div class="text-center mt-6">
                    <VBtn color="primary" variant="tonal" @click="addNewOr" size="large">
                         <VIcon start icon="mdi-plus-circle" />
                         Add Filter Group
                    </VBtn>
               </div>
          </VCardText>

          <!-- Edit/New Filter View -->
          <VCardText v-if="mode === 'edit' || mode === 'new'">
               <!-- Selected Field View -->
               <template v-if="selectedField.name">
                    <VCard elevation="2" class="mb-4">
                         <VCardText>
                              <div class="d-flex justify-space-between align-center mb-4">
                                   <VChip color="primary" variant="tonal">
                                        {{ selectedField.label }}
                                   </VChip>
                                   <div>
                                        <VBtn icon="mdi-arrow-left" variant="text" size="small"
                                             @click="backToFieldSelection" />
                                        <VBtn icon="mdi-delete" variant="text" size="small" color="error"
                                             @click="clearSelection" />
                                   </div>
                              </div>

                              <!-- Operator Select -->
                              <VSelect v-model="selectedOperator" :items="getOperators(selectedField.type)"
                                   item-title="label" item-value="value" label="Operator" variant="outlined"
                                   density="compact" return-object class="mb-3"
                                   @update:modelValue="changeOperator(selectedOperator)" />
                              {{ this.isMultiple }}
                              <!-- Value Input Based on Field Type -->
                              <component :is="getInputComponent(selectedField.type)"
                                   v-bind="getInputProps(selectedField)" v-model="filterValue" :multiple="isMultiple" />

                              <!-- Apply Button -->
                              <VBtn color="primary" block class="mt-4" @click="applyFilter"
                                   :disabled="!filterValue || !selectedOperator.value">
                                   Apply Filter
                              </VBtn>
                         </VCardText>
                    </VCard>
               </template>

               <!-- Field Selection View -->
               <template v-else>
                    <div class="mb-4">
                         <VChip color="primary" variant="tonal" class="mb-2">
                              Add filter to Group {{ orIndexSelected + 1 }}
                         </VChip>
                    </div>

                    <!-- Search -->
                    <VTextField v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Search properties"
                         variant="outlined" density="compact" clearable class="mb-4" />

                    <!-- Category Title -->
                    <div class="text-subtitle-1 font-weight-bold mb-3">
                         {{ entityName }} Fields
                    </div>

                    <!-- Property List -->
                    <VList density="compact">
                         <VListItem v-for="field in filteredFields" :key="field.name" @click="addFilter(field)"
                              v-show="!field.hidden" class="property-list-item">
                              <template v-slot:prepend>
                                   <VIcon :icon="getFieldIcon(field.type)" color="primary" />
                              </template>
                              <VListItemTitle>{{ field.label }}</VListItemTitle>
                         </VListItem>
                    </VList>
               </template>
          </VCardText>
     </VCard>
</template>

<script>
import Auth from "@/API/Auth";
import User from "@/API/User/User";

export default {
     name: "FilterDive",

     props: {
          fields: {
               type: Array,
               default: () => [],
          },
          entityName: {
               type: String,
               default: "",
          },
          orFilter: {
               type: Array,
               default: () => [],
          },
     },

     emits: ['filter-data'],

     created() {
          // Initialize localOrFilter from prop
          if (this.orFilter && this.orFilter.length > 0 && this.orFilter[0].length > 0) {
               this.localOrFilter = JSON.parse(JSON.stringify(this.orFilter));
          } else {
               this.localOrFilter = [];
          }
     },

     data() {
          return {
               userApi: new User(),
               localOrFilter: [],
               clients: Auth.CLIENTS ? Auth.CLIENTS.map((client) => ({
                    id: client.id,
                    name: client.name,
                    value: client.id,
                    label: client.name,
               })) : [],
               users: [],
               mode: "",

               // Operators
               numberOperators: [
                    { value: "=", label: "is equal to" },
                    { value: "!=", label: "is not equal to" },
                    { value: ">", label: "is greater than" },
                    { value: "<", label: "is less than" },
                    { value: ">=", label: "is greater than or equal to" },
                    { value: "<=", label: "is less than or equal to" },
               ],
               stringOperators: [
                    { value: "=", label: "is equal to" },
                    { value: "!=", label: "is not equal to" },
                    { value: "like", label: "contains" },
                    { value: "not_like", label: "does not contain" },
                    { value: "starts_with", label: "starts with" },
                    { value: "ends_with", label: "ends with" },
               ],
               dateOperators: [
                    { value: "=", label: "is on" },
                    { value: "!=", label: "is not on" },
                    { value: ">", label: "is after" },
                    { value: "<", label: "is before" },
                    { value: "between", label: "is between" },
               ],
               booleanOperators: [
                    { value: "=", label: "is" },
                    { value: "!=", label: "is not" },
               ],
               optionsOperators: [
                    { value: "=", label: "is" },
                    { value: "!=", label: "is not" },
                    { value: "in", label: "is in" },
                    { value: "nin", label: "is not in" },
               ],

               // Filter state
               searchQuery: "",
               selectedField: {},
               selectedOperator: {},
               filterValue: null,
               selectedFilter: null,
               orIndexSelected: 0,
               editingFilterIndex: null,
               isMultiple: false,
          };
     },

     computed: {
          filteredFields() {
               return this.fields.filter(field =>
                    field.label.toLowerCase().includes(this.searchQuery.toLowerCase())
               );
          },
     },

     watch: {
          orFilter: {
               handler(newVal) {
                    // Only update if different to avoid infinite loop
                    if (JSON.stringify(newVal) !== JSON.stringify(this.localOrFilter)) {
                         this.localOrFilter = JSON.parse(JSON.stringify(newVal));
                    }
               },
               deep: true,
               immediate: true,
          },
     },

     methods: {
          changeOperator(operator) {
               this.isMultiple = false;
               if (['nin', 'in'].includes(operator.value)) {
                    this.isMultiple = true;
               }

          },
          emitFilterData() {
               // Debounce emit to prevent recursive updates
               this.$emit('filter-data', JSON.parse(JSON.stringify(this.localOrFilter)));
          },

          getText(filter) {
               let value = filter.value;

               if (filter.field.type === 'options') {
                    const option = filter.field.options.find(a => a.id === value);
                    value = option ? option.name : value;
               } else if (filter.field.type === 'flexibleOptions') {
                    const option = filter.field.options.find(a => a.value === value);
                    value = option ? option.label : value;
               } else if (filter.field.type === 'user_list') {
                    const user = this.users.find(a => a.id === value);
                    value = user ? user.name : value;
               } else if (filter.field.type === 'client_list') {
                    const client = this.clients.find(a => a.value === value);
                    value = client ? client.name : value;
               } else if (filter.field.type === 'date') {
                    value = new Date(value).toLocaleDateString();
               } else if (filter.field.type === 'boolean') {
                    value = value === 'true' ? (filter.field.trueLabel || 'True') : (filter.field.falseLabel || 'False');
               }

               return `${filter.operator.label} "${value}"`;
          },

          getFieldIcon(type) {
               const iconMap = {
                    text: 'mdi-text',
                    textarea: 'mdi-text',
                    email: 'mdi-email',
                    number: 'mdi-numeric',
                    date: 'mdi-calendar',
                    options: 'mdi-format-list-bulleted',
                    flexibleOptions: 'mdi-format-list-bulleted',
                    user_list: 'mdi-account-group',
                    client_list: 'mdi-domain',
                    boolean: 'mdi-check-circle',
               };
               return iconMap[type] || 'mdi-text-search';
          },

          getInputComponent(type) {
               if (['options', 'boolean'].includes(type)) return 'VSelect';
               if (['flexibleOptions'].includes(type)) return 'VAutocomplete';
               return 'VTextField';
          },

          getInputProps(field) {
               const baseProps = {
                    label: 'Value',
                    variant: 'outlined',
                    density: 'compact',
               };

               if (field.type === 'options') {
                    return {
                         ...baseProps,
                         items: field.options,
                         itemTitle: 'name',
                         itemValue: field.options[0]?.id !== undefined ? 'id' : 'value',
                    };
               }

               if (field.type === 'boolean') {
                    return {
                         ...baseProps,
                         items: [
                              { title: field.trueLabel || 'True', value: 'true' },
                              { title: field.falseLabel || 'False', value: 'false' },
                         ],
                    };
               }

               if (field.type === 'flexibleOptions') {
                    return {
                         ...baseProps,
                         items: field.options,
                         itemTitle: 'label',
                         itemValue: 'value',
                    };
               }

               if (field.type === 'user_list') {
                    // You'll need to implement UsersDropdown as a Vuetify component
                    return baseProps;
               }

               if (field.type === 'client_list') {
                    return {
                         ...baseProps,
                         items: this.clients,
                         itemTitle: 'name',
                         itemValue: 'value',
                    };
               }

               if (field.type === 'number') {
                    return { ...baseProps, type: 'number' };
               }

               if (field.type === 'date') {
                    return { ...baseProps, type: 'date' };
               }

               return { ...baseProps, type: 'text' };
          },

          addNewOr() {
               this.localOrFilter.push([]);
               this.orIndexSelected = this.localOrFilter.length - 1;
               this.emitFilterData();
               this.setNewFilter(this.orIndexSelected);
          },

          openFilter(orIndex, filter) {
               this.orIndexSelected = orIndex;
               this.selectedField = filter.field;
               this.selectedFilter = filter;
               this.filterValue = filter.value;
               this.selectedOperator = filter.operator;
               this.editingFilterIndex = this.localOrFilter[orIndex].indexOf(filter);
               if (['nin', 'in'].includes(filter.operator.value)) {
                    this.isMultiple = true;
               }
               this.mode = "edit";
          },

          async addFilter(field) {
               this.selectedField = field;

               if (field.type === "options" && typeof field.options === 'string') {
                    try {
                         const model = await this.loadFile(field.options);
                         const res = await model.getAll({ select: "id|name" });
                         this.selectedField.options = res;
                    } catch (error) {
                         console.error("Error loading options:", error);
                    }
               }
          },

          applyFilter() {
               if (!this.filterValue || !this.selectedOperator.value) return;

               const filterObj = {
                    field: this.selectedField,
                    value: this.filterValue,
                    operator: this.selectedOperator,
                    isHover: false,
               };

               if (this.mode === "edit" && this.editingFilterIndex !== null) {
                    // Update existing filter
                    this.localOrFilter[this.orIndexSelected][this.editingFilterIndex] = filterObj;
               } else {
                    // Add new filter
                    if (!this.localOrFilter[this.orIndexSelected]) {
                         this.localOrFilter[this.orIndexSelected] = [];
                    }
                    this.localOrFilter[this.orIndexSelected].push(filterObj);
               }

               this.emitFilterData();
               this.resetFilterState();
          },

          backToFieldSelection() {
               this.selectedField = {};
               this.selectedOperator = {};
               this.filterValue = null;
          },

          clearSelection() {
               this.resetFilterState();
          },

          resetFilterState() {
               this.selectedField = {};
               this.selectedOperator = {};
               this.filterValue = null;
               this.selectedFilter = null;
               this.editingFilterIndex = null;
               this.mode = "";
          },

          setNewFilter(index = null) {
               this.selectedField = {};
               this.selectedOperator = {};
               this.filterValue = null;
               this.mode = "new";

               if (index !== null) {
                    this.orIndexSelected = index;
               }
          },

          getOperators(type) {
               const operatorMap = {
                    number: this.numberOperators,
                    text: this.stringOperators,
                    textarea: this.stringOperators,
                    email: this.stringOperators,
                    date: this.dateOperators,
                    boolean: this.booleanOperators,
                    options: this.optionsOperators,
                    flexibleOptions: this.optionsOperators,
                    user_list: this.optionsOperators,
                    client_list: this.optionsOperators,
               };
               return operatorMap[type] || this.stringOperators;
          },

          deleteFilter(orIndex, index = null) {
               if (index !== null) {
                    this.localOrFilter[orIndex].splice(index, 1);
                    // Remove empty groups
                    if (this.localOrFilter[orIndex].length === 0) {
                         this.localOrFilter.splice(orIndex, 1);
                    }
               } else {
                    this.localOrFilter.splice(orIndex, 1);
               }

               // Reset to empty state if no filters
               if (this.localOrFilter.length === 0) {
                    this.localOrFilter = [[]];
               }

               this.emitFilterData();
          },

          async loadFile(fileName) {
               const { default: Module } = await import(`@/API/${fileName}/${fileName}.ts`);
               return new Module();
          },
     },
};
</script>

<style scoped>
.filter-container {
     min-height: 400px;
}

.filter-card {
     cursor: pointer;
     transition: all 0.2s ease;
     border: 2px solid transparent;
}

.filter-card-hover {
     border-color: rgb(var(--v-theme-primary));
     transform: translateY(-2px);
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.property-list-item {
     cursor: pointer;
     transition: background-color 0.2s;
}

.property-list-item:hover {
     background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>