<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="modelValue" class="modal-backdrop" @click="handleBackdropClick">
                <div class="modal-wrapper" :class="['custom-dialog', `modal-${size}`]">
                    <div class="modal-container" :class="`modal-${size}`" :style="{ maxWidth: dialogMaxWidth }"
                        @click.stop>
                        <!-- Modal Header -->
                        <div class="modal-header">
                            <h3 class="modal-title">{{ title }}</h3>
                            <button class="modal-close" @click="closeDialog">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" />
                                </svg>
                            </button>
                        </div>

                        <!-- Modal Body (Dynamic Content Slot) -->
                        <div class="modal-body">
                            <slot></slot>
                        </div>

                        <!-- Modal Footer -->
                        <div class="modal-footer" v-if="showFooter">
                            <button class="button button-cancel" @click="closeDialog">{{ cancelText }}</button>
                            <button v-if="hasSubmit" class="button button-save" @click="handleSubmit"
                                :disabled="loading">
                                <span v-if="loading" class="button-loader"></span>
                                <span v-else>{{ submitText }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
export default {
    name: 'BootstrapModal',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
            default: false
        },
        title: {
            type: String,
            required: true,
            default: 'Modal Title'
        },
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large', 'xlarge', 'fullpage'].includes(value)
        },
        hasSubmit: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        submitText: {
            type: String,
            default: 'Save'
        },
        cancelText: {
            type: String,
            default: 'Cancel'
        }
    },

    emits: ['update:modelValue', 'submit', 'close'],

    computed: {
        dialogMaxWidth() {
            const widths = {
                small: '400px',
                medium: '500px',
                large: '700px',
                xlarge: '900px',
                fullpage: '100vw'
            };
            return widths[this.size] || '500px';
        }
    },

    watch: {
        modelValue(newVal) {
            if (newVal) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    },

    beforeUnmount() {
        document.body.style.overflow = '';
    },

    methods: {
        updateValue(value) {
            this.$emit('update:modelValue', value);
            if (!value) {
                this.$emit('close');
            }
        },
        closeDialog() {
            this.$emit('update:modelValue', false);
            this.$emit('close');
        },
        handleSubmit() {
            this.$emit('submit');
        },
        handleBackdropClick() {
            // allow closing on backdrop click
            this.closeDialog();
        }
    }
};
</script>

<style scoped>
/* Modal Backdrop */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
}

/* Modal Wrapper */
.modal-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

/* Modal Container */
.modal-container {
    background: #ffffff;
    border-radius: 0.75rem;
    width: 100%;
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0.625rem 2.5rem rgba(0, 0, 0, 0.15);
}

/* Modal Sizes */
.modal-small .modal-container {
    max-width: 25rem;
}

.modal-medium .modal-container {
    max-width: 31.25rem;
}

.modal-large .modal-container {
    max-width: 43.75rem;
}

.modal-xlarge .modal-container {
    max-width: 56.25rem;
}

/* Full Page Modal */
.modal-fullpage .modal-container {
    max-width: calc(100vw - 2.5rem);
    max-height: calc(100vh - 2.5rem);
    height: calc(100vh - 2.5rem);
}

.modal-fullpage .modal-body {
    max-height: none;
}

/* Modal Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.90rem 0.90rem 0.60rem;
    border-bottom: 0.0625rem solid #e5e5e5;
    flex-shrink: 0;
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.4;
}

.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: #666666;
    transition: color 0.2s ease, background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    flex-shrink: 0;
}

.modal-close:hover {
    color: #1a1a1a;
    background-color: #f5f5f5;
}

.modal-close:focus {
    outline: 0.125rem solid #6E3894;
    outline-offset: 0.125rem;
}

/* Modal Body */
.modal-body {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
    flex: 1;
}

.modal-body::-webkit-scrollbar {
    width: 0.5rem;
}

.modal-body::-webkit-scrollbar-track {
    background: #f5f5f5;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 0.25rem;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #999999;
}

/* Modal Footer */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem 1.5rem;
    border-top: 0.0625rem solid #e5e5e5;
    flex-shrink: 0;
}

/* Buttons */
.button {
    border: 0.0625rem solid #6E3894;
    border-radius: 0.625rem;
    padding: 6px 25px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    line-height: 1.5;
}

.button:focus {
    outline: 0.125rem solid #6E3894;
    outline-offset: 0.125rem;
}

.button-cancel {
    color: #43235C;
    background: #ffffff;
}

.button-cancel:hover {
    background-color: #f5f5f5;
}

.button-cancel:active {
    background-color: #ebebeb;
}

.button-save {
    background: #6E3894;
    color: #ffffff;
    border-color: #6E3894;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 5rem;
}

.button-save:hover:not(:disabled) {
    background-color: #5a2d78;
    border-color: #5a2d78;
}

.button-save:active:not(:disabled) {
    background-color: #4a2462;
}

.button-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Button Loader */
.button-loader {
    width: 1rem;
    height: 1rem;
    border: 0.125rem solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
    transition: transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
    transform: scale(0.95);
}

/* Responsive */
@media (max-width: 37.5rem) {
    .modal-container {
        max-width: 100% !important;
        margin: 0 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
</style>