<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('phishingwebsitepage.phishingwebsitepage')"
    :subPage="$t('phishingwebsitepage.phishingwebsitepage')" :titlePage="$t('phishingwebsitepage.phishingwebsitepage')">

    <template #datatable>

      <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

      <div class="product-wrapper-grid" id="website-parent-div">
        <div class="row">
          <div class="col-xl-3 col-sm-6 xl-4 website-card" v-for="website in phishingWebsites" :key="website.id">
            <div class="card">
              <div class="product-box">
                <div class="product-img">
                  <img class="img-fluid" :src="website.fullCoverPath" :alt="$t('phishingwebsitepage.NoImageAlt')" />
                  <div class="product-hover">
                    <ul>
                      <li>
                        <a class="show-frame trash-website" @click="deletePhishingWebsite(website)">
                          <i class="fa-solid fa-trash"></i>
                        </a>
                      </li>
                      <li>
                        <a class="edit-website" @click="editItem(website)">
                          <i class="fa-solid fa-pen"></i>
                        </a>
                      </li>
                      <li>
                        <router-link :to="{ name: 'PreviewWebsitePage', params: { id: website.id } }" target="_blank">
                          <i class="fa-solid fa-eye"></i>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="product-details">
                  <h4>{{ website.name }}</h4>
                  <p>{{ website.category?.name || '' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #form>

    </template>
  </main-page>

  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ formData.id ? $t('phishingwebsitepage.EditWebsite') :
          $t('phishingwebsitepage.AddNewWebsite') }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="saveItem">
          <v-row>
            <v-col cols="12" md="6">
              <v-label class="my-2">{{ $t('phishingwebsitepage.WebsiteName') }}</v-label>
              <v-text-field v-model="formData.name"
                :rules="[v => !!v || $t('phishingwebsitepage.ThisFieldIsRequired')]" />
            </v-col>

            <v-col cols="12" md="6">
              <v-label class="my-2">{{ $t('phishingwebsitepage.Category') }}</v-label>
              <v-select id="Category" v-model="formData.phishing_category_id" :options="categories"
                :placeholder="$t('phishingwebsitepage.SelectCategoryOption')" :reduce="option => option.id" label="name"
                clearable :rules="[v => !!v || $t('phishingwebsitepage.CategoryIsRequiredValidation')]"></v-select>
            </v-col>

            <!-- Radio buttons for 'Type' -->
            <v-col cols="12" md="12">
              <v-label class="my-2">{{ $t('phishingwebsitepage.Type') }}</v-label>
              <v-radio-group v-model="formData.type"
                :rules="[v => !!v || $t('phishingwebsitepage.TypeIsRequiredValidation')]">
                <v-row>
                  <v-col cols="auto">
                    <v-radio :label="$t('phishingwebsitepage.Managed')" value="managed"></v-radio>
                  </v-col>
                  <v-col cols="auto">
                    <v-radio :label="$t('phishingwebsitepage.Own')" value="own"></v-radio>
                  </v-col>
                </v-row>
              </v-radio-group>
            </v-col>

            <v-col cols="12" :md="colSize">
              <v-label class="my-2">{{ $t('phishingwebsitepage.FromAddressName') }}</v-label>
              <v-text-field v-model="formData.from_address_name" />
            </v-col>

            <v-col cols="12" md="6" v-if="formData.type === 'managed'">
              <v-label class="my-2">{{ $t('phishingwebsitepage.Domain') }}</v-label>
              <v-select id="Domain" v-model="formData.domain_id" :options="domains"
                :placeholder="$t('phishingwebsitepage.SelectDomainOption')" :reduce="option => option.id" label="name"
                clearable :rules="[v => !!v || $t('phishingwebsitepage.DomainIsRequiredValidation')]"></v-select>
            </v-col>

            <!-- Cover image input -->
            <v-col cols="12" md="12">
              <v-label class="my-2">{{ $t('phishingwebsitepage.CoverImage') }}</v-label>
              <v-file-input v-model="formData.cover" accept="image/*" />
            </v-col>

            <v-col cols="12">
              <label class="mb-2 font-weight-medium">{{ $t('phishingwebsitepage.HTMLCode') }}</label>
              <ckeditor :editor="editor" v-model="formData.html_code" :config="editorConfig"></ckeditor>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">{{ $t('phishingwebsitepage.Cancel') }}</v-btn>
        <v-btn color="primary" @click="saveItem">{{ formData.id ? $t('phishingwebsitepage.Update') :
          $t('phishingwebsitepage.Save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import phishingwebsitepage from "@/API/PhishingWebsitePage/PhishingWebsitePage";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import PhishingCategory from "@/API/PhishingCategory/PhishingCategory";
import PhishingDomain from "@/API/PhishingDomain/PhishingDomain";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    vSelect
  },

  setup() {
    const api = new phishingwebsitepage();
    const phishingWebsiteCtaegories = new PhishingCategory();
    const phishingDomains = new PhishingDomain();

    const apiParams = { page: 1, perPage: 6 };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      phishingWebsiteCtaegories,
      phishingDomains,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,

        autoParagraph: false,
        entities: false,
        entities_latin: false,
        entities_greek: false,
        allowedContent: true, // Allow all HTML content without filtering
        // enterMode: 'br', // CKEditor 5 uses 'br' instead of CKEDITOR.ENTER_BR
        // shiftEnterMode: 'br', // Same for shiftEnterMode
        forcePasteAsPlainText: true, // Optionally force pasting as plain text
      },

      isFlipped: false,
      dialog: false,
      formData: {
        id: null,
        name: '',
        phishing_category_id: '',
        type: 'managed',
        from_address_name: '',
        domain_id: '',
        cover: null,
        html_code: '' // ck editor
      },
      phishingWebsites: [],
      page: 1,
      perPage: 6,
      hasMore: true,
      loadingMore: false,
      categories: [
        {
          'id': 1,
          "name": 'Cat 1'
        }
      ],
      domains: [],
      loading: false,

    };
  },

  computed: {
    colSize() {
      return this.formData.type === 'managed' ? 6 : 12;
    }
  },

  async mounted() {
    await this.fetchPhishingwebsites(this.$route.params.id);
    await this.fetchPhishingCategories();
    await this.fetchPhishingDomains();

    window.addEventListener("scroll", this.handleScroll);
    this.formData.type = 'managed';
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    async fetchPhishingwebsites(id) {
      this.loading = true;
      const response = await this.api.getAll({
        filter: `domain_id|${id}|=`,
        page: this.page,
        perPage: this.perPage
      });
      if (response?.data?.length) {
        this.phishingWebsites.push(...response.data);
        this.loading = false;
        this.hasMore = response.data.length === this.perPage;
      } else {
        this.hasMore = false;
        this.loading = false;
      }
    },

    async fetchPhishingCategories() {
      const res = await this.phishingWebsiteCtaegories.getAll({
        select: "id|name",
      });
      this.categories = res;
    },
    async fetchPhishingDomains() {
      const res = await this.phishingDomains.getAll({
        select: "id|name",
      });
      this.domains = res;
    },

    handleScroll() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2 && this.hasMore && !this.loadingMore) {
        this.loadingMore = true;
        this.page++;
        this.fetchPhishingwebsites(this.$route.params.id).finally(() => {
          this.loadingMore = false;
        });
      }
    },

    openForm() {
      console.log('open form ');
      this.formData = { id: null, name: '', category_id: null, cover: null };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
    },

    editItem(website) {
      this.formData = { ...website };
      this.dialog = true;
    },

    async saveItem() {
      this.formData.html_code = this.cleanHtmlCode(this.formData.html_code);
      let response = null;
      if (this.formData.id) {
        console.log('enter edit')
        response = await this.api.update(this.formData);
      } else {
        response = await this.api.insert(this.formData);
      }

      if (response.status == "success") {
        this.api.poup(response, "Saved Successfully!");
        this.dialog = false;
      } else {
        this.api.poup(response, "Validation Error !");
      }

      this.page = 1;
      this.phishingWebsites = [];
      await this.fetchPhishingwebsites(this.$route.params.id);
    },

    cleanHtmlCode(html) {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      let cleanHtml = txt.value;

      cleanHtml = cleanHtml.replace(/^<p>|<\/p>$/g, "");

      cleanHtml = cleanHtml.replace(/&nbsp;/g, '');
      cleanHtml = cleanHtml.replace(/&quot;/g, '"');
      cleanHtml = cleanHtml.replace(/&lt;/g, '<');
      cleanHtml = cleanHtml.replace(/&gt;/g, '>');

      cleanHtml = cleanHtml.replace(/(<br\s*\/?>\s*)+/g, '');

      cleanHtml = cleanHtml.replace(/<style>\s*<br>/g, "<style>");
      cleanHtml = cleanHtml.replace(/<br>\s*<\/style>/g, "</style>");

      cleanHtml = cleanHtml.replace(/<br\s*\/?>/g, "\n");
      return cleanHtml;
    },


    async deletePhishingWebsite(website) {
      await this.api.delete(website.id);
      this.page = 1;
      this.phishingWebsites = [];
      await this.fetchPhishingwebsites(this.$route.params.id);
    },
  },
};
</script>

<style scoped>
.website-card .product-hover ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.website-card .product-hover ul li {
  display: inline;
}

.product-box {
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-img {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.product-img img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.product-details {
  padding: 10px 0;
}
</style>
