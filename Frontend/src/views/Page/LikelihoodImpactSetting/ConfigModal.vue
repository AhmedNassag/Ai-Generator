<template>
    <v-dialog :model-value="showModal" @update:model-value="$emit('update:showModal', $event)" max-width="800px"
        persistent>
        <v-card>
            <v-card-title class="d-flex align-center" style="background-color: #1976D2; color: white; flex-shrink: 0; width: 100%;">
                <span class="text-h5">{{ title }}</span>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeModal" class="close-btn" color="white" size="small">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

      <v-card-text style="overflow-y: auto; flex: 1;width: 100%;">
                <v-container class="pa-4">
                    <v-row>
                        <v-col cols="12">
                            <div v-for="(level, index) in configData.levels" :key="index" class="mt-2">
                                <v-row>
                                    <v-col cols="5">
                                        <v-text-field :model-value="level.name"
                                            @update:model-value="updateLevelProperty(index, 'name', $event)"
                                            label="Level Name" outlined dense></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field :model-value="level.color"
                                            @update:model-value="updateLevelProperty(index, 'color', $event)"
                                            label="Level Color" type="color" outlined dense></v-text-field>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field label="Level value" :model-value="index + 1" type="number" :disabled="true" outlined
                                            dense></v-text-field>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions class="pa-4" style="flex-shrink: 0;width: 100%;">
                <v-btn color="grey" text @click="closeModal">
                    <v-icon left>mdi-close</v-icon>
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" :disabled="!canSaveConfig || loadingConfig" @click="saveConfig" :loading="loadingConfig">
                    <v-icon left>mdi-content-save</v-icon>
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'ConfigModal',
    props: {
        showModal: Boolean,
        title: String,
        configData: Object,
        loadingConfig: Boolean,
        canSaveConfig: Boolean
    },
    emits: ['close', 'save', 'update:showModal', 'update:configData'],
    
    methods: {
        closeModal() {
            this.$emit('close');
            this.$emit('update:showModal', false);
        },
        saveConfig() {
            this.$emit('save', this.configData);
        },
        addLevel() {
            const newLevels = [...this.configData.levels, { name: '', color: '', value: '' }];
            this.$emit('update:configData', { ...this.configData, levels: newLevels });
        },

        updateLevelProperty(index, property, value) {
            const newLevels = [...this.configData.levels];
            newLevels[index] = { ...newLevels[index], [property]: value };
            this.$emit('update:configData', { ...this.configData, levels: newLevels });
        }
    }
};
</script>