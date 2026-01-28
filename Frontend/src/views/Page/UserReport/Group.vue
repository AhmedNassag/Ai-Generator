<template>
  <div class="grouped-data-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <VProgressCircular indeterminate color="#44235C" size="48" />
      <p class="mt-4 text-subtitle-1">{{ $t('common.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!groupedData.length" class="empty-state">
      <VIcon size="64" color="grey-lighten-1">mdi-database-off</VIcon>
      <p class="mt-4 text-h6">{{ $t('common.noDataAvailable') }}</p>
      <p class="text-caption text-grey">Try adjusting your filters or check back later</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Report Title -->
      <div class="report-header">
        <h1 class="report-title">
          <VIcon size="32" color="#44235C" class="mr-3">mdi-chart-box-outline</VIcon>
          {{ name }}
        </h1>
        <p class="report-subtitle">Organized by {{ formatGroupNames() }}</p>
        <div class="table-controls">
          <div class="row">
            <div class="col-12">
              <div class="d-flex justify-content-end align-items-center">


                <button class="mr-2 secondary-btn d-flex align-items-center justify-center " @click="toggleModal"
                  title="Export Data">
                  <v-icon left class="icon-add mr-2">mdi-file-export-outline</v-icon>

                  <span class="ms-2">Export</span>
                </button>
                <button class="mr-2 secondary-btn d-flex align-items-center justify-center ">
                  <v-icon left class="icon-add mr-2">mdi-file-pdf-box</v-icon>
                  <span class="ms-2">PDF</span>
                </button>
                <!-- Add New Button -->
                <!-- <button class="main-btn d-flex align-items-center justify-center" @click="openForm"
                                        v-if="!hideAddNewButton" title="Add New">
                                        <v-icon left class="icon-add mr-2">mdi-plus</v-icon>
                                        Add
                                   </button> -->

                <!-- Add Configs Button -->
                <button class="main-btn d-flex align-items-center justify-center mr-2 ml-2 " @click="openForm"
                  title="Configs.">
                  <v-icon left class="icon-add mr-2 ml-2">mdi-cog</v-icon>
                  Configs.
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Header -->
      <div class="statistics-header">
        <VCard class="stats-card" elevation="0">
          <VCardText>
            <div class="stats-content">
              <div class="stats-icon-wrapper primary-gradient">
                <VIcon color="white" size="24">mdi-folder-multiple-outline</VIcon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ totalGroups }}</div>
                <div class="stats-label">Total Groups</div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard class="stats-card" elevation="0">
          <VCardText>
            <div class="stats-content">
              <div class="stats-icon-wrapper success-gradient">
                <VIcon color="white" size="24">mdi-file-document-multiple-outline</VIcon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ totalRecords }}</div>
                <div class="stats-label">Total Records</div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard class="stats-card" elevation="0">
          <VCardText>
            <div class="stats-content">
              <div class="stats-icon-wrapper info-gradient">
                <VIcon color="white" size="24">mdi-file-chart-outline</VIcon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ currentPage }} / {{ totalPages }}</div>
                <div class="stats-label">Current Page</div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>

      <!-- Controls Section -->
      <VCard class="controls-card" elevation="0">
        <VCardText>
          <div class="controls-wrapper">
            <div class="controls-left">
              <VSelect v-model="itemsPerPage" :items="itemsPerPageOptions" label="Show" density="compact"
                variant="outlined" hide-details class="items-select" @update:model-value="onItemsPerPageChange">
                <template #prepend-inner>
                  <VIcon size="18" color="#44235C">mdi-table-row</VIcon>
                </template>
              </VSelect>
              <span class="page-info-text">
                Showing <strong>{{ startIndex + 1 }}-{{ endIndex }}</strong> of <strong>{{ totalGroups }}</strong>
                groups
              </span>
            </div>

            <div class="controls-right">
              <VBtn size="small" variant="outlined" color="#44235C" :disabled="currentPage === 1" @click="goToFirstPage"
                class="nav-btn">
                <VIcon size="18">mdi-page-first</VIcon>
              </VBtn>
              <VBtn size="small" variant="outlined" color="#44235C" :disabled="currentPage === totalPages"
                @click="goToLastPage" class="nav-btn">
                <VIcon size="18">mdi-page-last</VIcon>
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Dynamic Expansion for Paginated Data -->
      <div class="expansion-container">
        <DynamicExpansion :items="paginatedData" @item-selected="handleSelectedItem" :open-first="true"
          class="expansion-panel">
          <!-- Group Title Template -->
          <template #title="{ item }">
            <div class="group-title-wrapper">
              <VChip :color="getChipColor(item)" variant="flat" size="default" class="group-chip">
                <VIcon :icon="item.icon || 'mdi-format-list-group'" size="18" class="mr-2" />
                <span class="chip-text">{{ item.title }}</span>
              </VChip>
              <div class="spacer"></div>
              <VChip color="#E8E4F3" text-color="#44235C" variant="flat" size="small" class="count-chip">
                <strong>{{ item.count }}</strong>
              </VChip>
            </div>
          </template>

          <!-- Group Data Template -->
          <template #data="{ item }">
            <div class="table-wrapper">
              <DataTable :id="generateTableId(item)" :table-class="'modern-data-table'" :columns="tableColumns"
                :api="api" :api-params="getFilteredParams(item)" />
            </div>
          </template>
        </DynamicExpansion>
      </div>

      <!-- Pagination Section -->
      <VCard class="pagination-card" elevation="0">
        <VCardText>
          <div class="pagination-wrapper">
            <VPagination v-model="currentPage" :length="totalPages" :total-visible="7" rounded="circle"
              @update:model-value="onPageChange" color="#44235C" active-color="#44235C" class="custom-pagination" />
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script>
import DataTable from '../../../components/DataTableSimple.vue';
import DynamicExpansion from '../../../components/DynamicExpansion.vue';

export default {
  name: 'GroupedDataView',

  components: {
    DataTable,
    DynamicExpansion,
  },
  props: {
    apiParams: {
      type: Object,
    },
     
    groupFields: {
      type: Array
    },
    baseModle: {
      type: String
    },
    name:{
      type: String
    },
    group: {
      type: Array
    },
    tableColumns: {
      type: Array
    },
    openForm: Function,



  },

  data() {
    return {
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      itemsPerPageOptions: [
        { title: '5', value: 5 },
        { title: '10', value: 10 },
        { title: '20', value: 20 },
        { title: '50', value: 50 },
        { title: '100', value: 100 }
      ],
      rawData: [],
      selectedItem: null,
      whereIn: [],
      api:null,
    };
  },

  computed: {
    groupedData() {
      return this.groupData(this.rawData, this.group);
    },

    totalPages() {
      return Math.ceil(this.groupedData.length / this.itemsPerPage);
    },

    totalGroups() {
      return this.groupedData.length;
    },

    totalRecords() {
      return this.groupedData.reduce((sum, group) => sum + group.count, 0);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.totalGroups);
    },

    paginatedData() {
      return this.groupedData.slice(this.startIndex, this.endIndex);
    },
  },

  watch: {
    groupedData() {
      this.currentPage = 1;
    },
  },

  async created() {
    this.api= await this.loadFile(this.baseModle);
    await this.loadGroupedData();
  },

  methods: {


    async loadGroupedData() {
      try {
        this.isLoading = true;
        
        await this.getGroup();
      } catch (error) {
        console.error("Error loading grouped data:", error);
        this.$emit('error', error);
      } finally {
        this.isLoading = false;
      }
    },

    onPageChange(page) {
      this.currentPage = page;
      this.scrollToTop();
      this.$emit('page-changed', page);
    },

    onItemsPerPageChange() {
      this.currentPage = 1;
      this.$emit('items-per-page-changed', this.itemsPerPage);
    },

    goToFirstPage() {
      this.currentPage = 1;
      this.scrollToTop();
    },

    goToLastPage() {
      this.currentPage = this.totalPages;
      this.scrollToTop();
    },

    scrollToTop() {
      const container = this.$el.querySelector('.expansion-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    handleSelectedItem(item) {
      this.selectedItem = item;
      this.$emit('item-selected', item);
      console.log("Selected Item:", item);
    },

    generateTableId(item) {
      if (!item?.path) return 'table-default';
      return Object.entries(item.path)
        .map(([key, value]) => `${key}-${value}`)
        .join('-');
    },

    getFilteredParams(item) {
      const filterString = this.convertToQueryString(item);
      const params = { ...this.apiParams };

      if (!filterString) return params;

      if (item.multiple) {
        params.filterIn = filterString;
      } else {
        params.filter = params.filter?.length
          ? `${params.filter}&&${filterString}`
          : filterString;
      }

      return params;
    },

    convertToQueryString(obj) {
      if (!obj?.path) return '';

      const validTypes = ["string", "number", "boolean", "date", "datetime", "email"];

      return Object.entries(obj.path)
        .map(([key, value]) => {
          const field = this.groupFields.find(f => f.name === key);
          let type = validTypes.includes(field?.type) ? field.type : "string";

          if (type === "boolean") {
            value = value === true ? 1 : 0;
          }

          if (value == null || value === "null") {
            type = "null";
          }

          return `${key}|${value}-${type}`;
        })
        .join('&&');
    },

    async getGroup() {
      
      const res = await this.api.group({
        group_by: this.group,
        filterGroups: this.filterGroups,
      });

      this.rawData = res;
      const idsByKey = this.extractIdsByKey(res);

      this.whereIn = Object.entries(idsByKey).map(([key, set]) => ({
        name: key,
        ids: [...set],
      }));

      await this.getDataFromModel(this.whereIn);
    },

    extractIdsByKey(data) {
      const idsByKey = {};

      data.forEach(item => {
        const idObj = item.id || {};
        Object.entries(idObj).forEach(([key, value]) => {
          if (!idsByKey[key]) {
            idsByKey[key] = new Set();
          }
          idsByKey[key].add(value);
        });
      });

      return idsByKey;
    },

    async getDataFromModel(data) {
      const promises = data.map(async (item) => {
        const field = this.groupFields.find(f => f.name === item.name);
        if (!field || field.type !== 'options') return;

        try {
          const model = await this.loadFile(field.options);
          const res = await model.getAll({
            filterIn: `id|${item.ids.join(',')}`,
            select: 'id|name',
          });
          field.list = res;
        } catch (error) {
          console.error(`Error loading ${field.options}:`, error);
          field.list = [];
        }
      });

      await Promise.all(promises);
    },

    groupData(data, keys) {
      if (!keys?.length || !data?.length) return [];

      const [currentKey, ...restKeys] = keys;
      const groups = this.createGroups(data, currentKey);

      return this.buildGroupResults(groups, restKeys, currentKey);
    },

    createGroups(data, currentKey) {
      const groups = {};

      data.forEach(item => {
        const keyVal = item.id?.[currentKey] ?? 'N/A';
        if (keyVal === undefined) return;

        if (!groups[keyVal]) {
          groups[keyVal] = [];
        }
        groups[keyVal].push(item);
      });

      return groups;
    },

    buildGroupResults(groups, restKeys, currentKey) {
      const result = [];

      for (const [key, items] of Object.entries(groups)) {
        const aggregatedCount = items.reduce((acc, item) => acc + item.count, 0);
        const children = this.groupData(items, restKeys);
        const { title, icon, color } = this.formatGroupTitle(key, currentKey);

        result.push({
          title,
          icon,
          color,
          count: aggregatedCount,
          type: this.getFieldType(currentKey),
          multiple: this.getFieldMultiple(currentKey),
          children: children.length ? children : null,
          path: items[0].id,
        });
      }

      return result.sort((a, b) => b.count - a.count);
    },

    formatGroupTitle(key, fieldName) {
      const field = this.groupFields.find(f => f.name === fieldName);
      let title = key;
      let icon = null;
      let color = null;

      if (!field) return { title, icon, color };

      if (field.type === "options" && typeof field.options === 'string' && field.list && Array.isArray(field.list)) {
        const option = field.list.find(opt => opt?.id == key);
        if (option) {
          title = option.name;
        }
      }

      if (field.type === "boolean") {
        title = key === "true"
          ? field.trueLabel || this.$t('common.yes')
          : field.falseLabel || this.$t('common.no');
      }

      if (field.type === "date") {
        title = new Date(key).toLocaleDateString();
      }

      return { title, icon, color };
    },

    getFieldType(fieldName) {
      const validTypes = ["string", "number", "boolean", "date", "datetime", "email"];
      const field = this.groupFields.find(f => f.name === fieldName);
      return validTypes.includes(field?.type) ? field.type : "string";
    },

    getFieldMultiple(fieldName) {
      const field = this.groupFields.find(f => f.name === fieldName);
      return field?.multiple || null;
    },

    getChipColor(item) {
      return item.color || '#E8E4F3';
    },

    formatGroupNames() {
      return this.group
        .map(g => {
          const field = this.groupFields.find(f => f.name === g);
          return field ? field.label : g;
        })
        .join(' → ') + ' → ' + this.baseModle;
    },

    async loadFile(fileName) {
      const { default: Module } = await import(`@/API/${fileName}/${fileName}.ts`);
      return new Module();
    },
  },
};
</script>

<style scoped>
.main-btn {
  background-color: #6E3894;
  color: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 14px;
  text-transform: capitalize !important;
  border: 1px solid #6E3894;
  height: 30px;
  font-weight: 500;
}

.secondary-btn {
  color: #43235C;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 14px;
  text-transform: capitalize !important;
  border: 1px solid #6E3894;
  height: 30px;
  font-weight: 500;
}

.icon-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
}

.grouped-data-container {
  padding: 0;
  min-height: 400px;
  background: #F8F9FA;
}

.content-wrapper {
  padding: 24px;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 48px;
  background: white;
}

.empty-state {
  color: #6C757D;
}

/* Report Header */
.report-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #E9ECEF;
}

.report-title {
  font-size: 32px;
  font-weight: 700;
  color: #44235C;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.report-subtitle {
  font-size: 15px;
  color: #6C757D;
  margin: 0;
  padding-left: 48px;
  font-weight: 500;
}

/* Statistics Header */
.statistics-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stats-card {
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(68, 35, 92, 0.12);
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.primary-gradient {
  background: linear-gradient(135deg, #44235C 0%, #6B46A3 100%);
}

.success-gradient {
  background: linear-gradient(135deg, #28A745 0%, #20C997 100%);
}

.info-gradient {
  background: linear-gradient(135deg, #17A2B8 0%, #138496 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: #44235C;
  line-height: 1.2;
}

.stats-label {
  font-size: 13px;
  color: #6C757D;
  margin-top: 4px;
  font-weight: 500;
}

/* Controls Card */
.controls-card {
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 12px;
  margin-bottom: 20px;
}

.controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.items-select {
  max-width: 120px;
}

.page-info-text {
  color: #6C757D;
  font-size: 14px;
}

.page-info-text strong {
  color: #44235C;
  font-weight: 600;
}

.controls-right {
  display: flex;
  gap: 8px;
}

.nav-btn {
  min-width: 40px !important;
  padding: 0 12px !important;
}

/* Expansion Container */
.expansion-container {
  margin-bottom: 20px;
  scroll-margin-top: 80px;
}

.expansion-panel {
  background: transparent;
}

/* Group Title */
.group-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  width: 100%;
}

.spacer {
  flex: 1;
}

.group-chip {
  font-weight: 600;
  font-size: 14px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  letter-spacing: 0.2px;
}

.chip-text {
  color: #44235C;
}

.count-chip {
  font-size: 12px;
  font-weight: 700;
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

/* Table Wrapper */
.table-wrapper {
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #E9ECEF;
  overflow: hidden;
}

/* Modern Table Styles */
:deep(.modern-data-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

:deep(.modern-data-table thead) {
  background: #44235C;
}

:deep(.modern-data-table thead th) {
  padding: 16px 20px;
  font-weight: 600;
  text-align: left;
  /* color: white; */
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

:deep(.modern-data-table tbody tr) {
  border-bottom: 1px solid #E9ECEF;
  transition: background-color 0.2s ease;
}

:deep(.modern-data-table tbody tr:hover) {
  background-color: #F8F9FA;
}

:deep(.modern-data-table tbody tr:last-child) {
  border-bottom: none;
}

:deep(.modern-data-table tbody td) {
  padding: 16px 20px;
  color: #495057;
  border: none;
}

/* Pagination Card */
.pagination-card {
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.custom-pagination {
  margin: 0;
}


:deep(.v-pagination__prev),
:deep(.v-pagination__next) {
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .statistics-header {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .statistics-header {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .controls-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .controls-left {
    flex-direction: column;
    align-items: stretch;
  }

  .items-select {
    max-width: 100%;
  }

  .controls-right {
    justify-content: center;
  }

  .stats-value {
    font-size: 24px;
  }

  .report-title {
    font-size: 24px;
  }

  .report-subtitle {
    padding-left: 0;
    margin-top: 8px;
  }

  :deep(.modern-data-table) {
    font-size: 12px;
  }

  :deep(.modern-data-table thead th),
  :deep(.modern-data-table tbody td) {
    padding: 12px 16px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .grouped-data-container {
    background: #1A1A1A;
  }

  .content-wrapper {
    background: #1A1A1A;
  }

  .stats-card,
  .controls-card,
  .pagination-card,
  .table-wrapper {
    background: #2D2D2D;
    border-color: #404040;
  }

  .stats-value {
    color: #E8E4F3;
  }

  .stats-label,
  .page-info-text {
    color: #AAAAAA;
  }

  .report-title {
    color: #E8E4F3;
  }

  .report-subtitle {
    color: #AAAAAA;
  }

  .report-header {
    border-bottom-color: #404040;
  }

  .page-info-text strong {
    color: #E8E4F3;
  }

  :deep(.modern-data-table tbody tr) {
    border-bottom-color: #404040;
  }

  :deep(.modern-data-table tbody tr:hover) {
    background-color: #3A3A3A;
  }

  :deep(.modern-data-table tbody td) {
    color: #E0E0E0;
  }
}
</style>