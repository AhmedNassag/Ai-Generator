<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('risk.risk_mngt')" :mainSubPage="$t('asset.asset_mngt')"
    :subPage="$t('asset.asset_group')" :titlePage="$t('asset.asset_group')" v-permission:show>

    <div v-permission:update v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'" v-permission:show
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->

        <template #assets="{ item }">
          <!-- Show first asset name -->
          <span v-if="item.assets && item.assets.length" class="title_span">
            {{ item.assets[0]?.name }}
          </span>
          <span v-else>N/A</span>

          <!-- If more than one, show +number -->
          <template v-if="item.assets && item.assets.length > 1">
            <span class="more-parties-count" @click="openAssetsModal(item)">
              +{{ item.assets.length - 1 }}
            </span>
          </template>
        </template>

      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <!-- Modal for affected parties -->
  <Modal v-model="showAssetsModal" :title="$t('asset.assets')" size="medium" :has-submit="false" :show-footer="false">
    <div class="d-flex flex-wrap gap-2">
      <span v-for="asset in selectedAssets" :key="asset" class="title_span">
        {{ getAssetNameById(asset.id) }}
      </span>
    </div>
  </Modal>

</template>

<script>
// Importing necessary components and API modules
import assetgroup from "@/API/AssetGroup/AssetGroup";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Asset from "@/API/Asset/Asset";
import Modal from "@/components/Modal.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    Modal,
  },

  setup() {
    // Initialize API and other required properties
    const api = new assetgroup();
    const apiParams = { with: ["assets:id,name,asset_group_ids"] };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const assetApi = new Asset();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      assetApi
    };
  },

  async mounted() {
    await this.loadAssets();
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      showAssetsModal: false,
      selectedAssets: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("common.name"), data: "name", defaultContent: "N/A" },
      { id: "assets", title: this.$t("asset.assets"), data: null, defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        col: 6, // Column size in the form layout
      },
      {
        type: "options",  // Dropdown/select field
        name: "asset_ids",
        label: this.$t("asset.assets"),
        options: "Asset",
        optionLabel: "name",
        col: 6,
        multiple: true,
        rules: "required",  // Validation: required selection
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async loadAssets() {
      try {
        const response = await this.assetApi.getAll({ select: "id|name" });

        this.assets = response.map(asset => ({ id: asset.id, name: asset.name })); // in case of the listed columns is not contains name column

      } catch (error) {
        console.error("Failed to load assets:", error);
      }
    },

    getAssetNameById(assetId) {
      if (!this.assets || !Array.isArray(this.assets)) return null;
      const asset = this.assets.find(item => item.id === assetId);
      return asset ? asset.name : "N/A";
    },

    openAssetsModal(item) {
      this.selectedAssets = item.assets;
      console.log("selected assets", this.selectedAssets);
      this.showAssetsModal = true;
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.title_span {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 11px 9px;
  gap: 8px;
  background: #D0B5E3;
  font-size: 12px;
  color: #6E3894;
}

.more-parties-count {
  color: var(--primary-color, #6E3894);
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s ease;
}

.more-parties-count:hover {
  color: var(--primary-dark, #6E3894);
}
</style>
