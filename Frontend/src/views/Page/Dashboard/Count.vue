<template>

     <v-card class="mx-auto widget" hover :style="{ backgroundColor: color.background }" elevation="0"
          @click="getDataTable">
          <v-card-text class="pa-6">
               <div class="d-flex justify-space-between align-start">
                    <!-- Left side - Avatar and User text -->
                    <div class="d-flex flex-column">
                         <v-avatar size="70" class="mb-4" :style="{ backgroundColor: color.avatar }">
                              <v-icon color="white" size="40" :icon="localData.icon" />
                         </v-avatar>

                         <span class="text-h5 font-weight-light " :style="'color:' + color.text">
                              {{ localData.title }}
                         </span>
                    </div>

                    <!-- Right side - Number and menu -->
                    <div class="d-flex flex-column dir-ltr">
                         <v-btn icon variant="text" size="small" class="mb-2" v-if="showMenu">
                              <v-menu>
                                   <template #activator="{ props }">
                                        <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                                   </template>

                                   <v-list>
                                        <v-list-item prepend-icon="mdi-refresh" @click="reload()">
                                             <v-list-item-title>Reload</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item prepend-icon="mdi-cog" @click="openSetting(localData, chartId)">
                                             <v-list-item-title>Settings</v-list-item-title>
                                        </v-list-item>
                                        <v-divider></v-divider>

                                        <v-list-item prepend-icon="mdi-delete" @click="remove" class="text-error">
                                             <v-list-item-title>Delete</v-list-item-title>
                                        </v-list-item>

                                   </v-list>
                              </v-menu>
                         </v-btn>

                         <span class="text-h2 font-weight-bold  mt-auto" :style="'color:' + color.text">
                              {{ localData.count }}
                         </span>
                    </div>
               </div>
          </v-card-text>
          <VDialog v-model="dialog" max-width="1400" scrollable>
               <VCard style="background-color: #F8F8F8;">
                    <VCardTitle class="d-flex align-center justify-space-between">
                         <span class="text-h5"> {{ localData.title }}</span>
                         <VBtn icon="mdi-close" variant="text" @click="dialog = false" />
                    </VCardTitle>
                    <VCardText>
                         <DataTableSimple v-if="dialog" table-class='modern-data-table' :columns="tableColumns"
                              :api="api" :api-params="apiParams" />
                    </VCardText>
               </VCard>


          </VDialog>
     </v-card>

</template>

<script>
import DataTableSimple from '../../../components/DataTableSimple.vue';

export default {
     components: {
          DataTableSimple
     },
     props: {
          showMenu: {
               type: Boolean,
               default: true
          },
          color: {
               type: Object,
               default: { name: "Royal Purple", background: "#e4d7ed", avatar: "#68477f", text: "#43235c" },
          },
          data: {
               type: Object,
               required: true,
          },
          openSetting: Function,
          remove: {
               type: Function,
               default: () => () => { }   // safe default
          }
     },
     data() {
          return {
               localData: { ...this.data },
               loading: false,
               fromFields: [],
               api: null,
               dialog: false,
               apiParams: {},
               tableColumns: []

          };
     },

     async created() {

          if (!this.data.selectmodel?.y?.model) {
               console.log("No model selected, returning");
               return;
          } else {
               await this.getData();
          }

     },
     methods: {
          async getDataTable() {
               if (!this.data.selectmodel?.y?.model) return;
               await this.loadFromFields(this.data.selectmodel.y.model);

               this.api = await this.loadFile(this.data.selectmodel.y.model);
               this.apiParams = {
                    filterGroups: this.data.filterGroups,

               };
               this.dialog = true;


          },
          async loadFromFields(fileName) {
               try {
                    this.entityName = fileName;
                    const { default: Module } = await import(`@/views/Page/${fileName}/${fileName}.vue`);

                    const mockContext = {
                         $t: (key) => key,
                         tableColumns: [],
                         fromFields: [],
                         required: { password: 'required' },
                         apiParams: {}
                    };

                    if (Module.created) {
                         Module.created.call(mockContext);
                    }
                    const tableColumns = mockContext.tableColumns;
                    this.tableColumns = await tableColumns.filter(col =>
                         !(col.data && typeof col.data === 'string' && col.data.includes('.'))
                    );

                    console.log("tableColumns", tableColumns, this.tableColumns);

                    // this.apiParams=Module

               } catch (error) {
                    console.error("Error loading form fields:", error);
               }
          },
          async reLoad() {
               await this.getData()
          },
          async getData() {
               console.log("getData called");
               this.loading = true;

               if (!this.data.selectmodel?.y?.model) {
                    console.log("No model selected, returning");
                    return;
               }

               const model = await this.loadFile(this.data.selectmodel.y.model);
               const query = {
                    filterGroups: this.data.filterGroups,
                    count: 1,
               };
               model.getAll(query).then(res => {
                    this.localData.count = res;
                    this.loading = false;
               });

          },

          async loadFile(fileName) {
               try {
                    const { default: Module } = await import(`@/API/${fileName}/${fileName}.ts`);
                    return new Module();
               } catch (err) {
                    console.error(`Failed to load module ${fileName}:`, err);
                    throw err;
               }
          },
     },

     watch: {
          "data.selectmodel": {
               deep: true,
               handler(newVal, oldVal) {
                    console.log("data.selectmodel changed:", newVal, oldVal);
                    this.getData();
               },
          },
          "data": {
               deep: true,
               handler(newVal, oldVal) {
                    this.localData.title = newVal.title
                    this.localData.icon = newVal.icon
                    this.localData.count = newVal.count
               },
          },
          "data.filterGroups": {
               deep: true,
               handler(newVal, oldVal) {
                    console.log("data.filterGroups changed:", newVal, oldVal);
                    this.getData();
               },
          },
     },

     mounted() {
          this.getData();
     },
};
</script>

<style scoped>
.widget {
     transition: box-shadow 0.2s ease;
     overflow: hidden;
}

.widget:hover {
     box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.purple--text.text--darken-2 {
     color: #6a1b9a !important;
}
[dir="rtl"] .dir-ltr{
     direction: ltr;
}
[dir="rtl"] .v-toolbar__content {
    text-align: end;
}
</style>