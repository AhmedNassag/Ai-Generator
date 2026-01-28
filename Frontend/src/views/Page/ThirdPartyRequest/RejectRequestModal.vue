<template>
    <v-dialog v-model="isOpen" max-width="500px" persistent>
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyrequest.enter_reject_reason') }}</span>
                <v-btn icon @click="closeModal" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-4" style="background: white;">
                <div>
                    <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                        {{ $t('thirdpartyrequest.reject_reason_placeholder') }}
                    </label>
                    <v-textarea 
                        v-model="rejectReason" 
                        rows="4" 
                        variant="outlined"
                        hide-details
                        :placeholder="$t('thirdpartyrequest.reject_reason_placeholder')"
                        style="font-size: 13px;"
                    ></v-textarea>
                </div>
            </v-card-text>

            <!-- Footer -->
            <v-card-actions class="pa-4" style="background: #f3f4f6; justify-content: flex-end; gap: 8px;">
                <v-btn 
                    variant="outlined"
                    rounded="pill"
                    size="small"
                    @click="closeModal"
                    style="text-transform: none; font-size: 13px; border-color: #d1d5db; color: #374151;"
                >
                    {{ $t('thirdpartyrequest.close') }}
                </v-btn>

                <v-btn 
                    variant="flat"
                    rounded="pill"
                    size="small"
                    :disabled="!rejectReason"
                    @click="submitRejection"
                    style="text-transform: none; font-size: 13px; background: #DC2626; color: white;"
                >
                    {{ $t('thirdpartyrequest.submit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "RejectRequestModal",
    props: {
        modelValue: { type: Boolean, default: false },
        requestId: { type: [String, Number], default: null },
        api: { type: Object, required: true }
    },
    emits: ['update:modelValue', 'rejected'],
    data() {
        return {
            rejectReason: ""
        };
    },
    computed: {
        isOpen: {
            get() { return this.modelValue; },
            set(value) { this.$emit('update:modelValue', value); }
        }
    },
    methods: {
        closeModal() {
            this.isOpen = false;
            this.rejectReason = "";
        },
        submitRejection() {
            if (!this.rejectReason.trim()) {
                this.api.poup({
                    status: false,
                    message: this.$t("thirdpartyrequest.reject_reason_required")
                }, this.$t("thirdpartyrequest.error"));
                return;
            }
            const data = {
                requestId: this.requestId,
                rejectReason: this.rejectReason
            }
            this.$emit('rejected', data);
        }
    }
};
</script>

<style scoped>
.header-bold20 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  text-transform: capitalize;
  color: #000000;
}

:deep(.v-textarea .v-field) {
    border-radius: 6px;
}
</style>