<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('emailconfig.emailconfig')"
    :subPage="$t('emailconfig.emailconfig')"
    :titlePage="$t('emailconfig.emailconfig')"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>
    <!-- Slot for rendering the DataTable -->
    <!-- <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :openForm="openForm">
        <template #Name="{ item }"> My - {{ item.name }} </template>
</DataTable>
</template> -->

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
        :errors="errors"
      ></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import emailconfig from "@/API/EmailConfig/EmailConfig";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new emailconfig();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  data() {
    return {
      isFlipped: true, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
    };
  },

  created() {
    // Initialize the table columns when the component is created
    this.tableColumns = [
      {
        title: this.$t("emailconfig.email_type"),
        data: "email_type",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.smtp_username"),
        data: "smtp_username",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.smtp_from_username"),
        data: "smtp_from_username",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.smtp_username"),
        data: "smtp_username",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.smtp_server"),
        data: "smtp_server",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.smtp_port"),
        data: "smtp_port",
        defaultContent: "N/A",
      },
      {
        title: this.$t("emailconfig.ssl_tls"),
        data: "ssl_tls",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "id",
        type: "hidden",
        rules: "",
      },
      {
        type: "options", // Dropdown/select field
        name: "email_type",
        label: this.$t("emailconfig.SMTP"),
        options: [
          { id: "smtp", name: "SMTP" },
          { id: "exchange", name: "Exchange" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description:
          "Select the email protocol to use for the client configuration.",
      },
      {
        name: "smtp_username",
        label: this.$t("emailconfig.SMTPUserName"),
        type: "text", // Text input field for email
        rules: "required", // Validation: required selection
        description: "Enter the username for the SMTP server.",
        col: 6,
      },
      {
        name: "smtp_from_username",
        label: this.$t("emailconfig.SmtpFromUsername"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required
        description: "Enter the 'From' username for outgoing emails.",
        col: 6,
      },
      {
        name: "smtp_password",
        label: this.$t("emailconfig.SMTPPassword"),
        type: "password", // Text input field
        rules: "required", // Validation: required selection
        description: "Enter the password for the SMTP server.",
        col: 6,
      },
      {
        name: "smtp_server",
        label: this.$t("emailconfig.SMTPServer"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required
        description: "Enter the SMTP server address (e.g., smtp.example.com).",
        col: 6,
      },
      {
        name: "smtp_port",
        label: this.$t("emailconfig.SMTPPort"),
        type: "text", // Text input field
        rules: "required|number", // Validation rule: required
        description: "Enter the SMTP server port number (e.g., 465 for SSL).",
        col: 6,
      },
      {
        type: "options", // Dropdown/select field
        name: "ssl_tls",
        label: this.$t("emailconfig.SMTPSecurity"),
        options: [
          { id: "off", name: "OFF" },
          { id: "ssl", name: "SSL" },
          { id: "tls", name: "TLS" },
          { id: "STARTTLS", name: "STARTTLS" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select the security protocol for the SMTP connection.",
      },
    ];
    // Fetch the first record after the component has been created
    this.fetchFirstRecord();
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.fetchFirstRecord();
      // this.isFlipped = true;  // Show the form
      // this.errors = {};
    },
    async fetchFirstRecord() {
      try {
        const records = await this.api.getAll();

        if (records.length > 0 && records[0]) {
          // Check if the first record exists and is not null
          this.newItem = records[0]; // Populate the form with the first record
        } else {
          // If no records exist, don't set newItem to anything
          console.log("No valid records found.");
        }
      } catch (error) {
        console.error("Error fetching the first record:", error);
      }
    },

    // Close the form after submitting or canceling
    closeForm() {
      //       this.newItem = {};
      // this.fetchFirstRecord();
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      // errors = {};
      // this.isFlipped = true; // Show the form for editing
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
input[name="id"] {
  display: none;
}
</style>
<style>
.alert-danger {
  display: none !important;
}
</style>
