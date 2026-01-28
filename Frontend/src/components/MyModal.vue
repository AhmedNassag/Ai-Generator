<template>
    <div v-if="visible" class="dialog-overlay" @click="closeDialog">
        <div class="dialog-content" @click.stop>
            <div class="dialog-header">
                <h1 class="modal-title">{{ title }}</h1>
                <button class="btn-close" @click="closeDialog" aria-label="Close">×</button>
            </div>
            <div class="dialog-body">
                <slot></slot> <!-- Content injected here -->
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" @click="closeDialog">Close</button>
                <button class="btn btn-primary" @click="saveChanges">Save changes</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: 'Modal title',
        },
        value: {
            type: Boolean,
            default: false, // Controls whether the dialog is visible
        },
    },
    computed: {
        visible() {
            return this.value;
        },
    },
    methods: {
        closeDialog() {
            this.$emit('input', false); // Emit the input event to close the dialog
        },
        saveChanges() {
            this.$emit('save'); // Emit a custom save event for parent to handle
            this.closeDialog();
        },
    },
};
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.dialog-content {
    background: white;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.dialog-footer .btn {
    margin-left: 10px;
}

.btn-close {
    font-size: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}
</style>