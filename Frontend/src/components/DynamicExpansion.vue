<template>
  <v-expansion-panels v-model="openPanels" class="expansion-panels-width-border">
    <v-expansion-panel 
      color="#F3EDF8" 
      v-for="(item, index) in items" 
      :key="index" 
      elevation="0"
    >
      <v-expansion-panel-title 
        collapse-icon="bx-chevron-up" 
        expand-icon="bx-chevron-down" 
        @click="handleClick(item, index)"
      >
        <slot name="title" :item="item">
          {{ item.title }} ({{ item.count }})
        </slot>
      </v-expansion-panel-title>
      
      <v-expansion-panel-text style="margin-left:0px">
        <!-- Recursively render nested accordion panels if children exist -->
        <DynamicExpansion 
          v-if="item.children && item.children.length" 
          :items="item.children"
          :depth="depth + 1"
          @item-selected="emitSelectedItem"
        >
          <template #title="{ item }">
            <slot name="title" :item="item" />
          </template>
          <template #data="{ item }">
            <slot name="data" :item="item" />
          </template>
        </DynamicExpansion>
        
        <!-- Display data table when no children -->
        <slot name="data" :item="item" v-else></slot>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  name: "DynamicExpansion",
  props: {
    items: {
      type: Array,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      openPanels: []
    };
  },
  mounted() {
    // Open the first panel automatically at each depth
    if (this.items && this.items.length > 0) {
      this.openPanels = [0];
    }
  },
  methods: {
    handleClick(item, index) {
      // Emit event when title is clicked
      this.emitSelectedItem(item);
    },
    emitSelectedItem(item) {
      // Emit upward so parent gets notified
      this.$emit("item-selected", item);
    }
  }
};
</script>

<style scoped>
.expansion-panels-width-border {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.v-expansion-panel-title {
  font-weight: bold;
}
</style>