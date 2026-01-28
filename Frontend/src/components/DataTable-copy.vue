<template>
  <div>
    <!-- Table structure, dynamically bound with the provided 'id' and 'tableClass' -->
    <div v-permission:show class="table-reponsive">
      <table :id="id" :class="tableClass" style="width: 100% !important">
        <thead>
          <tr class="text-center">
            <!-- Dynamically generates table headers based on the 'columns' prop -->
            <th
              class="text-center"
              v-for="column in columns"
              :key="column.data"
            >
              {{ column.title }}
              <!-- Display the column title -->
            </th>
          </tr>
        </thead>
        <tbody v-if="!load">
          <!-- Loop through the data rows and display them in table rows -->
          <tr class="text-center" v-for="(row, index) in data" :key="index">
            <!-- Loop through the columns for each row and display corresponding data -->
            <template v-for="(column, indexcolumn) in columns">
              <td
                :key="indexcolumn"
                v-if="!InvisibleColumn.includes(indexcolumn)"
              >
                <div v-if="indexcolumn === 0">
                  <!-- Checkboxes for selecting rows -->
                  <input
                    class="form-check-input"
                    :value="row.id"
                    v-model="selected"
                    type="checkbox"
                  />
                </div>
                <div v-if="indexcolumn === 1">
                  <!-- Moustafa Mohamed  -->
                  <!-- {{ page - 1 + index + 1 }} -->
                  {{ (page - 1) * 10 + index + 1 }}
                  <!-- returning index -->
                </div>

                <div
                  v-else-if="column.title === 'Actions'"
                  style="display: block"
                >
                  <!-- Ahmed Nour -->
                  <div class="dropdown table-actions">
                    <a
                      class="dropdown-toggle"
                      id="actionsDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i class="fa fa-ellipsis-v"></i>
                    </a>
                    <ul
                      class="dropdown-menu actionsMenu"
                      aria-labelledby="actionsDropdown"
                    >
                      <li>
                        <slot name="addAction" :item="row"></slot>
                        <!-- Moustafa Mohamed -->
                      </li>
                      <li>
                        <slot name="surveyQuestions" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="sendSurvey" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="incidentResponse" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="surveyResult" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="cloneSurvey" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="surveyStatistics" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="generateLink" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="view" :item="row"></slot>
                        <!-- Islam -->
                      </li>
                      <li>
                        <slot name="QuestionsResponse" :item="row"></slot>
                        <!-- Islam -->
                      </li>

                      <!-- Edit and Delete actions for rows -->
                      <!-- <a href="javascript:void(0)" @click="viewItem(row)" data-bs-toggle="modal" data-bs-target="#exampleModal">
                   <i class="icofont icofont-eye"></i>
                 </a> -->

                      <!-- <a @click="dialog = true">
                     <i class="icofont icofont-eye"></i>
                   </a> -->
                      <li>
                        <slot name="edit" :item="row">
                          <a
                            href="javascript:void(0)"
                            @click="editItem(row)"
                            v-if="!hideActionsColumn && !hideActions(row).edit"
                            class="edit_button dropdown-item"
                            v-anyPermission="['updata', 'edit']"
                          >
                            <i class="icofont icofont-fountain-pen"></i> Edit
                          </a>
                        </slot>
                        <!-- <slot name="edit" :disabled="status ? false : true" :item="row">

                   </slot> -->
                      </li>
                      <li>
                        <slot name="delete" :item="row">
                          <a
                            v-anyPermission="['destroy', 'delete']"
                            href="javascript:void(0)"
                            @click="deleteItem(row)"
                            v-if="
                              !hideActionsColumn && !hideActions(row).delete
                            "
                            class="delete_button dropdown-item"
                          >
                            <i class="icofont icofont-trash text-danger"></i>
                            Delete
                          </a>
                        </slot>
                      </li>
                    </ul>
                  </div>
                </div>

                <slot
                  v-else-if="column.html"
                  :name="column.id || column.title"
                  :item="row"
                  :rowIndex="indexcolumn"
                  v-html="column.html"
                >
                </slot>
                <slot
                  v-else
                  :name="column.id || column.title"
                  :item="row"
                  :rowIndex="indexcolumn"
                >
                  <!-- Display row data, using dynamic slot for custom column rendering -->
                  {{ row[column.data] }}
                </slot>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!--//////////////////////////////////////////////////-->
    <!-- Modal for Import Form -->
    <div v-show="showModal" class="modal-overlay modal-lg">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-center mb-3">Import Data</h3>
          <button @click="toggleModal">X</button>
        </div>
        <div class="modal-body">
          <!-- <form action="" enctype="multipart/form-data"> -->
          <div class="row" v-permission:fetchFileData>
            <div class="form-group">
              <label for="file">Upload File</label>
              <input
                type="file"
                id="file"
                ref="file"
                class="form-control"
                required
                @change="handleFileUpload"
              />
            </div>
            <button type="button" class="btn btn-primary" @click="handleImport">
              Import
            </button>
          </div>
          <hr />
          <div v-if="file_columns.length">
            <h3 class="text-center mb-3">Match Data</h3>
            <div
              class="row"
              v-for="file_column in file_columns"
              :key="file_column"
            >
              <div class="col-6">
                <label for="file_column">File Column:</label>
                <input
                  type="text"
                  id="file_column"
                  class="form-control"
                  :value="file_column"
                  :disabled="isFileColumnDisabled"
                />
              </div>
              <div class="col-6">
                <label for="database_column">Database Column:</label>
                <select
                  id="database_column"
                  v-model="fields[file_column]"
                  class="form-select"
                >
                  <option value="">Select Culomn</option>
                  <option
                    v-for="database_column in database_columns"
                    :key="database_column"
                    :value="database_column"
                  >
                    {{ database_column }}
                  </option>
                </select>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-primary col-3"
              @click="saveImportedData"
            >
              Save
            </button>
            <button
              type="button"
              class="btn btn-primary col-3 m-3"
              @click="toggleModal"
            >
              Close
            </button>
          </div>
          <!-- </form> -->
        </div>
      </div>
    </div>
    <!--//////////////////////////////////////////////////-->
  </div>
</template>

<script>
// Import necessary DataTables and plugins for additional functionality
import DataTable from "datatables.net";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-select-bs5";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-fixedcolumns";
import "jszip";
import "pdfmake";
import "pdfmake/build/vfs_fonts";

import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import * as XLSX from "xlsx";
import { at } from "lodash";
import Auth from "@/API/Auth";

export default {
  name: "DataTable", // Name of the component
  props: {
    // API used to fetch data for the table
    api: Object,
    // Function to open the form for editing or adding new items
    editItem: Function,
    // Function to open the form for creating new items
    openForm: Function,
    linkRequirement: Function,
    Configurations: Function,
    openEndAudit: Function,
    // exportAllToExcell: Function,

    /*//////////////////////////////////////////////////*/
    // Function to open the form for creating new items
    // openImportForm: Function,
    /*//////////////////////////////////////////////////*/

    // Additional API parameters for filtering or sorting
    apiParams: Object,
    // Flag to show or hide action buttons (Edit/Delete)
    action: Boolean,
    // ID of the table (used for DOM operations)
    id: {
      type: String,
      required: true,
    },
    // Class for styling the table
    tableClass: {
      type: String,
      default: "table",
    },
    // Column configurations for the table (titles, data keys, etc.)
    columns: {
      type: Array,
      required: true,
    },

    hideAddNewButton: {
      type: Boolean,
      default: false,
    },
    hideLinkRequirementButton: {
      type: Boolean,
      default: true,
    },
    hideConfigurationsButton: {
      type: Boolean,
      default: true,
    },
    hideEndAuditButton: {
      type: Boolean,
      default: true,
    },
    hideActionsColumn: {
      type: Boolean,
      default: false,
    },

    hideAllActionsColumnn: {
      type: Boolean,
      default: false,
    },

    hideActions: {
      type: Function,
      default: () => (row) => ({
        edit: false,
        delete: false,
      }),
    },
  },

  data() {
    return {
      // Holds selected rows (used for multi-selection)
      selected: [],
      // Holds the fetched data for table rows
      data: [],
      // Flag to indicate if data is being loaded
      load: false,
      // Stores local API parameters (like pagination, sorting)
      apiParamsLocal: {},
      // DataTable instance to manage the table
      dataTableInstance: null,

      /*//////////////////////////////////////////////////*/
      showModal: false,
      isFileColumnDisabled: true,
      file: {},
      file_columns: [],
      database_columns: [],
      fields: [],
      InvisibleColumn: [],
      VisibleColumnNames: [],
      page: 0,
      /*//////////////////////////////////////////////////*/
    };
  },
  watch: {
    // Watch for changes in API parameters and refresh table data
    apiParams: {
      deep: true,
      handler() {
        this.refreshTable();
      },
    },
  },
  beforeCreate() {
    // Add a checkbox column at the start and an 'Actions' column at the end
    // const find = this.columns.find((a) => a.title == "#");
    // if (!find) {
    this.columns.unshift({
      title: "#",
      data: null,
      defaultContent: "N/A",
      sort: false,
    });
    this.columns.unshift({ title: "", data: null, defaultContent: "N/A" });
    if (!this.hideAllActionsColumnn) {
      this.columns.push({ title: "Actions", data: null });
    }
    // }
  },
  mounted() {
    // Wait until the component is mounted, then initialize the DataTable
    this.$nextTick(() => {
      const tableElement = document.querySelector(`#${this.id}`);
      if (tableElement) {
        this.initializeDataTable();

        this.updateVisibleColumns();

        document.addEventListener("click", this.handleColumnVisibilityClick);
      } else {
        console.error(`Table element with ID ${this.id} not found.`);
      }
    });
  },
  beforeDestroy() {
    // Cleanup DataTable instance before destroying the component
    if (this.dataTableInstance) {
      this.dataTableInstance.destroy();
    }
  },
  methods: {
    // Initialize the DataTable with configuration options
    initializeDataTable() {
      const buttons = [
        {
          extend: "colvis",
          text: "<i class='fa fa-columns'></i> Columns",
          titleAttr: "Column Visibility",
          columnText: (dt, idx, title) => title,
          collectionLayout: "two-column",
        },
      ];
      /*//////////////////////////////////////////////////*/
      if (Auth.TABLE_PERMISSIONS["export"]) {
        buttons.push([
          {
            extend: "excel",
            text: "<i class='fa fa-file-excel'></i> Excel",
            className: "btn btn-success",
            titleAttr: "Export to Excel",
          },
          {
            attr: {
              "v-permission:exportAllToExcel": "",
            },
            text: "<i class='fa fa-download'></i> Export All",
            titleAttr: "Export All",
            action: () => {
              this.exportAllToExcell();
            },
          },
          {
            extend: "pdf",
            text: "<i class='fa fa-file-pdf'></i> PDF",
            className: "btn btn-danger",
            titleAttr: "Export to PDF",
          },
        ]);
      }

      if (Auth.TABLE_PERMISSIONS["import"]) {
        buttons.push({
          text: "<i class='fa fa-upload'></i> Import",
          titleAttr: "Import",
          action: () => {
            this.toggleModal();
          },
        });
      }

      if (!this.hideConfigurationsButton) {
        buttons.push({
          text: "<i class='fa fa-cogs'></i> Configs",
          titleAttr: "Configs",
          action: () => {
            this.Configurations({});
          },
          attr: {
            "v-permission:store": "",
          },
        });
      }

      // Conditionally add the "Add New" button
      if (!this.hideAddNewButton && Auth.TABLE_PERMISSIONS["insert"]) {
        buttons.push({
          text: "<i class='fa fa-plus'></i> Add New",
          titleAttr: "Add New",
          action: () => {
            this.openForm({});
          },
        });
      }

      // if (!this.hideLinkRequirementButton && Auth.TABLE_PERMISSIONS["linkRequirement"]) {
      if (!this.hideLinkRequirementButton) {
        buttons.push({
          text: "<i class='fa fa-link'></i> Link Reqs.",
          titleAttr: "Link Reqs.",
          action: () => {
            this.linkRequirement({});
          },
          attr: {
            "v-permission:linkRequirement": "",
          },
        });
      }

      if (!this.hideEndAuditButton) {
        buttons.push({
          text: "<i class='fa fa-flag-checkered'></i> End Audit",
          titleAttr: "End Audit",
          action: () => {
            this.openEndAudit({});
          },
          attr: {
            "v-permission:store": "",
          },
        });
      }
      /*//////////////////////////////////////////////////*/

      const options = {
        columns: this.columns, // Column configurations
        serverSide: true, // Enable server-side processing for large datasets
        processing: true, // Show processing indicator while loading data
        ajax: (data, callback) => this.fetchTableData(data, callback), // Function to fetch data
        paging: true, // Enable pagination
        searching: true, // Enable search functionality
        ordering: true, // Enable sorting by columns
        lengthMenu: [
          [10, 25, 50, 100, -1], // -1 all rows
          [10, 25, 50, 100, "All"],
        ],
        dom:
          '<"row mb-2"<"col-sm-8 col-md-4"f><"col-sm-12 col-md-8 "B>>' +
          '<"row"<"col-sm-12"t>>' +
          '<"row mt-4"<"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p><"col-sm-4 col-md-3"l>>',
        buttons: buttons /*[
          "excel", // Export to Excel
          "pdf",   // Export to PDF
          "colvis", // Column visibility toggle





          /*/, /////////////////////////////////////////////////*/
        /*
          {
            text: "Import", // Custom button for adding a new item
            action: () => {
              this.toggleModal(); // Trigger form opening for new item
            },
          },
          */
        /*//////////////////////////////////////////////////*/

        /*
          {
            text: "Export All",
            action: () => {
              this.exportAllToExcell();
            },
          },

          {
            text: "Add New", // Custom button for adding a new item
            action: () => {
              this.openForm({}); // Trigger form opening for new item
            },
          },
        ],*/
        // columnDefs: [
        //   { width: "3%", orderable: false, targets: 0 }, // First column (checkbox) is non-orderable
        //   { width: "5%", orderable: false, targets: this.columns.length - 1 }, // Last column (actions) is non-orderable
        // ],
        order: [[1, "desc"]], // Default ordering by the first column (descending)

        colRecorder: true,
        fixedHeader: {
          header: true,
          footer: true,
        },
        scrollCollapse: true,
        // scrollX:true,
        // scrollY:500,
        // responsive: true,
        language: {
          paginate: {
            next: "Next <i class='fa fa-long-arrow-right'></i>", // Change "Next" button text
            previous: "<i class='fa fa-long-arrow-left'></i> Prev", // Change "Previous" button text
          },
        },
      };

      this.dataTableInstance = new DataTable(`#${this.id}`, options); // Initialize DataTable
      this.$forceUpdate();
      //dt-button dropdown-item buttons-columnVisibility
    },
    handleColumnVisibilityClick(event) {
      const button = event.target.closest(".buttons-columnVisibility"); // Check if clicked element is a visibility button

      if (button) {
        const columnIdx = parseInt(button.getAttribute("data-cv-idx"), 10);
        console.log(columnIdx, "columnIdx");
        const findIndex = this.InvisibleColumn.findIndex(
          (idx) => idx === columnIdx
        );

        if (findIndex === -1) {
          // If not found, add column index
          this.InvisibleColumn.push(columnIdx);
        } else {
          // If found, remove column index using splice()
          this.InvisibleColumn.splice(findIndex, 1);
        }
      }

      this.updateVisibleColumns();
    },

    updateVisibleColumns() {
      if (!this.dataTableInstance) return;

      const self = this;
      self.VisibleColumnNames = [];

      this.dataTableInstance.columns().every(function (index) {
        if (this.visible()) {
          let columnName = this.header().textContent.trim();
          // columnName = columnName.split('.').pop();
          if (index > 1) {
            self.VisibleColumnNames.push(columnName);
          }
        }
      });

      console.log(self.VisibleColumnNames, "VisibleColumnNames at Start");
    },

    toggleColumn(index) {
      let column = this.dataTableInstance.column(index);
      column.visible(!column.visible());
    },

    /*//////////////////////////////////////////////////*/
    toggleModal() {
      this.file_columns = [];
      this.database_columns = [];
      this.fields = [];
      this.showModal = !this.showModal; // Toggle modal visibility
    },

    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async handleImport() {
      const formData = new FormData();
      formData.append("file", this.file);
      await this.api
        .fetchFileData(formData, {}, false)
        .then((response) => {
          this.file_columns = response.data.file_columns;
          this.database_columns = response.data.database_columns;
        })
        .catch((error) => {
          console.error("Error importing file:", error);
        });
    },

    saveImportedData() {
      console.log(this.fields);
      this.api
        .importFileData(this.fields, {}, false)
        .then((response) => {
          this.file_columns = [];
          this.database_columns = [];
          this.fields = [];
          this.toggleModal(); // Close the modal
          this.refreshTable(); // Refresh the table after successful import
          console.log(response);
        })
        .catch((error) => {
          console.error("Error importing file:", error);
        });
    },
    /*//////////////////////////////////////////////////*/

    // Fetch the data from the API with pagination, sorting, and search
    async fetchTableData(data, callback) {
      this.load = true; // Set loading state
      try {
        const response = await this.api.getAll(this.convertApiParams(data)); // API call
        this.data = response.data; // Assign fetched data to table

        console.log("this.data is ");
        console.log(this.data);
        callback({
          recordsTotal: response.recordsFiltered, // Total record count
          recordsFiltered: response.recordsTotal, // Filtered record count
          data: response.data, // Data to be displayed in table
        });
      } catch (error) {
        console.error("Error fetching data:", error); // Handle any errors
      } finally {
        this.load = false; // Reset loading state
      }
    },

    // Convert DataTable request parameters to API request format
    convertApiParams(data) {
      let columnOrder = this.columns[data.order[0].column].data;
      if (columnOrder == null) {
        columnOrder = "id";
      }
      const params = {
        perPage: data.length, // Number of rows per page
        page: data.start / data.length + 1, // Current page number
        sort: data.order ? `${columnOrder}|${data.order[0].dir}` : "", // Sorting details
        search: data.search.value, // Search query
      };
      this.page = params.page;
      return { ...this.apiParams, ...params }; // Combine local params with provided API params
    },

    // Refresh the table by reloading the data
    refreshTable() {
      if (this.dataTableInstance) {
        this.dataTableInstance.ajax.reload(); // Reload DataTable with updated data
      }
    },

    // Delete a single item from the table
    async deleteItem(data) {
      await this.api.delete(0, [data.id].map(String)); // API call to delete the item
      this.refreshTable(); // Refresh the table after deletion
    },

    // Delete multiple selected items
    async multiDelete() {
      console.log(this.selected); // Log selected rows for debugging
      await this.api.delete(0, Object.values(this.selected).map(String)); // API call for multi-delete
      this.refreshTable(); // Refresh the table after deletion
    },

    exportAllToExcell() {
      // if (this.VisibleColumnNames.length === 0) {
      //   alert("No columns available for export.");
      //   return;
      // }
      // const selectedColumns = this.VisibleColumnNames.join("|");
      // this.api.exportAllToExcel(selectedColumns);

      const table = document.getElementById(this.id);
      if (!table) {
        alert("الجدول غير موجود!");
        return;
      }
      const ws = XLSX.utils.table_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const fileName = this.$route.name
        ? `${this.$route.name}.xlsx`
        : "ExportedData.xlsx";
      XLSX.writeFile(wb, fileName);
    },
  },
  beforeUnmount() {
    // Cleanup: Remove event listener and destroy DataTable
    document.removeEventListener("click", this.handleColumnVisibilityClick);
  },
};
</script>

<style>
/* Styles for the table buttons and layout */
div.dt-buttons {
  display: flex !important;
}

@import "datatables.net-bs5";
@import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

.btn-secondary {
  color: white;
}

.btn-secondary:hover {
  color: black;
}

.flip-container {
  perspective: 1000px;
}

.flipper {
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

.flip-container.flip .flipper {
  transform: rotateY(180deg);
}

.front,
.back {
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.front {
  z-index: 2;
}

.back {
  transform: rotateY(180deg);
}

table.dataTable thead th,
table.dataTable thead td,
table.dataTable tfoot th,
table.dataTable tfoot td {
  background-color: #44225c !important;
  color: #fff;
}

/* .page-link,
.page-link.active {
  color: white;
  background-color: #44225c;
  border-color: #44225c;
} */

button.dt-button {
  background-color: #3ad77e !important;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

button.dt-button:hover {
  background-color: #2a9d6b;
}

.pagination {
  /* --bs-pagination-color: var(--theme-default) !important; */
  --bs-pagination-color: white !important;
  --bs-pagination-active-bg: var(--theme-default) !important;
  --bs-pagination-active-border-color: var(--theme-default) m !important;
}

.page-title-card {
  padding-inline: 1.5625rem;
  padding-block: 0.625rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
}

.modal-body .form-group {
  margin-bottom: 15px;
}

.modal-body .btn-primary {
  background-color: #44225c;
  border-color: #44225c;
}

/* Enhanced styles for the DataTable */

/* Improve table layout with content-based sizing */
table.dataTable {
  width: 100% !important;
  margin-bottom: 1rem;
  border-spacing: 0;
  table-layout: auto;
  /* Allow the table to adjust based on content */
  border-collapse: collapse;
}

/* Make header cells fit to content */
table.dataTable thead th {
  width: auto !important;
  /* Override any fixed width */
  white-space: nowrap;
  /* Prevent wrapping to ensure headers take width of content */
  padding: 12px 15px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #ddd;
}

/* Better column spacing and text alignment with consistent borders */
table.dataTable td {
  padding: 12px 15px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #ddd;
  /* Add consistent border to all cells */
  word-break: break-word;
  /* Allow content cells to wrap */
}

/* Consistent header border styling */
table.dataTable thead th,
table.dataTable thead td {
  border: 1px solid #44225c;
  /* Matching header color for borders */
  border-bottom: 2px solid #331845;
  /* Slightly darker bottom border */
}

/* Action column specific styling */
table.dataTable td a {
  display: inline-block;
  margin: 0 5px;
}

/* Improve responsiveness */
.dataTables_wrapper {
  overflow-x: auto;
  width: 100%;
}

/* Make the scrollable area cleaner */
.dataTables_scrollBody {
  min-height: 300px;
}

/* Enhance the header styling */
thead th {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

/* Improve row hover effect while maintaining borders */
tbody tr:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 1;
  /* Ensure hovering row appears above others */
}

/* Style for specific columns - but allow content-based sizing */
/* Only apply minimal width constraints, not fixed widths */
table.dataTable td:first-child,
table.dataTable th:first-child {
  min-width: 30px;
}

/* Ensure content stays centered even with scrolling */
.dataTables_scrollHeadInner,
.dataTables_scrollHeadInner table {
  width: 100% !important;
}

/* Fix for horizontal scrolling */
.dataTables_scrollBody {
  overflow-x: auto !important;
  width: 100% !important;
}

/* Ensure data cells remain properly sized with content */
table.dataTable tbody td {
  padding: 10px 8px;
  line-height: 1.4;
}

/* Better empty cell styling */
table.dataTable .sorting_disabled {
  background-image: none !important;
}

/* Improve alternating row colors for readability while maintaining borders */
table.dataTable tbody tr:nth-child(even) {
  background-color: rgba(68, 34, 92, 0.03);
}

/* Ensure borders appear in scrollable body */
.dataTables_scrollBody table.dataTable tbody th,
.dataTables_scrollBody table.dataTable tbody td {
  border: 1px solid #ddd;
}

/* Better responsive behavior for small screens */
table.dataTable th,
table.dataTable td {
  padding: 8px 6px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  /* Maintain borders at smaller screens */
}

/* Allow header text to wrap on very small screens */
table.dataTable thead th {
  white-space: normal;
}

.action-dropdown .dropdown-toggle::after {
  display: none;
}

.action-dropdown .btn-link {
  color: #333;
}

.action-dropdown .dropdown-menu {
  min-width: 120px;
}

.action-dropdown .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
}

.form-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

thead {
  background-color: #44225c;
}

tbody tr {
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
  background: #fff;
}

table.dataTable thead th,
table.dataTable thead td,
table.dataTable tfoot th,
table.dataTable tfoot td {
  background-color: #44225c !important;
  color: #fff;
}

.page-link,
.page-link.active {
  background-color: #44225c;
  border-color: #44225c;
}

button.dt-button {
  background-color: #3ad77e !important;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

button.dt-button:hover {
  background-color: #2a9d6b;
}

.pagination {
  --bs-pagination-color: var(--theme-default) !important;
  --bs-pagination-active-bg: var(--theme-default) !important;
  --bs-pagination-active-border-color: var(--theme-default) m !important;
}

.page-title-card {
  padding-inline: 1.5625rem;
  padding-block: 0.625rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
}

.modal-body .form-group {
  margin-bottom: 15px;
}

.modal-body .btn-primary {
  background-color: #44225c;
  border-color: #44225c;
}

/* table.dataTable thead th{
  background-color: #fafbfb !important;
  color: #42526d !important;
      text-transform: capitalize;
} */
/* table tbody tr , table tbody tr td{
  background-color: #FFF !important;
  box-shadow: none !important;

} */
/* table td span.bg-info{
  background-color: #f5f6f7 !important;
  color:#091e42 !important;
  font-size: 11px !important;
} */
table td span.bg-info.dots-before::before {
  content: "";
  width: 5px;
  height: 5px;
  display: inline-flex;
  background: #344054;
  margin: 0 6px;
  border-radius: 50%;
}

.table-actions .dropdown-toggle::after {
  border: 0 !important;
}

.table-actions .dropdown-toggle {
  font-size: 17px !important;
  color: #344054 !important;
  cursor: pointer !important;
}

.table-actions .dropdown-menu .dropdown-item {
  opacity: 1 !important;
}

.table .badge-success {
  background: #f5f6f7;
  color: #63d19d;
}

.dt-length {
  text-align: end;
}

.dt-paging {
  justify-items: anchor-center !important;
  margin-top: -6px !important;
}

.dt-paging [type="button"]:not(:disabled),
.dt-paging [type="reset"]:not(:disabled),
.dt-paging [type="submit"]:not(:disabled),
.dt-paging button:not(:disabled) {
  cursor: pointer;
  background: transparent;
  margin: 0 3px;
  border: 0;
  padding: 0 13px;
  height: 35px;
  line-height: 34px;
}

.dt-paging-button.page-item.active button {
  background: #eff1f4;
  color: #344054;
  border-radius: 5px;
}

.dt-paging button:focus {
  box-shadow: none;
}

.dt-paging .page-link.last,
.dt-paging .page-link.first {
  display: none !important;
}

.dt-paging .page-link.next,
.dt-paging .page-link.previous {
  height: 35px;
  line-height: 34px;
  border-radius: 5px;
  border: 1px solid #d0d5dd;
  color: #344054;
}

.dt-paging .page-link.next i,
.dt-paging .page-link.previous i {
  margin: 0 4px;
  vertical-align: middle;
}

.dt-length .form-select:focus {
  box-shadow: none;
}

tbody tr:hover {
  transform: none;
}

.dt-scroll-body {
  max-height: 550px !important;
}

.dt-buttons .btn-secondary:hover {
  color: #fff;
}

table.dataTable thead th {
  border-color: #f2f2f2;
}

span.text-bg-primary {
  background-color: #44225c !important;
}

table.table.dataTable thead {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 9;
}

div:has(> .table.dataTable) {
  overflow: auto;
  max-height: 600px !important;
}

.dropdown-menu .dropdown-item {
  background-color: transparent !important;
  color: inherit !important;
}

.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus {
  background-color: transparent !important;
  color: inherit !important;
}

table .dropdown-menu .dropdown-item {
  border-top: 1px solid #efefef !important;
}

div.dropdown-menu.dt-button-collection.two-column {
  z-index: 10;
}

.page-wrapper .page-body-wrapper .page-title {
  margin: 0 -27px 0px !important;
}

.page-wrapper.compact-small
  .page-body-wrapper
  div.sidebar-wrapper
  .sidebar-main
  .sidebar-links
  .sidebar-list
  .sidebar-submenu
  .main-submenu
  .d-flex {
  text-align: start;
}

.dropdown.table-actions .dropdown-menu.show {
  z-index: 99;
}

.dropdown-menu.actionsMenu {
  top: -85px !important;
  left: -47px !important;
}
</style>
