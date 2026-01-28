<template>
  <v-dialog
    :model-value="showModal"
    @update:model-value="$emit('update:showModal', $event)"
    max-width="1800px"
    persistent
  >
    <v-card class="d-flex flex-column" style="max-height: 90vh;">
      <!-- HEADER (fixed) -->
      <v-card-title
        class="d-flex align-center"
        style="background-color: #1976D2; color: white; flex-shrink: 0; width: 100%;"
      >
        <span class="text-h5">{{ title }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal" class="close-btn" color="white" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY (scrollable) -->
      <v-card-text style="overflow-y: auto; flex: 1;width: 100%;">
        <v-container class="pa-4">
          <div class="mb-4">
            <h3>Parameters and Levels</h3>
            <p class="text-caption">Add parameters and define their levels in a single step.</p>
          </div>

          <div
            v-for="(param, index) in parameters"
            :key="`param-${index}`"
            class="mb-4"
          >
            <v-card outlined elevation="2">
              <v-card-title class="primary white--text">
                <v-icon left color="white">mdi-tag</v-icon>
                Parameter {{ index + 1 }}: {{ param.value }}
                <v-spacer></v-spacer>
              </v-card-title>

              <v-card-text>
                <v-row align="center" class="mb-3">
                  <v-col cols="12">
                    <v-text-field
                      :model-value="param.value"
                      @update:model-value="updateParameterProperty(index, 'value', $event)"
                      :label="`Parameter Name`"
                      placeholder="Enter parameter name (e.g., Color, Size, Material)"
                      outlined
                      dense
                      :rules="[v => !!v || 'Parameter name is required']"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <div
                  v-for="(level, levelIndex) in param.levels"
                  :key="`level-${index}-${levelIndex}`"
                  class="mb-2"
                >
                  <v-row align="center">
                    <v-col cols="3">
                      <v-text-field
                        :model-value="level.levelName"
                        @update:model-value="updateLevelProperty(index, levelIndex, 'levelName', $event)"
                        :label="`Level ${levelIndex + 1} Name`"
                        placeholder="Enter level name"
                        outlined
                        dense
                        :rules="[v => !!v || 'Level name is required']"
                        :disabled="false"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2">
                      <v-text-field
                        :model-value="level.levelNumber"
                        @update:model-value="updateLevelProperty(index, levelIndex, 'levelNumber', $event)"
                        :label="`Level ${levelIndex + 1} Number`"
                        type="number"
                        :disabled="true"
                        placeholder="Enter level number"
                        outlined
                        dense
                        :rules="[v => !!v || 'Level number is required']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        :model-value="level.color"
                        @update:model-value="updateLevelProperty(index, levelIndex, 'color', $event)"
                        :label="`Level ${levelIndex + 1} Color`"
                        type="color"
                        outlined
                        dense
                        :rules="[v => !!v || 'Color is required']"
                        :disabled="true"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        :model-value="level.description"
                        @update:model-value="updateLevelProperty(index, levelIndex, 'description', $event)"
                        :label="`Level ${levelIndex + 1} Description`"
                        placeholder="Enter level description"
                        outlined
                        dense
                        :rules="[v => !!v || 'Description is required']"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-container>
      </v-card-text>

      <!-- FOOTER (fixed) -->
      <v-card-actions class="pa-4" style="flex-shrink: 0;width: 100%;">
        <v-btn color="grey" text @click="closeModal">
          <v-icon left>mdi-close</v-icon>
          Cancel
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn color="success" @click="saveParameters" :disabled="!canSave" :loading="loading">
          <v-icon left>mdi-content-save</v-icon>
          Save Parameters
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
export default {
  name: 'ParameterModal',
  props: {
    showModal: Boolean,
    title: String,
    parameters: Array,
    loading: Boolean,
    canSave: Boolean
  },
  emits: ['close', 'save', 'update:showModal', 'update:parameters'],
  methods: {
    closeModal() {
      this.$emit('close');
      this.$emit('update:showModal', false);
    },
    saveParameters() {
      this.$emit('save', this.parameters);
    },
    updateParameterProperty(paramIndex, property, value) {
      const newParameters = [...this.parameters];
      newParameters[paramIndex] = { ...newParameters[paramIndex], [property]: value };
      this.$emit('update:parameters', newParameters);
    },
    updateLevelProperty(paramIndex, levelIndex, property, value) {
      const newParameters = [...this.parameters];
      const newLevels = [...newParameters[paramIndex].levels];
      newLevels[levelIndex] = { ...newLevels[levelIndex], [property]: value };
      newParameters[paramIndex] = { ...newParameters[paramIndex], levels: newLevels };
      this.$emit('update:parameters', newParameters);
    }
  }
};
</script>