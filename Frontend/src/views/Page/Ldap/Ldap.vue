<template>
  <main-page ref="page" :isFlipped="!isFlipped" :mainPage="$t('common.configration')" :mainSubPage="$t('ldap.ldap')"
    :titlePage="$t('ldap.ldap')">

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>

<script>
import ldap from "@/API/Ldap/Ldap";
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
    const api = new ldap();
    const apiParams = { filter: "" };
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
      isFlipped: false,
      isReadonly: false,
      newItem: {}
    };
  },

  created() {
    this.fetchLdapData();

    this.fromFields = [
      {
        name: "hosts",
        label: this.$t("ldap.hosts"),
        type: "text",
        rules: "required",
        description: this.$t("ldap.hosts_description"),
        col: 6
      },
      {
        name: "port",
        label: this.$t("ldap.port"),
        type: "number",
        rules: "required",
        description: this.$t("ldap.port_description"),
        col: 6
      },
      {
        name: "base_dn",
        label: this.$t("ldap.base_dn"),
        type: "text",
        rules: "required",
        description: this.$t("ldap.base_dn_description"),
        col: 6
      },
      {
        name: "username",
        label: this.$t("ldap.username"),
        type: "text",
        rules: "required",
        description: this.$t("ldap.username_description"),
        col: 6
      },
      {
        name: "password",
        label: this.$t("ldap.password"),
        type: "password",
        rules: "",
        description: this.$t("ldap.password_description"),
        col: 6
      },
      {
        name: "filter",
        label: this.$t("ldap.filter"),
        type: "text",
        rules: "",
        description: this.$t("ldap.filter_description"),
        col: 6
      },
      {
        name: "version",
        label: this.$t("ldap.version"),
        type: "number",
        rules: "required",
        description: this.$t("ldap.version_description"),
        col: 6
      },
      {
        name: "timeout",
        label: this.$t("ldap.timeout"),
        type: "number",
        rules: "required",
        description: this.$t("ldap.timeout_description"),
        col: 6
      },
      {
        name: "ssl",
        label: this.$t("ldap.ssl"),
        type: "checkbox",
        rules: "",
        rules: value => typeof value === "boolean" || "Invalid value",
        description: this.$t("ldap.ssl_description"),
        col: 4
      },
      {
        name: "tls",
        label: this.$t("ldap.tls"),
        type: "checkbox",
        rules: "",
        rules: value => typeof value === "boolean" || "Invalid value",
        description: this.$t("ldap.tls_description"),
        col: 4
      },
      {
        name: "follow",
        label: this.$t("ldap.follow"),
        type: "checkbox",
        rules: "",
        rules: value => typeof value === "boolean" || "Invalid value",
        description: this.$t("ldap.follow_description"),
        col: 4
      }
    ];
    
  },

  methods: {
    openForm() {
      this.isFlipped = true;
    },
    async fetchLdapData() {
      try {
        const response = await this.api.CreateOrUpdate();
        this.ldapData = response.data;
        const { password, ...filteredData } = this.ldapData;
        this.newItem = { ...filteredData };
      } catch (error) {
        console.error(
          "Error fetching LDAP data:",
          error.response?.data || error.message
        );
      }
    },

    closeForm() {
      this.isFlipped = false;
      // this.$refs.table.refreshTable();
      // this.newItem = {password: '' };
    },

    editItem(item) {
      this.newItem = { ...item };
      this.isFlipped = true;
    }
  }
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
