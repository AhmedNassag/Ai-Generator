<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('common.configration')"
    :mainSubPage="$t('general_settings.general_settings')" :titlePage="$t('general_settings.general_settings')">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">

        <!--type-->
        <template #type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="type">{{ $t('general_settings.type') }}</label>
            <input class="form-control" id="type" v-model="newItem.type" :disabled="isTypeDisabled"
              value="thirdPartyRequests">
          </div>
        </template>


        <template #FullImagePathLogo="{ item }" v-if="FullImagePathLogo">
          <div v-if="FullImagePathLogo" class="col-6 text-center">
            <label for="type">{{ $t('general_settings.old_logo') }}</label><br>
            <img v-if="isImageFile(FullImagePathLogo)" :src="FullImagePathLogo" class="img-thumbnail"
              style="max-height: 200px;" />
          </div>
        </template>

        <template #FullImagePathFavicon="{ item }" v-if="FullImagePathFavicon">
          <div v-if="FullImagePathFavicon" class="col-6 text-center">
            <label for="type">{{ $t('general_settings.old_favicon') }}</label><br>
            <img v-if="isImageFile(FullImagePathFavicon)" :src="FullImagePathFavicon" class="img-thumbnail"
              style="max-height: 200px;" />
          </div>
        </template>

        <template #FullImagePathImages="{ item }" v-if="FullImagePathImages">
          <div v-if="FullImagePathImages" class="col-6 text-center">
            <label for="type">{{ $t('general_settings.old_images') }}</label><br>
            <img v-if="isImageFile(FullImagePathImages)" :src="FullImagePathImages" class="img-thumbnail"
              style="max-height: 200px;" />
          </div>
        </template>

        <template v-slot:custom="{ field }">
          <div v-if="['logo', 'favicon', 'images'].includes(field.name)" class="form-group">
            <label>{{ field.label }}</label>
            <input type="file" @change="previewImage($event, field.name)" />
            <img v-if="imagePreviews[field.name]" :src="imagePreviews[field.name]" class="preview-image" />
          </div>
        </template>

      </Form>
    </template>
  </main-page>





</template>

<script>
/*
import generalsettings from "@/API/GeneralSettings/GeneralSettings";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable
  },

  setup() {

    const api = new generalsettings();
    const apiParams = { filter: `type|generalSetting|=` };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      ldapData: [],
      tableColumns,
      fromFields
    };
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {type:'generalSettings'}, // Data object to store the currently selected item for editing or new item
      imagePreviews: {}
    };
  },

  created() {
    this.fetchLdapData();

    this.fromFields = [
      {
        name: "name",
        label: this.$t("name"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "author",
        label: this.$t("author"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your author name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "author_abbreviation",
        label: this.$t("author_abbreviation"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your author_abbreviation name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "website",
        label: this.$t("website"),
        type: "url", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a valid url.",
        col: 6,
      },
      {
        name: "owner",
        label: this.$t("owner"),
        type: "text", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a owner name.",
        col: 6,
      },
      {
        name: "logo",
        label: this.$t("logo"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a logo.",
        col: 6,
      },
      {
        name: "favicon",
        label: this.$t("favicon"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a favicon.",
        col: 6,
      },
      {
        name: "images",
        label: this.$t("images"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a images.",
        col: 6,
      },
      /*
      {
        name: "type",
        value: "generalSettings",
        label: this.$t("generalsettings.type"),
        type: "text|hidden",
        rules: "required",
        description: "Please enter type.",
        col: 6, // Column size in the form layout
      },
      *
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },
    previewImage(event, fieldName) {
      const file = event.target.files[0];
      if (file) {
        this.imagePreviews[fieldName] = URL.createObjectURL(file);
      }
    },
    async fetchLdapData() {
      try {
        const response = await this.api.insert();


        response.data.logo = null;

        response.data.images = null;

        response.data.favicon = null;


        console.log(response.data);
        this.ldapData = response.data;
        this.newItem = this.ldapData;

      } catch (error) {
        console.error(
          "Error fetching LDAP data:",
          error.response?.data || error.message
        );
      }
    },

    // Close the form after submitting or canceling
    // closeForm() {
    //   this.isFlipped = false; // Hide the form
    //   // this.$refs.table.refreshTable();  // Refresh the table data
    //   // this.newItem = {};  // Clear the current item data
    // },

    // Instead of just closing the form, we reload the page to reset all form data and state
    closeForm() {
      window.location.reload();
    },

    // Set the item data for editing
    editItem(item) {
      this.newItem = { ...item };
      this.isFlipped = true;
    }
  },
};
*/






import generalsettings from "@/API/GeneralSettings/GeneralSettings";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new generalsettings();
    const apiParams = { filter: `type|generalSettings|=` };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields
    };
  },

  async mounted() {

    // Fetch data from the generalstsetting API
    this.generalSettings = await this.api.getAll(this.apiParams);
    // Check if data is returned
    if (this.generalSettings.length > 0) {
      this.hasData = true; // Set flag to true if data exists
      this.editItem(this.generalSettings[0]); // Load the first record into the edit form
    } else {
      this.hasData = false; // Set flag to false if no data exists
      this.openForm(); // Open the form for adding a new record
    }

  },
  data() {
    return {
      isFlipped: true, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: { type: 'generalSettings' }, // Data object to store the currently selected item for editing or new item
      isTypeDisabled: true,
      hasData: false, // Flag to track if API returned data
      generalSettings: [], // Store API response data
      imagePreviews: {},
      FullImagePathLogo: null,
      FullImagePathFavicon: null,
      FullImagePathImages: null,
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("common.name"), data: "name", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "author",
        label: this.$t("general_settings.author"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your author name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "author_abbreviation",
        label: this.$t("general_settings.author_abbreviation"),
        type: "text", // Text input field
        rules: "", // Validation rule: required field
        // description: "Please enter your author_abbreviation name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "owner",
        label: this.$t("general_settings.owner"),
        type: "text", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a owner name.",
        col: 6,
      },
      {
        name: "website",
        label: this.$t("general_settings.website"),
        type: "url", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a valid url.",
        col: 12,
      },
      {
        name: "logo",
        label: this.$t("general_settings.logo"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a logo.",
        col: 6,
      },
      {
        name: "FullImagePathLogo",
        // label: this.$t("generalsetting.FullImagePathLogo"),
        type: "hidden",
        rules: "",
        disabled: false,
        description: "",
        col: 6,
      },
      {
        name: "favicon",
        label: this.$t("general_settings.favicon"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a favicon.",
        col: 6,
      },
      {
        name: "FullImagePathFavicon",
        // label: this.$t("generalsetting.FullImagePathFavicon"),
        type: "hidden",
        rules: "",
        disabled: false,
        description: "",
        col: 6,
      },
      {
        name: "images",
        label: this.$t("general_settings.images"),
        type: "file", // Text input field for email
        rules: "", // Validation rule: required and valid email format
        // description: "Please enter a images.",
        col: 6,
      },
      {
        name: "FullImagePathImages",
        // label: this.$t("generalsetting.FullImagePathImages"),
        type: "hidden",
        rules: "",
        disabled: false,
        description: "",
        col: 6,
      },

      /*
      {
        name: "type",
        value: "generalSettings",
        label: this.$t("generalsetting.type"),
        type: "text|hidden",
        rules: "required",
        description: "Please enter type.",
        col: 6, // Column size in the form layout
      },
      */
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      window.location.reload();
      this.isFlipped = true;  // Hide the form
      // this.$refs.table.refreshTable();  // Refresh the table data
      // this.newItem = {type:'generalSettings'};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit

      if (data.logo) {
        this.FullImagePathLogo = data.FullImagePathLogo;
      } else {
        this.FullImagePathLogo = null;
      }

      if (data.favicon) {
        this.FullImagePathFavicon = data.FullImagePathFavicon;
      } else {
        this.FullImagePathFavicon = null;
      }

      if (data.images) {
        this.FullImagePathImages = data.FullImagePathImages;
      } else {
        this.FullImagePathImages = null;
      }

      this.isFlipped = true; // Show the form for editing
    },

    isImageFile(path) {
      if (!path) return false;
      const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
      return extensions.some(ext => path.toLowerCase().endsWith(ext));
    },

  },
};




</script>

<style scoped>
/* Scoped styles for the component */
.preview-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-left: 10px;
  border-radius: 5px;
}
</style>
