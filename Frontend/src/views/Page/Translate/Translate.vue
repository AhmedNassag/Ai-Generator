<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('translate.Configuration')"
    :mainSubPage="$t('translate.Translate')"
    :titlePage="$t('translate.Translate')"
    v-permission:show
  >

    <div v-permission:update v-permission:delete></div>
  
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams"   
        :editItem="editItem"  
        :openForm="openForm"   
      >
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"   
        :newItem="newItem"   
        :api="api"   
        :closeForm="closeForm"   
        :formData="true"   
      >
      </Form>
    </template>
  </main-page>

  <!-- Start Translate Modal -->
  <div v-if="openModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("translate.Translate") }}</h5>
        <button
          type="button"
          class="close"
          @click="closeForm()"
          data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row row-sm">
          <div class="col-lg-12 col-md-12">
            <div class="card custom-card">
              <div class="card-body">
                <div class="row row-sm">
                  <div class="col-lg-12">
                    <div class="form-group">
                      <label for="name">{{ $t("translate.Name") }}</label>
                      <input
                        class="form-control"
                        required=""
                        type="text"
                        v-model="newItem.name"
                      />
                    </div>
                  </div>
                  <table class="table" v-if="!load">
                    <thead>
                      <tr>
                        <th scope="col">{{ $t("translate.language key") }}</th>
                        <th scope="col" v-for="lang in language" :key="lang">
                          {{ lang }}
                        </th>
                        <th scope="col">{{ $t("translate.Action") }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">
                          <input class="form-control" v-model="newData.key" />
                        </th>
                        <td v-for="lang in language" :key="lang">
                          <input class="form-control" v-model="newData[lang]" />
                        </td>
                        <td>
                          <button class="btn ripple btn-outline-success btn-icon mr-2" @click="addRow(newData)">
                            <i class="icofont icofont-check"></i>
                          </button>
                        </td>
                      </tr>
                      <tr v-for="(value, key, index) in newItem.en" :key="index">
                        <th scope="row">
                          {{ Object.keys(value)[0] }}
                        </th>
                        <td v-for="lang in language" :key="lang">
                          <input class="form-control" type="text" v-model="newItem[lang][key][Object.keys(value)[0]]" />
                        </td>
                        <td>
                          <button class="btn ripple btn-outline-danger btn-icon mr-2" @click="deleteRow(Object.keys(value)[0])" >
                            <i class="icofont icofont-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <hr />
                <div class="row">
                  <div class="col-6">
                    <button class="btn ripple btn-primary col-12" variant="primary" :disabled="!newItem.ar || loading" @click="editMode ? updateForm() : submitForm()" >
                      <i class="fa fa-plus"/> {{ $t("translate.save") }}
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn ripple btn-warning col-12" @click="closeForm()" variant="success">
                      <i class="fa fa-ban"></i> {{ $t("translate.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Translate Modal -->

</template>

<script>
// Importing necessary components and API modules
import translate from "@/API/Translate/Translate";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from "@/API/Auth";
import language from "@/API/Language/Language";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new translate();
    const apiParams = {};
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fie
    // const language = Auth.LANGUAGE.map((a) => a.code);
    const languageApi =  new language();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      languageApi,
    };
  },
 
  async mounted() {
      const language = await this.languageApi.getAll();
      this.language  = language.map((a) => a.code);
      // Fetch roles
      //this.roles = await this.roleApi.getAll({ select: "id|name" });
      // Update options dynamically in the form field
      //const myOptionsField = this.fromFields.find((field) => field.name === "myOptions");
      //myOptionsField.options = this.roles.map((role) => ({
        //id: role.id,
        //name: role.name,
      //}));
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      load: false,
      openModal: false,
      editMode: false,
      file: {},
      invalid: {},
      errors: [],
      newData: {},
      value: [],
      ids: {},
      language:{},
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id:"name", title: this.$t("translate.Name"), data: "name", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("translate.Name"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        description: this.$t("translate.Please enter name"),
        col: 5, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.openModal = true;
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.newItem = {};  // Clear the current item data
      this.openModal = false;  // Close the modal
      this.editMode = false; // Set edit mode to false
      this.$refs.table.refreshTable();  // Refresh the table data
    },

    //Set the item data for editing
    async editItem(data) {
      // this.newItem = data;  // Set the current item to edit

      // Deep clone to avoid mutating original data
      this.newItem = JSON.parse(JSON.stringify(data));
      // Remove languages not in the current language list, but keep 'id' and 'name'
      Object.keys(this.newItem).forEach(key => {
        if (
          key !== 'name' &&
          key !== 'id' &&
          !this.language.includes(key)
        ) {
          delete this.newItem[key];
        }
      });

      // Ensure all languages exist and are arrays of single-key objects
      this.language.forEach(lang => {
        if (!Array.isArray(this.newItem[lang])) {
          this.newItem[lang] = [];
        }
      });

      // Collect all unique translation keys
      let allKeys = new Set();
      this.language.forEach(lang => {
        this.newItem[lang].forEach(obj => {
          Object.keys(obj).forEach(k => allKeys.add(k));
        });
      });

      // For each language, ensure every key exists, and only as a single-key object
      this.language.forEach(lang => {
        let keyMap = {};
        this.newItem[lang].forEach(obj => {
          let k = Object.keys(obj)[0];
          keyMap[k] = obj[k];
        });
        // Fill missing keys with empty string
        allKeys.forEach(k => {
          if (!(k in keyMap)) {
            keyMap[k] = ' ';
          }
        });
        // Rebuild as array of single-key objects
        this.newItem[lang] = Array.from(allKeys).map(k => ({ [k]: keyMap[k] }));
      });

      this.openForm();
      this.editMode = true;
    },
    
    //submitForm
    async submitForm() {
      this.loading = true; // Disable button when submitting
      try {
        const ret = await this.api.from(this.newItem, false, false);
        this.closeForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        this.loading = false; // Re-enable button when done
      }
    },

    //updateForm
    async updateForm() {
      this.loading = true; // Disable button when updating
      try {
        const ret = await this.api.update(this.newItem, false, false);
        this.closeForm();
      } catch (error) {
        console.error("Error updating form:", error);
      } finally {
        this.loading = false; // Re-enable button when done
      }
    },
    //addRow
    addRow() {
      let trKey = "";
      this.language.forEach((lang) => {
        if (!this.newItem[lang]) {
          this.newItem[lang] = [];
        }
        this.newItem[lang].push({ [this.newData.key]: this.newData[lang] });
      });
      this.newData = {};


      if (!this.newData.key) return;
      this.language.forEach(lang => {
        if (!this.newItem[lang]) {
          this.newItem[lang] = {};
        }
        this.newItem[lang][this.newData.key] = this.newData[lang] || '';
      });
      this.newData = {};
    },
    //deleteRow
    deleteRow(keyToDelete) {
      this.language.forEach((lang) => {
        // Find the index of the item with matching key
        const index = this.newItem[lang].findIndex(item => 
          Object.keys(item)[0] === keyToDelete
        );
        
        if (index !== -1) {
          this.newItem[lang].splice(index, 1);
        }
      });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
[dir="rtl"] .search-field {
  text-align: end;
}
</style>
