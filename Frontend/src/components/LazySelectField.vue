<template>
  <div>
    <v-select
      :key="`vselect-${name}`"
      :options="internalOptions"
      :disabled="disabled"
      :label="optionLabel"
      :reduce="reduceFunction"
      v-model="displayValue"
      :multiple="multiple"
      :placeholder="placeholder"
      @update:modelValue="handleUpdate"
      :filterable="filterable"
      :clearable="clearable"
      :selectable="selectableFunction"
      :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
      @open="onOpen"
      @search="onSearch"
    >
      <!-- option slot -->
      <template #option="slotProps">
        <slot name="option" v-bind="slotProps">
          {{ slotProps[optionLabel] }}
        </slot>
      </template>

      <!-- selected option slot -->
      <template #selected-option="slotProps">
        <slot name="selected-option" v-bind="slotProps">
          {{ slotProps[optionLabel] }}
        </slot>
      </template>

      <!-- infinite scroll -->
      <template #list-footer>
        <li v-show="hasMorePages" ref="loadMoreTrigger" class="load-more-trigger">
          <span v-if="loading">Loading...</span>
        </li>
      </template>
    </v-select>

    <!-- vee-validate -->
    <Field :name="name" :rules="rules" v-model="internalValue" style="display: none" />
  </div>
</template>

<script>
import VueSelect from "vue-select";
import { Field } from "vee-validate";

export default {
  name: "LazySelectField",

  components: {
    "v-select": VueSelect,
    Field,
  },

  props: {
    modelValue: { default: null },
    options: { type: [Array, String], default: null },
    apiParams: { type: Object, default: () => ({}) },
    perPage: { type: Number, default: 10 },
    disabled: { type: Boolean, default: false },
    optionLabel: { type: String, default: "name" },
    optionValue: { type: String, default: "id" },
    multiple: { type: Boolean, default: false },
    placeholder: { type: String, default: "Please select" },
    filterable: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
    selectable: { type: Function, default: null },
    onUpdate: { type: Function, default: null },
    name: { type: String, required: true },
    rules: { type: [String, Object, Function], default: "" },
    // Added props as requested
    apiPathPattern: {
      type: String,
      default: "flat", // 'flat' or 'nested'
      validator: (value) => ["flat", "nested"].includes(value),
    },
    FolderName: {
      type: String,
      default: "",
    },
    BaseModule: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      internalOptions: [],
      loading: false,
      currentPage: 1,
      hasMorePages: false,
      apiInstance: null,
      observer: null,
      searchQuery: "",
      searchTimeout: null,
    };
  },

  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },

    // New computed property to convert IDs to objects for vue-select
    displayValue: {
      get() {
        if (!this.modelValue) return this.multiple ? [] : null;

        if (this.multiple) {
          const ids = Array.isArray(this.modelValue) ? this.modelValue : [];
          return this.internalOptions.filter((opt) =>
            ids.includes(opt[this.optionValue])
          );
        } else {
          return (
            this.internalOptions.find(
              (opt) => opt[this.optionValue] === this.modelValue
            ) || null
          );
        }
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },

    reduceFunction() {
      return (item) => item[this.optionValue];
    },

    selectableFunction() {
      return this.selectable || (() => true);
    },

    isLazyMode() {
      return typeof this.options === "string" && this.options.length;
    },

    apiModuleName() {
      return this.isLazyMode ? this.options : null;
    },
  },

  mounted() {
    if (this.isLazyMode) {
      this.initializeApi().then(() => {
        this.loadOptions();
        this.fetchSelectedOptions();
        this.setupIntersectionObserver();
      });
    } else if (Array.isArray(this.options)) {
      this.internalOptions = this.options;
    }
  },

  watch: {
    modelValue() {
      this.fetchSelectedOptions();
    },
    options: {
      handler(newOptions) {
        // If options is an array (static data), use it directly
        if (Array.isArray(newOptions)) {
          this.internalOptions = newOptions;
        }
      },
      immediate: true,
    },
    apiParams: {
      handler(newParams, oldParams) {
        if (this.isLazyMode && JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
          // Reload options when apiParams change
          this.loadOptions(true);
        }
      },
      deep: true,
    },
  },

  methods: {
    fetchSelectedOptions() {
      if (!this.modelValue || !this.apiInstance) return;

      const ids = this.multiple
        ? Array.isArray(this.modelValue)
          ? this.modelValue
          : []
        : [this.modelValue];

      // Check for missing IDs that don't exist in internalOptions
      const existingIds = new Set(
        this.internalOptions.map((opt) => opt[this.optionValue])
      );

      const missingIds = ids.filter((id) => !existingIds.has(id));

      if (!missingIds.length) return;

      this.apiInstance
        .getAll({
          filterIn: `id|${missingIds.join(",")}`,
          select: `${this.optionValue}|${this.optionLabel}`,
        })
        .then((res) => {
          // Filter out any items that already exist to prevent duplicates
          const newItems = (res || []).filter(
            (item) => !existingIds.has(item[this.optionValue])
          );

          this.internalOptions.unshift(...newItems);
        });
    },

    initializeApi() {
      return new Promise((resolve, reject) => {
        try {
          let context;
          if (this.BaseModule) {
            context = require.context("@/modules", true, /\.ts$/);
          } else {
            context = require.context("@/API", true, /\.ts$/);
          }
          let filePath;
          if (this.apiPathPattern === "nested") {
            if (this.BaseModule) {
              filePath = `./${this.BaseModule}/API/${this.apiModuleName}/${this.apiModuleName}.ts`;
            } else if (this.FolderName) {
              filePath = `./${this.FolderName}/${this.apiModuleName}/${this.apiModuleName}.ts`;
            } else {
              filePath = `./${this.apiModuleName}/${this.apiModuleName}.ts`;
            }
          } else {
            filePath = `./${this.apiModuleName}/${this.apiModuleName}.ts`;
          }

          const foundPath = context
            .keys()
            .find((key) => key.includes(filePath.replace("./", "")));
          if (!foundPath) {
            reject(new Error(`File not found: ${filePath}`));
            return;
          }
          const apiModule = context(foundPath);
          const ApiClass = apiModule.default;
          this.apiInstance = new ApiClass();
          console.log(`✅ Successfully loaded API from: ${foundPath}`);
          resolve();
        } catch (err) {
          console.error("Failed to load API module:", err);
          reject(err);
        }
      });
    },
    loadOptions(reset = false) {
      if (!this.apiInstance || this.loading) return;

      if (reset) {
        this.currentPage = 1;
        this.internalOptions = [];
      }

      this.loading = true;

      const params = {
        ...this.apiParams,
        page: this.currentPage,
        perPage: this.perPage,
        search: this.searchQuery || undefined,
      };

      return this.apiInstance
        .getAll(params)
        .then((res) => {
          const data = res?.data || [];

          // Get existing IDs to prevent duplicates
          const existingIds = new Set(
            this.internalOptions.map((opt) => opt[this.optionValue])
          );

          // Filter out duplicates before adding
          const uniqueData = data.filter(
            (item) => !existingIds.has(item[this.optionValue])
          );

          this.internalOptions.push(...uniqueData);
          this.hasMorePages = this.internalOptions.length < (res?.recordsFiltered || 0);
        })
        .finally(() => (this.loading = false));
    },

    loadMore() {
      if (this.hasMorePages) {
        this.currentPage++;
        this.loadOptions();
      }
    },

    setupIntersectionObserver() {
      if (this.observer) this.observer.disconnect();

      this.$nextTick(() => {
        if (this.$refs.loadMoreTrigger) {
          this.observer = new IntersectionObserver(
            (e) => e[0].isIntersecting && this.loadMore(),
            {
              root: this.$el.querySelector(".vs__dropdown-menu"),
              threshold: 0.1,
            }
          );
          this.observer.observe(this.$refs.loadMoreTrigger);
        }
      });
    },

    onOpen() {
      this.setupIntersectionObserver();
    },

    onSearch(q) {
      if (!this.isLazyMode) return;

      this.searchQuery = q;
      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(() => {
        this.loadOptions(true);
      }, 500);
    },

    handleUpdate(val) {
      this.$emit("update:modelValue", val);
      // Find the selected option object(s) to pass to onUpdate callback
      if (this.onUpdate) {
        let selectedOption = null;
        if (this.multiple) {
          const ids = Array.isArray(val) ? val : [];
          selectedOption = this.internalOptions.filter((opt) =>
            ids.includes(opt[this.optionValue])
          );
        } else {
          selectedOption = this.internalOptions.find(
            (opt) => opt[this.optionValue] === val
          ) || null;
        }
        this.onUpdate(val, selectedOption);
      }
    },
  },
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";

.load-more-trigger {
  text-align: center;
  padding: 10px;
  color: #6c757d;
}
</style>

<style scoped>
@import "vue-select/dist/vue-select.css";

.load-more-trigger {
  text-align: center;
  padding: 10px;
  color: #6c757d;
  font-size: 14px;
}

.loading-text {
  font-style: italic;
}

/* Badge styling if not using Bootstrap */
.badge {
  display: inline-block;
  border-radius: 0.25rem;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
}

.bg-success {
  background-color: #28a745;
  color: white;
}

.bg-primary {
  background-color: #007bff;
  color: white;
}

.bg-warning {
  background-color: #ffc107;
  color: #212529;
}

.bg-danger {
  background-color: #dc3545;
  color: white;
}

.bg-info {
  background-color: #17a2b8;
  color: white;
}
</style>