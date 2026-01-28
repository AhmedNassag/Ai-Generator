<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'language.language'" :subPage="'language.language'" :titlePage="'language.language'">
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th v-for="col in tableColumns" :key="col.data">{{ col.title }}</th>
            </tr>
          </thead>
          <tbody v-if="items && items.length">
            <tr v-for="(item, index) in items" :key="item.id">
              <td>
                <div class="d-flex align-items-center">
                  <div class="order-buttons me-2">
                    <button 
                      class="btn btn-sm btn-outline-secondary me-1" 
                      @click="moveItem(item, 'up')"
                      :disabled="index === 0"
                    >
                      <i class="fas fa-arrow-up"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-secondary" 
                      @click="moveItem(item, 'down')"
                      :disabled="index === items.length - 1"
                    >
                      <i class="fas fa-arrow-down"></i>
                    </button>
                  </div>
                  {{ item.code }}
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.rtl === 'true' ? 'Yes' : 'No' }}</td>
              <td>
                <i :class="`flag-icon flag-icon-${item.flag}`"></i>
              </td>
              <td>
                <div class="d-flex">
                  <button class="btn btn-sm btn-primary me-2" @click="editItem(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="deleteItem(item)"
                    :disabled="item.order === 1"
                    v-if="item.order !== 1"
                    :title="item.order === 1 ? 'Cannot delete default language' : 'Delete language'"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td :colspan="tableColumns.length" class="text-center">No data available</td>
            </tr>
          </tbody>
        </table>
        
        <button class="btn btn-primary mt-3" @click="openForm">
          <i class="fas fa-plus me-2"></i>
          Add Language
        </button>

        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </div>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      ></Form>
    </template>
  </main-page>
</template>

<script>
import language from "@/API/Language/Language";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  name: 'Language',
  
  components: {
    MainPage,
    Form,
    DataTable
  },

  data() {
    return {
      api: new language(),
      items: [],
      error: null,
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      tableColumns: [
        { title: "Code", data: "code", defaultContent: "N/A" },
        { title: "Name", data: "name", defaultContent: "N/A" },
        { title: "RTL", data: "rtl", defaultContent: "No" },
        { title: "Flag", data: "flag", defaultContent: "N/A" },
        { title: "Actions", data: "actions" }
      ],
      fromFields: [
        {
          name: "code",
          label: "Code",
          type: "text",
          rules: "required",
          description: "Enter language code (e.g., en, fr, ar)",
          col: 6
        },
        {
          name: "name",
          label: "Name",
          type: "text",
          rules: "required",
          description: "Enter language name",
          col: 6
        },
        {
          name: "rtl",
          label: "RTL",
          type: "checkbox",
          description: "Check if language is RTL (Right to Left)",
          col: 6
        },
        {
          name: "flag",
          label: "Flag",
          type: "text",
          rules: "required",
          description: "language flag code",
          col: 12
        }
      ]
    };
  },

  methods: {
    getNextOrder() {
      if (!this.items.length) return 1;
      const maxOrder = Math.max(...this.items.map(item => Number(item.order) || 0));
      return maxOrder + 1;
    },

    getTempOrder() {
      return this.getNextOrder() + 1; // Use an order number higher than any existing one
    },

    async loadItems() {
      try {
        const response = await this.api.getAll();
        if (Array.isArray(response)) {
          this.items = response.sort((a, b) => Number(a.order) - Number(b.order));
          this.error = null;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error loading items:', err);
        this.error = 'Failed to load languages';
        this.items = [];
      }
    },

    async moveItem(item, direction) {
      try {
        const currentIndex = this.items.findIndex(i => i.id === item.id);
        if (direction === 'up' && currentIndex > 0) {
          const prevItem = this.items[currentIndex - 1];
          const tempOrder = this.getTempOrder();
          
          // Three-step swap using temp order
          await this.api.update({ ...item, order: tempOrder }); // Move current to temp
          await this.api.update({ ...prevItem, order: item.order }); // Move previous to current's position
          await this.api.update({ ...item, order: prevItem.order }); // Move current from temp to previous position
          
        } else if (direction === 'down' && currentIndex < this.items.length - 1) {
          const nextItem = this.items[currentIndex + 1];
          const tempOrder = this.getTempOrder();
          
          // Three-step swap using temp order
          await this.api.update({ ...item, order: tempOrder }); // Move current to temp
          await this.api.update({ ...nextItem, order: item.order }); // Move next to current's position
          await this.api.update({ ...item, order: nextItem.order }); // Move current from temp to next position
        }
        
        await this.loadItems();
      } catch (err) {
        console.error('Error moving item:', err);
        this.error = 'Failed to update order';
      }
    },

    async deleteItem(item) {
      try {
        if (item.order === 1) {
          this.error = 'Cannot delete the default language';
          return;
        }


        await this.api.delete(item.id);
        await this.loadItems();
        this.error = null;
      } catch (err) {
        console.error('Error deleting item:', err);
        this.error = 'Failed to delete language';
      }
    },

    openForm() {
      this.newItem = { order: this.getNextOrder() };
      this.isFlipped = true;
    },

    async closeForm() {
      this.isFlipped = false;
      await this.loadItems();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = { ...data };
      this.isFlipped = true;
    }
  },

  mounted() {
    this.loadItems();
  }
};
</script>

<style scoped>
/* Scoped styles for the component */
.language-flag {
  width: 30px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 2px;
  object-fit: cover;
}

.order-buttons {
  display: inline-flex;
  gap: 4px;
}

.order-buttons button {
  padding: 2px 6px;
}

.order-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
