<template>
  <div>
    <VueSelect
      :model-value="internalValue"
      :items="items"
      :disabled="disabled"
      :placeholder="placeholder"
      :multiple="multiple"
      :close-on-select="!multiple"
      :clearable="true"
      :label="optionLabel"
      :reduce="option => option[itemValue]"
      :menu-props="menuProps"
      @update:modelValue="updateInternalValue"
      @input="handleInput"
    >
      <!-- Single Select with Custom List -->
      <template v-if="!multiple" v-slot:prepend-item>
        <v-list density="compact" class="py-0"> 
          <v-list-item  
            v-for="(option, index) in items" 
            :key="index" 
            @click="selectSingleOption(option)"
            class="px-2 py-0 my-0 v-list-item--min-height"
          >
            <template v-slot:prepend>
              <v-checkbox 
                :model-value="isOptionSelected(option)"
                color="#44225A"
                density="compact"
                class="mr-2 v-checkbox--styled"
                hide-details
              ></v-checkbox>
            </template>
            <v-list-item-title class="text-sm">{{ option?.[optionLabel] }}</v-list-item-title>
          </v-list-item>
        </v-list> 
      </template>

      <!-- Custom selection display for multiple select -->
      <template v-if="multiple" v-slot:selection="{ item, index }">
        <span v-if="index < 3" class="v-select__selection-text">
          {{ item.title }}<span v-if="index < Math.min(2, internalValue.length - 1)">, </span>
        </span>
        <span
          v-if="index === 3"
          class="v-select__selection-more"
        >
          ... (+{{ internalValue.length - 3 }} more)
        </span>
      </template>

      <!-- Custom selection display for single select -->
      <template v-if="!multiple" v-slot:selection="{ item }">
        <span class="v-select__selection-text">{{ item.title }}</span>
      </template>
    </VueSelect>

    <!-- Hidden field for validation -->
    <Field
      :name="name"
      :rules="rules"
      :modelValue="internalValue"
      @update:modelValue="updateInternalValue"
      class="v-field--hidden"
    />
  </div>
</template>

<script>
import { Field } from "vee-validate";
import VSelect from "vue-select";


export default {
  name: 'VSelect',
  components: {
    Field,
    VSelect
  },
  props: {
    modelValue: {
      type: [Array, String, Number, Object],
      default: null
    },
    name: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
    placeholder: String,
    multiple: {
      type: Boolean,
      default: false
    },
    optionLabel: {
      type: String,
      default: 'name'
    },
    itemValue: {
      type: String,
      default: 'id'
    },
    rules: {
      type: [String, Object],
      default: ''
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      internalValue: this.multiple ? (Array.isArray(this.modelValue) ? this.modelValue : []) : this.modelValue,
      menuProps: {
        contentClass: 'v-select__menu--styled',
        maxHeight: '200px'
      }
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        // تجنب التكرار الدائم - تحديث فقط إذا كانت القيمة مختلفة
        if (JSON.stringify(newVal) !== JSON.stringify(this.internalValue)) {
          this.internalValue = this.multiple ? (Array.isArray(newVal) ? newVal : []) : newVal;
        }
      },
      deep: true
    }
  },
  methods: {
    isOptionSelected(option) {
      if (this.multiple) {
        return this.internalValue.includes(option[this.itemValue]);
      }
      return this.internalValue === option[this.itemValue];
    },

    selectSingleOption(option) {
      if (this.multiple) {
        this.toggleMultipleOption(option);
      } else {
        this.internalValue = this.internalValue === option[this.itemValue] ? null : option[this.itemValue];
      }
      this.handleInput();
    },

    toggleMultipleOption(option) {
      const value = option[this.itemValue];
      const currentIndex = this.internalValue.indexOf(value);
      
      if (currentIndex === -1) {
        this.internalValue.push(value);
      } else {
        this.internalValue.splice(currentIndex, 1);
      }
    },

    handleInput() {
      // استخدام nextTick لتجنب تحديثات متزامنة
      this.$nextTick(() => {
        this.$emit('update:modelValue', this.internalValue);
        this.$emit('change', this.internalValue);
      });
    },

    updateInternalValue(value) {
      // تحديث من Field component فقط إذا كانت القيمة مختلفة
      if (JSON.stringify(value) !== JSON.stringify(this.internalValue)) {
        this.internalValue = value;
      }
    }
  }
};
</script>

<style scoped>
/* الأنماط الأساسية */
.v-field--hidden {
  display: none;
}
</style>