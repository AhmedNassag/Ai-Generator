<template>
    <div v-if="show" class="modal d-block modal-fade">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $t('thirdpartyprofile.view_third_party_profile') }}</h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>

                <div class="modal-body">
                    <div class="custom-accordion">

                        <!-- General Information -->
                        <div class="accordion-item">
                            <div class="accordion-header" @click="toggleSection('general')">
                                <span>{{ $t('thirdpartyprofile.general_information') }}</span>
                                <svg :class="['chevron', { 'rotated': openSections.general }]" width="20" height="20"
                                    viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div v-show="openSections.general" class="accordion-content">
                                <div class="row mb-2">
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.third_party_name') }}:</label>
                                        <div class="field-value">{{ profileData.third_party_name || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.owner_ceo') }}:</label>
                                        <div class="field-value">{{ profileData.owner || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.domain') }}:</label>
                                        <div class="field-value">{{ profileData.domain || '' }}</div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.agreement') }}:</label>
                                        <div class="field-value">{{ profileData.agreement || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.contract_term') }}:</label>
                                        <div class="field-value">{{ profileData.contract_term || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.classification') }}:</label>
                                        <div class="field-value">{{ profileData.classification?.name || '' }}</div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.head_office_location') }}:</label>
                                        <div class="field-value">{{ profileData.head_office_location || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.date_of_incorporation') }}:</label>
                                        <div class="field-value">{{ profileData.date_of_incorporation || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.place_of_incorporation') }}:</label>
                                        <div class="field-value">{{ profileData.place_of_incorporation || '' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Contact List -->
                        <div class="accordion-item">
                            <div class="accordion-header" @click="toggleSection('contact')">
                                <span>{{ $t('thirdpartyprofile.contact_list') }}</span>
                                <svg :class="['chevron', { 'rotated': openSections.contact }]" width="20" height="20"
                                    viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div v-show="openSections.contact" class="accordion-content">
                                <!-- Contact -->
                                <div v-if="normalContacts.length > 0">
                                    <h6 class="contact-title">{{ $t('thirdpartyprofile.contact') }}</h6>
                                    <div v-for="(contact, index) in normalContacts" :key="'contact-' + index" class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.name') }}:</label>
                                            <div class="field-value">{{ contact.name || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.phone') }}:</label>
                                            <div class="field-value">{{ contact.phone || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.email') }}:</label>
                                            <div class="field-value">{{ contact.email || '' }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Technical Contact -->
                                <div v-if="technicalContacts.length > 0">
                                    <h6 class="contact-title">{{ $t('thirdpartyprofile.technical_contact') }}</h6>
                                    <div v-for="(contact, index) in technicalContacts" :key="'technical-' + index" class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.name') }}:</label>
                                            <div class="field-value">{{ contact.name || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.phone') }}:</label>
                                            <div class="field-value">{{ contact.phone || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.email') }}:</label>
                                            <div class="field-value">{{ contact.email || '' }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Business Contact -->
                                <div v-if="businessContacts.length > 0">
                                    <h6 class="contact-title">{{ $t('thirdpartyprofile.business_contact') }}</h6>
                                    <div v-for="(contact, index) in businessContacts" :key="'business-' + index" class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.name') }}:</label>
                                            <div class="field-value">{{ contact.name || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.phone') }}:</label>
                                            <div class="field-value">{{ contact.phone || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.email') }}:</label>
                                            <div class="field-value">{{ contact.email || '' }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Cyber Security Contact -->
                                <div v-if="cyberContacts.length > 0">
                                    <h6 class="contact-title">{{ $t('thirdpartyprofile.cyber_contact') }}</h6>
                                    <div v-for="(contact, index) in cyberContacts" :key="'cyber-' + index" class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.name') }}:</label>
                                            <div class="field-value">{{ contact.name || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.phone') }}:</label>
                                            <div class="field-value">{{ contact.phone || '' }}</div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="field-label">{{ $t('thirdpartyprofile.email') }}:</label>
                                            <div class="field-value">{{ contact.email || '' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Interested Entities -->
                        <div class="accordion-item">
                            <div class="accordion-header" @click="toggleSection('entities')">
                                <span>{{ $t('thirdpartyprofile.interested_entities') }}</span>
                                <svg :class="['chevron', { 'rotated': openSections.entities }]" width="20" height="20"
                                    viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div v-show="openSections.entities" class="accordion-content">
                                <div v-for="(entity, index) in entities" :key="'entity-' + index" class="row mb-3">
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.entity') }}:</label>
                                        <div class="field-value">{{ entity.entity || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.date') }}:</label>
                                        <div class="field-value">{{ entity.date || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.involvement') }}:</label>
                                        <div class="field-value">{{ entity.involvement || '' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Subsidiaries -->
                        <div class="accordion-item">
                            <div class="accordion-header" @click="toggleSection('subsidiaries')">
                                <span>{{ $t('thirdpartyprofile.subsidiaries') }}</span>
                                <svg :class="['chevron', { 'rotated': openSections.subsidiaries }]" width="20"
                                    height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div v-show="openSections.subsidiaries" class="accordion-content">
                                <div v-for="(subsidiary, index) in subsidiaries" :key="'subsidiary-' + index" class="row mb-3">
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.affiliation') }}:</label>
                                        <div class="field-value">{{ subsidiary.affiliation || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.date') }}:</label>
                                        <div class="field-value">{{ subsidiary.date || '' }}</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="field-label">{{ $t('thirdpartyprofile.involvement') }}:</label>
                                        <div class="field-value">{{ subsidiary.involvement || '' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-cancel" @click="closeModal">
                        {{ $t('thirdpartyprofile.cancel') }}
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ViewProfileModal",
    props: {
        show: {
            type: Boolean,
            default: false
        },
        profileData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            openSections: {
                general: true,
                contact: false,
                entities: false,
                subsidiaries: false
            }
        };
    },
    computed: {
        normalContacts() {
            return this.profileData.normalContacts || this.profileData.normal_contacts || [];
        },
        businessContacts() {
            return this.profileData.businessContacts || this.profileData.business_contacts || [];
        },
        technicalContacts() {
            return this.profileData.technicalContacts || this.profileData.technical_contacts || [];
        },
        cyberContacts() {
            return this.profileData.cyberContacts || this.profileData.cyber_contacts || [];
        },
        entities() {
            return this.profileData.entities || [];
        },
        subsidiaries() {
            return this.profileData.subsidiaries || [];
        }
    },
    methods: {
        toggleSection(section) {
            this.openSections[section] = !this.openSections[section];
        },
        closeModal() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.modal-fade {
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

.modal-fade .modal-dialog {
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.modal-fade.d-block {
    opacity: 1;
}

.modal-fade.d-block .modal-dialog {
    opacity: 1;
    transform: translateY(0);
}

.modal-dialog {
    border-radius: 12px;
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
    background-color: #F0F0F0;
}

/* Custom Accordion Styles */
.custom-accordion {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: white;
    padding: 12px;
    border-radius: 10px;
}

.accordion-item {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background: white;
    color: #000000;
}

.accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #F0F0F0;
    cursor: pointer;
    user-select: none;
    font-weight: bolder;
    font-size: 17px;
    color: #1f2937;
    transition: background-color 0.2s;
}

.accordion-header:hover {
    background: #f3f4f6;
}

.chevron {
    transition: transform 0.3s ease;
    color: #6b7280;
}

.chevron.rotated {
    transform: rotate(180deg);
}

.accordion-content {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
}

/* Field Styles - Exactly like images */
.field-label {
    font-size: 12px;
    font-weight: 400;
    color: #9CA3AF;
    margin-bottom: 4px;
    display: block;
}

.field-value {
    font-size: 14px;
    font-weight: 400;
    color: #000000;
    margin-bottom: 0;
}

/* Contact Title */
.contact-title {
    font-size: 15px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
    margin-top: 0;
}

/* Modal Footer */
.modal-footer {
    padding: 16px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    background-color: #F0F0F0;
    border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.modal-header {
    padding: 16px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    background-color: #F0F0F0;
    border-bottom: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.modal-title {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0;
    color: #000000;
    text-transform: capitalize;
    vertical-align: middle;
}

.btn-cancel {
    /* padding: 10px 24px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s; */
}

.btn-cancel:hover {
    background: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
    .row > div {
        margin-bottom: 12px;
    }
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row , [dir="rtl"] .contact-title{
text-align: end;
}
[dir="rtl"] .accordion-header , [dir="rtl"] .modal-footer{
    flex-direction: row-reverse;
}
</style>