<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('Awareness')" :mainSubPage="$t('Campaign')"
    :subPage="$t('phishingdomain.phishingdomain')" :titlePage="$t('phishingdomain.phishingdomain')" v-permission:show>

    <template #datatable>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary mb-10 my-3" @click="openForm" v-permission:insert>
          {{ $t('phishingdomain.add_new_domain') }}
        </button>
      </div>

      <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

      <div class="row" style="background-color: #f2f2f2; padding: 3rem 1.5rem; margin-top: -1rem;">
        <div class="col-md-4 mb-4" v-for="(domain, index) in phishingDomains" :key="index">
          <div class="p-3">
            <div class="card shadow" style="background-color: #fff;">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 d-flex align-items-center justify-content-center">
                    <v-progress-circular
                      :model-value="phishingWebsitePagesThatHaveDomainsCount > 0 ? (domain.websites.length / phishingWebsitePagesThatHaveDomainsCount) * 100 : 0"
                      color="green" size="70" width="6">
                      {{
                        phishingWebsitePagesThatHaveDomainsCount > 0
                          ? ((domain.websites.length / phishingWebsitePagesThatHaveDomainsCount) * 100).toFixed(0)
                          : 0
                      }}%
                    </v-progress-circular>
                  </div>

                  <div class="col-md-9">
                    <h5 class="mb-3 text-dark text-center text-sm-start fs-5">{{ domain.name }}</h5>

                    <div class="d-flex">
                      <button v-permission:update class="btn btn-sm btn-secondary me-1" type="button"
                        @click="editItem(domain)">
                        <i class="fa-solid fa-pen" :title="$t('global.edit')"></i>
                      </button>

                      <router-link class="btn btn-sm btn-secondary me-1"
                        :to="{ name: 'DomainWebsites', params: { id: domain.id } }"
                        :title="$t('phishingdomain.websites')" v-permission:showWebsites>
                        <i class="fa-solid fa-globe"></i>
                      </router-link>

                      <button v-permission:delete class="btn btn-sm btn-secondary" type="button"
                        @click="deletePhishingDomain(domain.id)">
                        <i class="fa-solid fa-trash" :title="$t('global.delete')"></i>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>


<script>
// Importing necessary components and API modules
import phishingdomain from "@/API/PhishingDomain/PhishingDomain";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import PhishingWebsitePage from "@/API/PhishingWebsitePage/PhishingWebsitePage";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new phishingdomain();
    const phishingWebsitePage = new PhishingWebsitePage();
    const apiParams = {
      with: ['websites'],
      'page': 1,
      'perPage': 9,
    };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      phishingWebsitePage,
      phishingWebsitePagesThatHaveDomainsCount: 0,
    };
  },

  async mounted() {
    const response = await this.phishingWebsitePage.getAll(
      { filter: "domain_id|-null|!=" }
    );
    this.phishingWebsitePagesThatHaveDomainsCount = response.length;

    window.addEventListener("scroll", this.handleScroll);
    await this.fetchPhishingDomains();
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item

      phishingDomains: [],
      page: 1,
      perPage: 9,
      hasMore: true,
      loadingMore: false,
      phishingWebsitePagesCount: 0,
      loading: false,
    };
  },

  created() {
    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("phishingdomain.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("phishingdomain.description"), // Description for the field
        col: 12, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    async closeForm() {
      this.page = 1;
      await this.fetchPhishingDomains();
      this.isFlipped = false;  // Hide the form
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async fetchPhishingDomains() {
      try {
        this.loading = true;
        this.phishingDomains = [];
        this.loadingMore = true;

        const params = {
          ...this.apiParams,
          page: this.page,
          perPage: this.perPage,
        };

        const response = await this.api.getAll(params);
        const domains = Array.isArray(response.data) ? response.data : response.data?.data || [];

        // remove duplication
        const newDomains = domains.filter(
          (domain) => !this.phishingDomains.some((c) => c.id === domain.id)
        );
        this.phishingDomains.push(...newDomains);

        if (domains.length < this.perPage) {
          this.hasMore = false;
        }

        this.page++;
      } catch (error) {
        console.error("Failed to fetch PhishingDomains:", error);
      } finally {
        this.loadingMore = false;
        this.loading = false;
      }
    },


    async deletePhishingDomain(domain) {
      try {
        const response = await this.api.delete(domain);
        this.page = 1;
        if (response.status == "success") {
          await this.fetchPhishingDomains();
        }
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      }
    },

    async handleScroll() {
      const bottomOfWindow =
        window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;

      if (bottomOfWindow && this.hasMore && !this.loadingMore) {
        await this.fetchPhishingDomains();
      }
    },

  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
