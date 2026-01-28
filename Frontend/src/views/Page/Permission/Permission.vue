<template>
  <div v-permission:show>
    <br>
    <h1>Scanned Directives</h1>

    <!-- Table to display the scanned directives -->
    <table>
      <thead>
        <tr>
          <th>Controller Name</th>
          <th>Method Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(directive, index) in filteredDirectives" :key="index" v-permission:show>
          <td>{{ directive.controller }}</td>
          <td>{{ directive.method }}</td>
        </tr>
      </tbody>
    </table>

  <div v-if="componentLoaded" class="hidden-component">
    <!-- Dynamically render all components -->
    <div v-for="(component, index) in dynamicComponentPermission" :key="index">
      <component :is="component" />
    </div>
  </div>
    <!-- Trigger to load the component -->
    <button @click="loadPermission" v-permission:store>Load Permission</button>

    <!-- Trigger to show the hidden component -->
    <div>
      <!-- Some content -->
    </div>
  </div>
</template>

<script>
import { inject, ref } from 'vue';
import permission from "@/API/Permission/Permission";

export default {
  data() {
    return {
      search: '', // Input field value for filtering
      componentLoaded: false, // Track if the component has been loaded
      dynamicComponentPermission: null, // Placeholder for dynamic component
      isComponentVisible: false, // Track if the component is visible
      filteredDirectives: [], // Store the filtered directives here
    };
  },
  computed: {
    // Get all scanned directives from the plugin
    scannedDirectives() {
      const getScannedDirectives = inject('$getScannedDirectives');
      return getScannedDirectives ? getScannedDirectives() : [];
    },
  },
  created() {
    this.refreshTable();
    // Dynamically load components
    const files = require.context('@/views/Page', true, /\.vue$/);

    const components = {}; // Store components by name
    const allComponents = []; // Store all components in an array
    const promises = [];

    // Load components dynamically
    files.keys().forEach(filePath => {
        const promise = new Promise((resolve, reject) => {
            try {
                const componentName = filePath.split('/').pop().replace('.vue', '');
                const component = files(filePath).default;

                // Store component in an object by name
                components[componentName] = component;
                if(componentName != "Permission") {

                  allComponents.push(component);
                }

                // Register the component globally in Vue

                resolve(component);
            } catch (error) {
                reject(error);
            }
        });

        promises.push(promise);
    });

    // Wait for all components to be loaded
    Promise.all(promises);
    this.dynamicComponentPermission = allComponents;
    this.componentLoaded = true;
  },
  methods: {
    // Dynamically load all components from @/views/Page/*/*.vue
    async loadPermission(app) {
      try {

          // Process `window.permissions` after scanning directives
          if (Array.isArray(window.permissions)) {
              const directives = window.permissions.map((permission) => {
                  const [controller, method] = permission.split(/\/([^/]+)$/); // Split by the last '/'
                  return {
                      controller: controller,
                      method: method || 'index',
                  };
              });


              const apiPermission = new permission(); // Assuming permission is your API class
              const responsePermission = await apiPermission.insert({ directives }); // Fetch the directives list
              //this.filteredDirectives = responsePermission;

              this.refreshTable(); // Refresh the table after API success
          } else {
              console.error('window.permissions is not an array');
          }
      } catch (error) {
          console.error('Error loading components or processing directives:', error);
      }
  },
    // Refresh or trigger a re-render (optional, since Vue handles this reactively)
    async refreshTable() {
                // Simulating an API call to fetch the data
        const api = new permission(); // Assuming permission is your API class
        const response = await api.getAll(); // Fetch the directives list
        this.filteredDirectives = response;
      this.$forceUpdate(); // Optionally force a re-render if needed
    },
    // Toggle the visibility of the dynamically loaded component
    toggleComponentVisibility() {
      this.isComponentVisible = !this.isComponentVisible;
    },
  },
};
</script>

<style>
/* Add basic styles for the table */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
}

/* Hide the component by default */
.hidden-component {
  display: none;
}

/* Show the component if it's visible */
.hidden-component.visible {
  display: block;
}
</style>
