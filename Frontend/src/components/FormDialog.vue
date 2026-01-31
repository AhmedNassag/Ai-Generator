<template>
  <v-dialog
    v-model="dialogVisible"
    :max-width="dialogWidth"
    :persistent="persistent"
    @update:model-value="onDialogClose"
  >
    <v-card class="form-dialog-card">
      <!-- نستخدم Form الأصلي داخل الدايلوج -->
      <Form
        :new-item="formData"
        :schema="schema"
        :form-data="formDataMode"
        :api="api"
        :base-image-url="baseImageUrl"
        :custom-submit="customSubmit"
        :on-submit-complete="onSubmitComplete"
        :close-form="closeFormInternal"
        :show="showMode"
        :no-submit="false"
      >
        <!-- نمرر جميع slots -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps" />
        </template>
      </Form>
    </v-card>
  </v-dialog>
</template>

<script>
import Form from './Form.vue';
import { ref, computed, watch } from 'vue';

export default {
  name: 'FormDialog',
  
  components: {
    Form
  },
  
  props: {
    // نفس props الموجودة في Form.vue
    newItem: { 
      type: Object, 
      required: true,
      default: () => ({})
    },
    schema: { 
      type: Array, 
      required: true 
    },
    formData: { 
      type: Boolean, 
      default: false 
    },
    api: { 
      type: Object, 
      default: null 
    },
    baseImageUrl: { 
      type: String, 
      default: "" 
    },
    customSubmit: { 
      type: Function, 
      default: null 
    },
    onSubmitComplete: { 
      type: Function, 
      default: null 
    },
    closeForm: {
      type: Function,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    },
    noSubmit: {
      type: Boolean,
      default: false
    },
    
    // props إضافية للدايلوج
    dialogWidth: {
      type: [String, Number],
      default: 800
    },
    persistent: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  
  emits: [
    'update:modelValue',
    'submit',
    'close',
    'update:value'
  ],
  
  setup(props, { emit }) {
    const dialogVisible = ref(props.value);
    const formData = ref({ ...props.newItem });
    
    // Computed properties
    const formDataMode = computed(() => props.formData);
    const showMode = computed(() => props.show);
    
    // Watch for prop changes
    watch(() => props.value, (newValue) => {
      dialogVisible.value = newValue;
    });
    
    watch(() => props.newItem, (newValue) => {
      formData.value = { ...newValue };
    }, { deep: true });
    
    watch(dialogVisible, (newValue) => {
      emit('update:value', newValue);
      if (!newValue) {
        emit('close');
      }
    });
    
    // Methods
    const openDialog = () => {
      dialogVisible.value = true;
    };
    
    const closeDialog = () => {
      dialogVisible.value = false;
    };
    
    const closeFormInternal = () => {
      closeDialog();
      if (props.closeForm) {
        props.closeForm();
      }
    };
    
    const onDialogClose = (value) => {
      if (!value) {
        closeFormInternal();
      }
    };
    
    // Expose methods
    const exposeMethods = () => ({
      open: openDialog,
      close: closeDialog,
      submit: () => {}
    });
    
    return {
      dialogVisible,
      formData,
      formDataMode,
      showMode,
      openDialog,
      closeDialog,
      closeFormInternal,
      onDialogClose,
      exposeMethods
    };
  },
  
  expose: ['open', 'close', 'submit']
};
</script>

<style scoped>
.form-dialog-card {
  max-height: 90vh;
  overflow-y: auto;
}

/* استيراد نفس styles من Form.vue */
:deep(.form-dialog-card .card) {
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
}

:deep(.form-dialog-card .card-header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

:deep(.form-dialog-card .card-body) {
  padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-dialog-card {
    margin: 0;
  }
  
  :deep(.form-dialog-card .card-body) {
    padding: 1rem;
  }
}
</style>