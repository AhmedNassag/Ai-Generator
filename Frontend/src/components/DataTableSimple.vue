<template>
  <div>
    <!-- Table Container -->
    <div class="table-responsive container-table">
      <table :id="id" :class="tableClass" class="table custom-table">
        <thead>
          <tr>
            <th v-for="(column, index) in processedColumns" :key="index">
              <span v-if="column.sortable !== false && column.data" @click="sortBy(column.data)"
                class="sortable-header">
                {{ column.title }}
                <span v-if="currentSort === column.data" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
              <span v-else>{{ column.title }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="!load">
          <tr v-for="(row, index) in paginatedData" :key="index">
            <template v-for="(column, indexcolumn) in processedColumns" :key="indexcolumn">
              <td>
                <div v-if="indexcolumn === 0">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </div>
                <slot v-else-if="column.html" :name="column.id || column.title" :item="row" :rowIndex="indexcolumn"
                  v-html="column.html"></slot>
                <slot v-else :name="column.id || column.title" :item="row" :rowIndex="indexcolumn">
                  {{ getText(row, column) }}  
                </slot>
              </td>
            </template>
          </tr>
        </tbody>
        <tbody v-if="load">
          <tr>
            <td :colspan="processedColumns.length" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="mt-2">Loading data...</div>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!load && paginatedData.length === 0">
          <tr>
            <td :colspan="processedColumns.length" class="text-center py-4">
              <div class="text-muted">No data available</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-3">
      <nav aria-label="Table pagination">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link pagination-button prev" href="#" @click.prevent="goToPage(currentPage - 1)">
              <i class="fa-solid fa-chevron-left"></i>
            </a>
          </li>
          <li class="page-item" v-for="page in paginationPages" :key="page" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link pagination-button next" href="#" @click.prevent="goToPage(currentPage + 1)">
              <i class="fa-solid fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataTable",
  props: {
    id: { type: String, required: true },
    columns: { type: Array, required: true },
    api: { type: Object, required: true },
    apiParams: { type: Object, default: () => ({}) },
    tableClass: { type: String, default: "table" },
  },
  data() {
    return {
      color: [
        "light-blue-darken-1",
        "lime-darken-1",
        "blue-darken-1",
        "green-darken-1",
        "yellow-darken-1",
        "blue-grey-darken-1",
        "grey-darken-1",
        "lime-darken-1",
        "teal-darken-1",
        "cyan-darken-1",
        "indigo-darken-1",
        "deep-purple-darken-1",

      ],
      data: [],
      load: false,
      currentPage: 1,
      perPage: 10,
      currentSort: null,
      sortDirection: "asc",
      totalRecords: 0,
      filteredRecords: 0,
      internalColumns: [],
      activeFilters: [],
      filterOperators: [],
      fetchTimeout: null,
    };
  },
  computed: {
    processedColumns() {
      if (this.internalColumns.length === 0) {
        this.internalColumns = [
          { title: "#", data: null, defaultContent: "N/A", sort: false },
          ...this.columns,
        ];
      }
      return this.internalColumns;
    },

    paginatedData() {
      return this.data;
    },

    totalPages() {
      return Math.ceil(this.totalRecords / this.perPage);
    },

    paginationPages() {
      const pages = [];
      const maxPages = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

      if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  watch: {
    columns: {
      deep: true,
      handler() {
        this.internalColumns = [];
      }
    },

    apiParams: {
      deep: true,
      handler() {
        this.currentPage = 1;
        this.fetchData();
      },
    },


    perPage() {
      this.currentPage = 1;
      this.fetchData();
    },

    currentPage() {
      this.fetchData();
    },

    currentSort() {
      this.currentPage = 1;
      this.fetchData();
    },

    sortDirection() {
      this.fetchData();
    },
  },

  mounted() {
    this.fetchData();
  },

  beforeUnmount() {
    if (this.fetchTimeout) {
      clearTimeout(this.fetchTimeout);
    }
  },

  methods: {
    getcolor() {
      return this.color[Math.floor(Math.random() * this.color.length)]
    },
    goToPage(page) {
      this.currentPage = page;
    },
    /**
   * Format field value for display
   * @param {Object} tr - Row data
   * @param {Object} field - Field definition
   * @returns {String} Formatted HTML string
   */
    getText(tr, field) {

      const data = tr[field.data];
      if (field?.data?.includes(".")) {
        const keys = field.data.split(".");
        if (Array.isArray(tr[keys[0]])) {
          let text = ""
          tr[keys[0]].forEach(item => {
            text += item[keys[1]] + " "
          })
          if (text.length == 0) {
            return field.defaultContent;
          }
          return text;
        }
        return tr[keys[0]]?.[keys[1]];
      }
      const isDate = !isNaN(Date.parse(data));

      if (field.data == 'created_at') {
        const date = new Date(data);
        return date.toLocaleString();

      }
      // Handle null/empty values
      if (data === null || data === undefined || data === "") {
        return field.defaultContent;
      }



      // Handle datetime fields
      // if (field.type === "datetime") {
      //   return new Date(tr[field.key]).toLocaleDateString();
      // }

      // // Handle date fields
      // if (field.type === "date") {
      //   return new Date(tr[field.key]).toLocaleDateString();
      // }





      // Default: return raw value
      return data;
    },
    isBooleanLike(value) {
      if (typeof value === "boolean") return true;

      if (typeof value === "string") {
        return value.toLowerCase() === "true" || value.toLowerCase() === "false";
      }

      if (typeof value === "number") {
        return value === 1 || value === 0;
      }

      return false;
    },

    async fetchData() {
      this.load = true;
      try {
        const params = this.buildApiParams();
        const response = await this.api.getAll(params);

        if (response.data && Array.isArray(response.data)) {
          this.data = response.data;
          this.totalRecords = response.recordsTotal || response.total || response.data.length;
          this.filteredRecords = response.recordsFiltered || response.filtered || response.data.length;
        } else if (Array.isArray(response)) {
          this.data = response;
          this.totalRecords = response.length;
          this.filteredRecords = response.length;
        } else {
          console.error("Unexpected response format:", response);
          this.data = [];
          this.totalRecords = 0;
          this.filteredRecords = 0;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.data = [];
        this.totalRecords = 0;
        this.filteredRecords = 0;
      } finally {
        this.load = false;
      }
    },

    buildApiParams() {
      const params = {
        perPage: this.perPage,
        page: this.currentPage,
      };

      if (this.currentSort) {
        params.sort = `${this.currentSort}|${this.sortDirection}`;
      }

      if (this.activeFilters && this.activeFilters.length > 0) {
        const standardFilters = [];
        const specialFilters = {};

        this.activeFilters.forEach(filter => {
          const filterType = filter.filterType || 'filter';

          if (filterType === 'filter' || filterType === 'filterOr') {
            standardFilters.push(filter);
          } else {
            if (!specialFilters[filterType]) {
              specialFilters[filterType] = [];
            }
            specialFilters[filterType].push(filter);
          }
        });

        if (standardFilters.length > 0) {
          const completeFilterArray = [];
          standardFilters.forEach(filter => {
            let filterValue;
            let filterOperator = '=';

            if (filter.type === 'integer' || filter.type === 'boolean') {
              filterValue = `${filter.value}-${filter.type}`;
            } else if (filter.type === 'null') {
              filterValue = `-${filter.type}`;
              filterOperator = '!=';
            } else {
              filterValue = filter.value;
            }

            completeFilterArray.push(`${filter.key}|${filterValue}|${filterOperator}`);
          });

          let completeFilterString = "";
          if (completeFilterArray.length === 1) {
            completeFilterString = completeFilterArray[0];
          } else {
            completeFilterString = completeFilterArray[0];
            for (let i = 1; i < completeFilterArray.length; i++) {
              const operator = this.filterOperators[i - 1] || "&&";
              completeFilterString += operator + completeFilterArray[i];
            }
          }

          const hasFilterOr = standardFilters.some(f => f.filterType === 'filterOr');
          const parameterName = hasFilterOr ? 'filterOr' : 'filter';
          params[parameterName] = completeFilterString;
        }

        Object.keys(specialFilters).forEach(filterType => {
          const filtersForType = specialFilters[filterType];
          const filterArray = [];

          filtersForType.forEach(filter => {
            let filterValue;
            let filterOperator = '=';

            if (filter.type === 'integer' || filter.type === 'boolean') {
              filterValue = `${filter.value}-${filter.type}`;
            } else if (filter.type === 'null') {
              filterValue = `-${filter.type}`;
              filterOperator = '!=';
            } else {
              filterValue = filter.value;
            }

            filterArray.push(`${filter.key}|${filterValue}|${filterOperator}`);
          });

          if (filterArray.length === 1) {
            params[filterType] = filterArray[0];
          } else {
            let filterString = filterArray[0];
            for (let i = 1; i < filterArray.length; i++) {
              filterString += "&&" + filterArray[i];
            }
            params[filterType] = filterString;
          }
        });
      }

      const finalParams = { ...this.apiParams, ...params };

      Object.keys(this.apiParams).forEach(key => {
        if (key.includes('filter') && this.apiParams[key] && params[key]) {
          finalParams[key] = this.apiParams[key] + '&&' + params[key];
        }
      });

      return finalParams;
    },

    sortBy(column) {
      if (this.currentSort === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSort = column;
        this.sortDirection = 'asc';
      }
    },

    refreshTable() {
      this.fetchData();
    },
  },
};
</script>

<style scoped>
.container-table {
  border-radius: 10px;
  border: 1px solid #D9D9D9;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  margin-bottom: 0;
}

.custom-table thead th {
  background: #FAFBFB;
  padding: 8px;
  color: #000000;
  text-align: start;
  vertical-align: middle;
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.8px;
  user-select: none;
  transition: all 0.3s ease;
}

.custom-table tbody td {
  padding: 8px;
  text-align: start;
  vertical-align: middle;
  transition: all 0.3s ease;
  background: #fff;
  border: none;
  min-width: 120px;
  max-width: 300px;
}

.custom-table tbody td:first-child {
  width: 60px;
  min-width: 60px;
  max-width: 60px;
  font-weight: 600;
  color: #6E3894;
}

.custom-table tbody tr {
  border-top: 1px solid #00000033;
}

.custom-table tbody tr:first-child {
  border-top: 0;
}

.custom-table tbody tr:nth-child(even) {
  background-color: rgba(68, 34, 92, 0.02);
}

.custom-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(68, 34, 92, 0.08) 0%, rgba(90, 45, 115, 0.08) 100%);
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.15);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
}

.sortable-header:hover {
  color: #6E3894;
}

.sort-indicator {
  margin-left: 4px;
  color: #6E3894;
}

.pagination {
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pagination .page-link {
  background: #fff;
  color: #919191;
  padding: 0.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 44px;
  justify-content: center;
  border: 1px solid transparent;
}

.pagination .pagination-button {
  background: #6E3894;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  color: #fff;
  border: 1px solid #EFF1F4;
}

.pagination .page-link:hover {
  transform: translateY(-2px);
  background: #EFF1F4;
  font-weight: 700;
}

.pagination .page-item.active .page-link {
  font-weight: 700;
  color: #43235C;
  border-color: #6E3894;
  transform: translateY(-1px);
}

.pagination .page-item.disabled .page-link {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-link:focus {
  box-shadow: none;
  outline: 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.text-primary {
  color: #44225c !important;
}

.text-muted {
  color: #6c757d;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive .custom-table {
  min-width: 800px;
}

@media (max-width: 768px) {
  .custom-table {
    font-size: 0.8rem;
  }

  .custom-table thead th,
  .custom-table tbody td {
    padding: 10px 12px;
  }
}
</style>