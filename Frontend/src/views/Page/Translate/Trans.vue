<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'translate.translate'"
    :subPage="'translate.translate'"
    :titlePage="'translate.translate'"
  >
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
        :filters="FilterData"
      >
        <template #translate.group="{ item }">
          <span v-if="item.group" class="badge badge-purple">
            {{ item.group }}
          </span>
          <!-- <span v-else class="badge bg-danger">No Group</span> -->
        </template>
        <template #addAction="{ item }">
          <!-- <button @click="assignGroup(item)" class="btn btn-primary">
            <i class="fa fa-edit">Assign Group</i>
          </button> -->
          <a
            href="javascript:void(0)"
            class="dropdown-item"
            @click="assignGroup(item)"
            title="Assign Group"
          >
            <i class="fa fa-edit"></i> Assign Group
          </a>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form with custom inputs -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="newItem"
        :contentType="'application/json'"
      >
        <template #group>
          <div class="form-group col-6">
            <label for="group-field">{{ $t("translate.trGroup") }}</label>
            <VueSelect
              id="group-field"
              v-model="newItem.group"
              :options="groupOptions"
              :taggable="true"
              :create-option="(group) => group"
              :push-tags="true"
              @option:selected="handleGroupChange"
              placeholder="Select or type a group name"
              class="vue-select-custom"
            >
              <template #no-options> Type to create a new group... </template>
            </VueSelect>
            <small class="form-text text-muted">
              Please enter or select the translation group. Changing the group
              will update all existing keys.
            </small>
          </div>
        </template>
        <template #add_btn>
          <div class="form-group col-3 mt-8">
            <button
              type="button"
              class="btn ripple btn-outline-primary btn-block"
              @click="AddNewTranslateKey()"
            >
              <i class="icofont icofont-plus"></i>
            </button>
          </div>
        </template>

        <template #disaply_data>
          <div class="col-12 mt-4">
            <div class="translations-card">
              <!-- Body -->
              <div class="translations-body">
                <!-- Search Bar -->
                <div
                  v-if="translationGroups.length > 0"
                  class="search-container"
                >
                  <div class="search-input-wrapper">
                    <i class="icofont icofont-search search-icon"></i>
                    <input
                      v-model="searchKey"
                      type="text"
                      class="search-input"
                      :placeholder="
                        $t('translate.search_by_key') || 'Search by key...'
                      "
                      @input="handleSearch"
                    />
                    <button
                      v-if="searchKey"
                      @click="clearSearch"
                      class="clear-search-btn"
                      title="Clear search"
                    >
                      <i class="icofont icofont-close"></i>
                    </button>
                  </div>
                  <div v-if="searchKey" class="search-results-info">
                    {{ filteredTranslationsCount }}
                    {{ $t("translate.results_found") || "results found" }}
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="translationGroups.length === 0" class="empty-state">
                  <i class="icofont icofont-info-circle"></i>
                  <p>{{ $t("translate.no_translations_yet") }}</p>
                </div>

                <!-- No Results State -->
                <div
                  v-else-if="
                    searchKey && filteredTranslationGroups.length === 0
                  "
                  class="empty-state"
                >
                  <i class="icofont icofont-search-alt-2"></i>
                  <p>
                    {{
                      $t("translate.no_results_found") || "No results found for"
                    }}
                    "{{ searchKey }}"
                  </p>
                </div>

                <!-- Groups Display -->
                <div v-else class="groups-container">
                  <div
                    v-for="(group, groupIndex) in filteredTranslationGroups"
                    :key="groupIndex"
                    class="translation-group"
                  >
                    <!-- Group Badge -->
                    <div class="group-badge-container">
                      <span class="group-badge">{{
                        newItem.group || group.name
                      }}</span>
                      <span class="group-count">
                        {{ group.translations.length }}
                        {{ $t("translate.translations") }}
                      </span>
                    </div>

                    <!-- Translations Table -->
                    <div class="table-container">
                      <table class="translations-table">
                        <thead>
                          <tr>
                            <th class="col-key">{{ $t("translate.key") }}</th>
                            <th
                              v-for="lang in language"
                              :key="lang"
                              class="col-lang"
                            >
                              {{ lang.toUpperCase() }}
                            </th>
                            <th class="col-actions">
                              {{ $t("translate.actions") }}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(
                              translation, transIndex
                            ) in group.translations"
                            :key="transIndex"
                            class="translation-row"
                          >
                            <!-- Edit Mode -->
                            <template
                              v-if="
                                editingGroup === group.originalIndex &&
                                editingIndex === translation.originalIndex
                              "
                            >
                              <td>
                                <input
                                  v-model="editingItem.key"
                                  class="edit-input"
                                  type="text"
                                  placeholder="Enter key"
                                />
                              </td>
                              <td v-for="lang in language" :key="lang">
                                <input
                                  v-model="editingItem[lang]"
                                  class="edit-input"
                                  type="text"
                                  :placeholder="`Enter ${lang} translation`"
                                />
                              </td>
                              <td>
                                <div class="action-buttons">
                                  <button
                                    @click="
                                      saveEdit(
                                        group.originalIndex,
                                        translation.originalIndex
                                      )
                                    "
                                    class="action-btn save-btn"
                                    title="Save"
                                  >
                                    <i class="icofont icofont-check"></i>
                                  </button>
                                  <button
                                    @click="cancelEdit"
                                    class="action-btn cancel-btn"
                                    title="Cancel"
                                  >
                                    <i class="icofont icofont-close"></i>
                                  </button>
                                </div>
                              </td>
                            </template>

                            <!-- View Mode -->
                            <template v-else>
                              <td>
                                <span
                                  class="translation-key"
                                  v-html="highlightMatch(translation.key)"
                                ></span>
                              </td>
                              <td v-for="lang in language" :key="lang">
                                <span class="translation-value">
                                  {{ translation[lang] || "N/A" }}
                                </span>
                              </td>
                              <td>
                                <div class="action-buttons">
                                  <button
                                    @click="
                                      startEdit(
                                        group.originalIndex,
                                        translation.originalIndex
                                      )
                                    "
                                    class="action-btn edit-btn"
                                    title="Edit"
                                  >
                                    <i class="icofont icofont-edit"></i>
                                  </button>
                                  <button
                                    @click.prevent="
                                      deleteTranslation(
                                        group.originalIndex,
                                        translation.originalIndex
                                      )
                                    "
                                    class="action-btn delete-btn"
                                    title="Delete"
                                  >
                                    <i class="icofont icofont-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </template>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Overall Summary -->
                <div
                  v-if="translationGroups.length > 0"
                  class="overall-summary"
                >
                  <span class="summary-text">
                    <strong>{{ $t("translate.total_groups") }}:</strong>
                    {{ translationGroups.length }}
                    <span v-if="searchKey" class="filtered-info">
                      ({{ $t("translate.showing") || "Showing" }}
                      {{ filteredTranslationsCount }})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
  <GroupSelectModal
    v-model:is-open="showModal"
    :groups="groupsList"
    :current-group-name="selectedTranslateItem?.group || null"
    @save="handleSave"
    @close="handleClose"
  />
</template>

<script>
// Importing necessary components and API modules
import Translate from "@/API/Translate/Translate";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Language from "@/API/Language/Language";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import Swal from "sweetalert2";
import GroupSelectModal from "./AssignGroup.vue";
import Menu from "@/core/data/menu.json";
export default {
  components: {
    MainPage,
    Form,
    DataTable,
    VueSelect,
    GroupSelectModal,
  },

  setup() {
    const api = new Translate();
    const languageApi = new Language();
    const apiParams = {};

    return {
      api,
      apiParams,
      languageApi,
    };
  },
  watch: {
    translationGroups: {
      handler() {
        this.handleSearch();
      },
      deep: true,
    },
  },

  computed: {
    groupOptions() {
      // Convert array of objects to unique array of strings
      return [...new Set(this.groupsList.map((g) => g.group))];
    },
    filteredTranslationsCount() {
      let count = 0;
      this.filteredTranslationGroups.forEach((group) => {
        count += group.translations.length;
      });
      return count;
    },
  },
  data() {
    return {
      menuGroups: [],
      showModal: false,
      selectedGroupId: null,
      selectedTranslateItem: null, // Add this to store the item being assigned
      groupsList: [],
      searchKey: "",
      filteredTranslationGroups: [],
      FilterData: [
        {
          title: "Group",
          key: "group",
          type: "string",
          data: "Translate",
          id: "group",
          display: "group",
          filterType: "filter",
        },
      ],
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      language: [],
      tableColumns: [],
      fromFields: [],
      translationGroups: [], // Array to store groups with their translations
      editingGroup: null, // Track which group is being edited
      editingIndex: null, // Track which item is being edited
      editingItem: {}, // Store the item being edited
      groups: [],
    };
  },

  created() {
    this.tableColumns = [
      {
        id: "translate.Name",
        title: this.$t("translate.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "translate.group",
        title: this.$t("translate.trGroup"),
        data: "group",
        defaultContent: "N/A",
      },
    ];

    this.languageApi
      .getAll()
      .then((languages) => {
        this.language = languages.map((a) => a.code);

        console.log("*/*/*/*/*Language*/*/", this.language);

        const keyFields = this.language.map((code) => {
          return {
            id: code,
            title: code,
            data: code,
            defaultContent: "N/A",
          };
        });

        const dynamicFields = this.language.map((code) => {
          return {
            name: `${code}_translation`,
            label: code,
            type: "text",
            rules: "",
            description: `Please enter the ${code} translation.`,
            col: 3,
          };
        });

        this.fromFields = [
          {
            name: "name",
            label: this.$t("translate.name"),
            type: "text",
            rules: "",
            description: "Please enter the translation name.",
            col: 6,
          },
          {
            name: "group",
          },
          {
            name: "key",
            label: this.$t("translate.key"),
            type: "text",
            rules: "",
            description: "Please enter the translation key.",
            col: 3,
          },
          ...dynamicFields,
          {
            name: "add_btn",
          },
          {
            name: "disaply_data",
          },
        ];
      })
      .catch((error) => {
        console.error("Error loading languages:", error);
      });
  },
  // async mounted() {
  //   // Fetch groups for the form select
  //   this.groups = await this.api.getAll({ select: "group" });
  //   const seen = new Set();
  //   this.groupsList = this.groups.filter(
  //     (g) => g.group && !seen.has(g.group) && seen.add(g.group)
  //   );
  // },

  async mounted() {
    // Fetch groups from API
    this.groups = await this.api.getAll({
      select: "group",
      filter: `group|null-null|!=`,
    });
    const seen = new Set();
    const apiGroups = this.groups.filter(
      (g) => g.group && !seen.has(g.group) && seen.add(g.group)
    );

    // Extract second-level groups from menu JSON
    const menuGroups = this.extractSecondLevelFromMenu();
    this.menuGroups = menuGroups;
    // Merge both sources
    const allGroups = [...apiGroups, ...menuGroups];
    const uniqueGroups = new Map();

    allGroups.forEach((group) => {
      const key = group.group || group.name;
      if (key && !uniqueGroups.has(key)) {
        uniqueGroups.set(key, group);
      }
    });

    this.groupsList = Array.from(uniqueGroups.values());
  },

  methods: {
    extractSecondLevelFromMenu() {
      const menuGroups = [];
      let idCounter = 1;

      // Iterate through menu data (first level)
      Menu.data.forEach((section) => {
        // Get only the direct children (second level)
        if (section.children && Array.isArray(section.children)) {
          section.children.forEach((child) => {
            if (child.title) {
              menuGroups.push({
                id: idCounter++,
                name: child.title,
                group: child.title, // Keep for compatibility
                icon: child.icon1 || child.icon2,
                path: child.path,
                type: child.type,
              });
            }
          });
        }
      });

      return menuGroups;
    },
    assignGroup(item) {
      console.log("Assigning group to item:", item);
      this.selectedTranslateItem = item;
      this.selectedGroupId =
        this.groups.find((g) => g.group === item.group)?.id || null;
      this.showModal = true;
    },
    // Update handleSave to actually update the translation
    async handleSave(data) {
      console.log("Selected group data:", data);

      if (!this.selectedTranslateItem) {
        this.api.poup({ message: "No item selected" }, "Error");
        return;
      }

      try {
        // Update the translation with the new group
        const updateData = {
          ...this.selectedTranslateItem,
          group: data.name,
        };

        // Call your API to update the translation
        await this.api.update(updateData);

        // Refresh the table
        this.$refs.table.refreshTable();

        // Show success message
        this.api.poup({ status: "success" }, "Group assigned successfully!");

        // Clear selection
        this.selectedTranslateItem = null;
        this.selectedGroupId = null;
      } catch (error) {
        console.error("Error assigning group:", error);
        this.api.poup({ message: "Failed to assign group" }, "Error");
      }
    },
    handleClose() {
      console.log("Modal closed");
      this.selectedTranslateItem = null;
      this.selectedGroupId = null;
    },

    handleSearch() {
      if (!this.searchKey.trim()) {
        this.filteredTranslationGroups = this.translationGroups.map(
          (group, index) => ({
            ...group,
            originalIndex: index,
            translations: group.translations.map((trans, tIndex) => ({
              ...trans,
              originalIndex: tIndex,
            })),
          })
        );
        return;
      }

      const searchTerm = this.searchKey.toLowerCase();
      this.filteredTranslationGroups = [];

      this.translationGroups.forEach((group, groupIndex) => {
        const filteredTranslations = group.translations
          .map((translation, transIndex) => ({
            ...translation,
            originalIndex: transIndex,
          }))
          .filter((translation) =>
            translation.key.toLowerCase().includes(searchTerm)
          );

        if (filteredTranslations.length > 0) {
          this.filteredTranslationGroups.push({
            ...group,
            originalIndex: groupIndex,
            translations: filteredTranslations,
          });
        }
      });
    },

    clearSearch() {
      this.searchKey = "";
      this.handleSearch();
    },

    highlightMatch(text) {
      if (!this.searchKey.trim()) {
        return text;
      }

      const searchTerm = this.searchKey;
      const regex = new RegExp(`(${searchTerm})`, "gi");
      return text.replace(regex, '<span class="highlight">$1</span>');
    },
    // Handle group change - update all existing translations to new group
    handleGroupChange(newGroup) {
      console.log("Group changed to:", newGroup);

      if (this.translationGroups.length > 0) {
        // Update all groups to the new group name
        this.translationGroups.forEach((group) => {
          group.name = newGroup;
        });

        console.log("Updated all translation groups to:", newGroup);
      }
    },

    // Check if key already exists in the current group
    isDuplicateKey(key, currentGroupIndex = null, currentTransIndex = null) {
      for (let i = 0; i < this.translationGroups.length; i++) {
        const group = this.translationGroups[i];

        for (let j = 0; j < group.translations.length; j++) {
          // Skip the current item being edited
          if (currentGroupIndex === i && currentTransIndex === j) {
            continue;
          }

          if (group.translations[j].key === key) {
            return true;
          }
        }
      }
      return false;
    },

    AddNewTranslateKey() {
      console.log("AddNewTranslateKey called", this.newItem);

      // Validate required fields
      if (!this.newItem.name || !this.newItem.key || !this.newItem.group) {
        this.api.poup(
          { message: "Please fill in all fields name , key and group" },
          "Error"
        );
        return;
      }

      // Check for duplicate key
      if (this.isDuplicateKey(this.newItem.key)) {
        this.api.poup(
          { message: "This key already exists. Please use a unique key." },
          "Error"
        );
        return;
      }

      // Check if any language field is empty
      const emptyLanguages = this.language.filter(
        (lang) => !this.newItem[`${lang}_translation`]
      );
      if (emptyLanguages.length > 0) {
        this.api.poup(
          {
            message: `Please fill in translations for: ${emptyLanguages.join(
              ", "
            )}`,
          },
          "Error"
        );
        return;
      }

      // Find or create the group
      let groupIndex = this.translationGroups.findIndex(
        (g) => g.name === this.newItem.group
      );

      if (groupIndex === -1) {
        this.translationGroups.push({
          name: this.newItem.group,
          translations: [],
        });
        groupIndex = this.translationGroups.length - 1;
      }

      // Create translation object
      const newTranslation = {
        key: this.newItem.key,
      };

      // Add language fields
      this.language.forEach((lang) => {
        newTranslation[lang] = this.newItem[`${lang}_translation`] || "";
      });

      // Add to group's translations at the TOP using unshift instead of push
      this.translationGroups[groupIndex].translations.unshift(newTranslation);

      console.log("Translation groups after add:", this.translationGroups);

      // Rebuild language arrays completely from translationGroups
      this.rebuildLanguageArrays();

      // Clear input fields only
      this.clearInputFields();
      this.api.poup(
        { status: "success" },
        "Translation added to table! You can add more or save all."
      );
    },
    clearInputFields() {
      // Only clear INPUT fields, keep everything else
      this.newItem.key = "";

      this.language.forEach((lang) => {
        this.newItem[`${lang}_translation`] = "";
      });

      // console.log("Cleared input fields");
    },

    rebuildLanguageArrays() {
      // This method rebuilds ALL language arrays from translationGroups
      // It's the single source of truth for the formatted data

      if (this.translationGroups.length === 0) {
        // No groups, clear all language arrays
        this.language.forEach((lang) => {
          this.newItem[lang] = [];
        });
        return;
      }

      // Get all translations from all groups
      const allTranslations = [];
      this.translationGroups.forEach((group) => {
        allTranslations.push(...group.translations);
      });

      // Rebuild language arrays from scratch
      this.language.forEach((lang) => {
        this.newItem[lang] = [];

        allTranslations.forEach((translation) => {
          const obj = {};
          obj[translation.key] = translation[lang];
          this.newItem[lang].push(obj);
        });
      });

      // console.log("Rebuilt language arrays:", {
      //   en: this.newItem.en,
      //   ar: this.newItem.ar,
      // });
    },

    // startEdit(groupIndex, transIndex) {
    //   this.editingGroup = groupIndex;
    //   this.editingIndex = transIndex;

    //   // Get the original item
    //   const originalItem =
    //     this.translationGroups[groupIndex].translations[transIndex];

    //   // Create editingItem with key first
    //   this.editingItem = {
    //     key: originalItem.key,
    //   };

    //   // Add all languages with their current values
    //   this.language.forEach((lang) => {
    //     // Use existing value or empty string for new languages
    //     this.editingItem[lang] = originalItem.hasOwnProperty(lang)
    //       ? originalItem[lang]
    //       : "";
    //   });

    //   console.log("Starting edit with item:", this.editingItem);
    //   console.log("Original item was:", originalItem);
    // },
    startEdit(groupIndex, transIndex) {
      this.editingGroup = groupIndex;
      this.editingIndex = transIndex;

      const originalItem =
        this.translationGroups[groupIndex].translations[transIndex];

      this.editingItem = {
        key: originalItem.key,
      };

      this.language.forEach((lang) => {
        this.editingItem[lang] = originalItem.hasOwnProperty(lang)
          ? originalItem[lang]
          : "";
      });
    },

    saveEdit(groupIndex, transIndex) {
      if (!this.editingItem.key) {
        this.api.poup({ message: "Please fill in the key field" }, "Error");
        return;
      }

      // Check for duplicate key (excluding the current item being edited)
      if (this.isDuplicateKey(this.editingItem.key, groupIndex, transIndex)) {
        this.api.poup(
          { message: "This key already exists. Please use a unique key." },
          "Error"
        );
        return;
      }

      // Get the original item to preserve any data not in editingItem
      const originalItem =
        this.translationGroups[groupIndex].translations[transIndex];

      // Merge original with edited - this preserves existing language values
      const updatedItem = { ...originalItem, ...this.editingItem };

      // Ensure all current languages exist (add only if missing)
      this.language.forEach((lang) => {
        if (!updatedItem.hasOwnProperty(lang)) {
          updatedItem[lang] = "";
        }
      });

      // Update in translationGroups
      this.translationGroups[groupIndex].translations[transIndex] = updatedItem;

      this.editingGroup = null;
      this.editingIndex = null;
      this.editingItem = {};

      console.log("Updated translation groups:", this.translationGroups);

      // Rebuild language arrays from translationGroups
      this.rebuildLanguageArrays();

      this.api.poup({ status: "success" }, "Translation updated successfully!");
    },

    cancelEdit() {
      this.editingGroup = null;
      this.editingIndex = null;
      this.editingItem = {};
    },

    async deleteTranslation(groupIndex, transIndex) {
      const result = await Swal.fire({
        title: "Are you sure you want to delete this translation Key?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, set it!",
        cancelButtonText: "No, cancel!",
      });

      if (result.isConfirmed) {
        // Delete from translationGroups
        this.translationGroups[groupIndex].translations.splice(transIndex, 1);

        // Remove group if empty
        if (this.translationGroups[groupIndex].translations.length === 0) {
          this.translationGroups.splice(groupIndex, 1);
        }

        console.log("Remaining translation groups:", this.translationGroups);

        // Rebuild language arrays from translationGroups
        this.rebuildLanguageArrays();

        this.api.poup(
          { status: "success" },
          "Translation deleted successfully!"
        );
      }
    },

    parseExistingData(data) {
      // Clear existing translation groups
      this.translationGroups = [];

      console.log("Parsing existing data:", data);
      console.log("Available languages:", this.language);

      const translationsMap = {};

      // Try to find which language has data
      let languageWithData = null;
      for (let lang of this.language) {
        if (data[lang] && Array.isArray(data[lang]) && data[lang].length > 0) {
          languageWithData = lang;
          console.log(`Found data in language: ${lang}`, data[lang]);
          break;
        }
      }

      // If no language has data, try using the first language
      if (!languageWithData) {
        languageWithData = this.language[0];
        console.log(
          "No language data found, using first language:",
          languageWithData
        );
      }

      if (data[languageWithData] && Array.isArray(data[languageWithData])) {
        data[languageWithData].forEach((translationObj) => {
          const key = Object.keys(translationObj).find((k) => k !== "group");

          if (key) {
            console.log(`Processing key: ${key}`);
            translationsMap[key] = { key: key };

            // For each language, try to find the translation
            this.language.forEach((lang) => {
              if (data[lang] && Array.isArray(data[lang])) {
                const langTranslation = data[lang].find((item) =>
                  item.hasOwnProperty(key)
                );
                translationsMap[key][lang] = langTranslation
                  ? langTranslation[key]
                  : "";
                // console.log(`  ${lang}: ${translationsMap[key][lang]}`);
              } else {
                // New language doesn't exist in data, set empty string
                translationsMap[key][lang] = "";
                // console.log(`  ${lang}: (new language - empty)`);
              }
            });
          }
        });
      } else {
        console.warn("No valid language data array found!");
      }

      const translations = Object.values(translationsMap);
      console.log("Parsed translations:", translations);

      if (translations.length > 0) {
        this.translationGroups.push({
          name: data.name || data.group || "default",
          translations: translations,
        });
      }

      console.log("Final translation groups:", this.translationGroups);

      // Rebuild language arrays after parsing
      this.rebuildLanguageArrays();
    },
    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
      this.translationGroups = [];
      this.editingGroup = null;
      this.editingIndex = null;
      this.editingItem = {};
    },

    editItem(data) {
      console.log("Edit item called with data:", data);

      this.newItem = data;
      this.isFlipped = true;

      // Parse the existing data structure and populate translationGroups
      this.parseExistingData(data);
    },
  },
};
</script>

<style scoped>
.badge-purple {
  background: #d0b5e3;
  color: #6e3894;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}
/* Search Container */
.search-container {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  color: #6c757d;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #495057;
  background: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #e9ecef;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #6c757d;
  color: #ffffff;
}

.search-results-info {
  margin-top: 0.5rem;
  font-size: 0.813rem;
  color: #6c757d;
  font-weight: 500;
}

.filtered-info {
  color: #6e3894;
  font-weight: 600;
}

/* Highlight match in search results */
.highlight {
  background-color: rgba(110, 56, 148, 0.2);
  font-weight: 600;
  color: #6e3894;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

/* Main Container */
.translations-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Body */
.translations-body {
  padding: 1.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  color: #6c757d;
}

/* Groups Container */
.groups-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.translation-group {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

/* Group Badge */
.group-badge-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.group-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: #6e3894;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-count {
  font-size: 0.813rem;
  color: #6c757d;
  font-weight: 500;
}

/* Table Container */
.table-container {
  overflow-x: auto;
}

.translations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.938rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.translations-table thead {
  background: #f8f9fa;
}

.translations-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  text-transform: uppercase;
  font-size: 0.813rem;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.col-key {
  width: 180px;
}

.col-lang {
  min-width: 200px;
}

.col-actions {
  width: 120px;
  text-align: center;
}

.translations-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.15s ease;
}

.translations-table tbody tr:hover {
  background: #f8f9fa;
}

.translations-table tbody tr:last-child {
  border-bottom: none;
}

.translations-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* Translation Content */
.translation-key {
  font-weight: 600;
  color: #495057;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 0.938rem;
}

.translation-value {
  color: #495057;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 0.938rem;
}

/* Edit Inputs */
.edit-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #495057;
  background: #ffffff;
  transition: all 0.2s ease;
}

.edit-input:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.edit-input::placeholder {
  color: #adb5bd;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.edit-btn {
  background: #e9ecef;
  color: #495057;
}

.edit-btn:hover {
  background: #6e3894;
  color: #ffffff;
  transform: translateY(-1px);
}

.delete-btn {
  background: #e9ecef;
  color: #6c757d;
}

.delete-btn:hover {
  background: #a92525;
  color: #ffffff;
  transform: translateY(-1px);
}

.save-btn {
  background: #e9ecef;
  color: #495057;
}

.save-btn:hover {
  background: #6e3894;
  color: #ffffff;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #e9ecef;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #6c757d;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Overall Summary */
.overall-summary {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

.summary-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.summary-text strong {
  color: #495057;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .search-input-wrapper {
    max-width: 100%;
  }

  .group-badge-container {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .col-key,
  .col-lang,
  .col-actions {
    min-width: auto;
  }
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
