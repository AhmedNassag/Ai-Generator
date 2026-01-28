<template>

     <v-select v-model="selectedColor" :items="colorItems" item-title="label" item-value="value" label="Choose a color"
          variant="outlined" class="mb-4">
          <template v-slot:prepend-inner>
               <v-icon :color="selectedColor.text">mdi-circle</v-icon>
          </template>

          <template v-slot:item="{ props, item }">
               <v-list-item v-bind="props">
                    <template v-slot:prepend>
                         <v-icon :color="item.value.text">mdi-circle</v-icon>
                    </template>
               </v-list-item>
          </template>
     </v-select>




</template>

<script>
export default {
     data() {
          return {
               colors: [

                    { name: "Crimson Earth", background: "#EED3D380", avatar: "#A92525", text: "#541212" },
                    { name: "Golden Olive", background: "#F3EAD180", avatar: "#C4951B", text: "#A37C16" },
                    { name: "Forest Deep", background: "#B6CAAE80", avatar: "#255F0B", text: "#122F05" },
                    { name: "Steel Grey", background: "#D9D9D9", avatar: "#999999", text: "#404040" }
               ],

               selectedColor: { name: "Royal Purple", background: "#D0B5E380", avatar: "#6E3894", text: "#43235C" },

          };
     },
     computed: {
          colorItems() {
               return this.colors.map(color => ({
                    label: color.name,
                    value: color
               }));
          }
     },
     emits: ['colorSelected'],
     watch: {
          selectedColor(newColor) {
               console.log('Selected color:', newColor);
               this.$emit('colorSelected', newColor);
          }
     }
};
</script>

<style scoped>
.fill-height {
     min-height: 100vh;
}
</style>