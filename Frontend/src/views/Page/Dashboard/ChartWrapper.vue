<template>
     <v-card class="mx-auto h-100 widget" hover>
          <v-toolbar color="transparent">
               <v-toolbar-title class="text-h6">
                    {{ localData.title }}
               </v-toolbar-title>

               <template #append>
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
               </template>
          </v-toolbar>

          <v-card-text style="padding-top: 0px;">
               <canvas ref="canvas" :width="width" :height="height"></canvas>
          </v-card-text>
     </v-card>
     <VDialog v-model="dialog" max-width="1400" scrollable>
          <VCard style="background-color: #F8F8F8;">
               <VCardTitle class="d-flex align-center justify-space-between">
                    <span class="text-h5"> {{ localData.title }}</span>
                    <VBtn icon="mdi-close" variant="text" @click="dialog = false" />
               </VCardTitle>
               <VCardText>
                    <DataTableSimple v-if="dialog" :table-class="'modern-data-table'" :columns="fromFields" :api="api"
                         :api-params="apiParams" />
               </VCardText>
          </VCard>


     </VDialog>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import DataTableSimple from '../../../components/DataTableSimple.vue';

export default {
     name: 'ChartWrapper',
     components: {
          DataTableSimple
     },
     props: {
          chartId: [String, Number],
          type: { type: String, default: 'bar' },
          data: { type: Object, required: true },
          options: { type: Object, default: () => ({}) },
          width: { type: [String, Number], default: 400 },
          height: { type: [String, Number], default: 200 },
          openSetting: Function,
          remove: {
               type: Function,
               default: () => () => { }   // safe default
          }
     },

     data() {
          return {
               chartInstance: null,
               dataChart: {
                    labels: [],
                    datasets: [
                         {
                              data: [],
                              backgroundColor: [
                                   'rgba(110, 56, 148, 1)',
                                   'rgba(169, 37, 37, 1)',
                                   'rgba(196, 149, 27, 1)',
                                   'rgba(37, 95, 11, 1)',
                                   'rgba(153, 153, 153, 1)',
                              ],
                         },
                    ],

               },
               localData: { ...this.data },
               loading: false,
               fromFields: [],
               api: null,
               dialog: false,
               apiParams: {}
          };
     },

     async created() {
          // Only prepare data, don't render yet
          if (this.data.selectmodel?.y?.model) {
               await this.getData();
          } else {
               console.log('No model selected yet.');
          }
     },
     methods: {

          async handleChartClick(evt, elements) {
               try {
                    if (!elements || !elements.length) return;
                    await this.loadFromFields(this.data.selectmodel.y.model);

                    const el = elements[0];
                    const datasetIndex = el.datasetIndex;
                    const dataIndex = el.index;

                    // If chartInstance exists, prefer reading from it for labels/data
                    const labels = this.chartInstance?.data?.ids || this.data.ids || [];
                    const datasets = this.chartInstance?.data?.datasets || this.dataChart.datasets || [];

                    const label = labels[dataIndex];
                    const value = datasets[datasetIndex]?.data?.[dataIndex];
                    this.apiParams = { filter: this.data.selectmodel.y.field + "|" + label,filterGroups: this.data.filterGroups  }
                    const payload = {
                         label,
                         value,
                         datasetIndex,
                         dataIndex,
                         chartId: this.chartId,
                    };
                    this.dialog = true;

                    // Emit for parent components to consume
                    this.$emit('chart-click', payload);

                    // Also log for debugging
                    console.log('chart-click', payload);

               } catch (err) {
                    console.error('handleChartClick error', err);
               }
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
                    this.fromFields = await tableColumns.filter(col =>
                         !(col.data && typeof col.data === 'string' && col.data.includes('.'))
                    );

                    console.log("tableColumns", tableColumns, this.tableColumns);

                    // this.apiParams=Module

               } catch (error) {
                    console.error("Error loading form fields:", error);
               }
          },
          async renderChart() {
               const canvas = this.$refs.canvas;
               if (!canvas) {
                    console.warn('Canvas ref not found, skipping render');
                    return;
               }

               const ctx = canvas.getContext('2d');
               if (!ctx) {
                    console.warn('Canvas context not found');
                    return;
               }

               // Destroy old chart before re-rendering
               if (this.chartInstance) {
                    this.chartInstance.destroy();
               }

               this.dataChart.labels = this.data.labels;
               this.dataChart.datasets[0].data = this.data.data;
               let plugins = {
                    legend: {
                         display: false,
                    },
               };
                if( this.type=="bar"||this.type=="line"||this.type=="radar")
                 plugins ={}
               // Merge provided options but ensure our onClick is set
               const chartOptions = {
                    // keep user's options but allow our click handler to run
                    ...(this.options || {}),
                    onClick: (evt, elements) => {
                         // Chart.js sometimes returns elements as array (v3/v4)
                         this.handleChartClick(evt, elements);
                         // if user provided onClick in options, call it too
                         if (this.options && typeof this.options.onClick === 'function') {
                              try {
                                   this.options.onClick(evt, elements);
                              } catch (err) {
                                   console.warn('User onClick handler threw:', err);
                              }
                         }
                    },
                    plugins:plugins
               };
               this.chartInstance = new Chart(ctx, {
                    type: this.data.type,
                    data: this.dataChart,
                    options: chartOptions,
               });

          },

          async reload() {
               if (this.chartInstance) {
                    this.chartInstance.destroy();
               }
               this.getData();
          },

          async getData() {
               if (this.loading) return;
               this.loading = true;

               if (!this.data.selectmodel?.y?.model) {
                    this.loading = false;
                    return;
               }

               const model = await this.loadFile(this.data.selectmodel.y.model);
               this.api = model;
               const query = { filterGroups: this.data.filterGroups };

               let labels = [];
               let data = [];

               try {
                    if (this.data.queryType === 'sample') {
                         const res = await model.getAll(query);
                         labels = res.map((item) => item[this.data.selectmodel.x.field]);
                         data = res.map((item) => (item[this.data.selectmodel.y.field] || []).length);
                    } else {
                         query.group_by = [this.data.selectmodel.y.field];
                         const res = await model.group(query);
                         labels = res.map((item) => item.id[this.data.selectmodel.y.field]);
                         data = res.map((item) => item.count);
                    }

                    this.data.labels = labels;
                    this.data.ids = labels;
                    this.data.data = data;

                    // Update X-axis labels if needed
                    if (this.data.selectmodel.x?.model && this.data.labels?.length) {
                         try {
                              const modelX = await this.loadFile(this.data.selectmodel.x.model);
                              const resX = await modelX.getAll({
                                   filterIn: `id|${this.data.labels.join(',')}`,
                                   select: 'id|' + this.data.selectmodel.x.field,
                              });

                              const itemMap = Object.fromEntries(resX.map((item) => [item.id, item[this.data.selectmodel.x.field]]));
                              this.data.labels = this.data.labels.map((id) => itemMap[id] || id);
                         } catch (err) {
                              console.error('Error getting X-axis data:', err);
                         }
                    }

                    this.renderChart();
               } catch (err) {
                    console.error('Error fetching data:', err);
               } finally {
                    this.loading = false;
               }
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
          'data.type'() {
               this.reload();
          },
          'data.selectmodel': {
               deep: true,
               handler() {
                    console.log('data.selectmodel changed');
                    this.getData();
               },
          },
          data: {
               deep: true,
               handler(newVal) {
                    this.localData.title = newVal.title;
                    this.localData.icon = newVal.icon;
               },
          },
          'data.filterGroups': {
               deep: true,
               handler() {
                    console.log('data.filterGroups changed');
                    this.getData();
               },
          },
     },
};
</script>

<style scoped>
.widget {
     display: flex;
     flex-direction: column;
}

.v-card-text {
     display: flex;
     flex-direction: column;
     min-height: 0;
}

canvas {
     display: block;
     width: 100% !important;
     height: 100% !important;
}
</style>