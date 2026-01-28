<template>
    <div v-if="show" class="modal d-block modal-fade">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $t('thirdpartyprofile.create_third_party_profile') }}</h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="custom-accordion">

                            <!-- General Information -->
                            <div class="accordion-item">
                                <div class="accordion-header" @click="toggleSection('general')">
                                    <span>{{ $t('thirdpartyprofile.general_information') }}</span>
                                    <svg :class="['chevron', { 'rotated': openSections.general }]" width="20"
                                        height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div v-show="openSections.general" class="accordion-content">
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.third_party_name')
                                                }}</label>
                                            <input type="text" required v-model="general_info.third_party_name"
                                                :placeholder="$t('thirdpartyprofile.third_party_name_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.owner_ceo') }}</label>
                                            <input type="text" v-model="general_info.owner"
                                                :placeholder="$t('thirdpartyprofile.owner_ceo_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.domain') }}</label>
                                            <input type="text" v-model="general_info.domain"
                                                :placeholder="$t('thirdpartyprofile.domain_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.agreement') }}</label>
                                            <input type="text" v-model="general_info.agreement"
                                                :placeholder="$t('thirdpartyprofile.agreement_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.contract_term')
                                                }}</label>
                                            <input type="number" v-model="general_info.contract_term"
                                                :placeholder="$t('thirdpartyprofile.contract_term_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.classification')
                                                }}</label>
                                            <!-- <v-select v-model="general_info.third_party_classification_id"
                                                :options="classifications"
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                :placeholder="$t('thirdpartyprofile.select_classification')"
                                                :reduce="option => option.id" label="name" clearable>
                                            </v-select> -->

                                          <LazySelectField name="third_party_classification_id"
                                                options="ThirdPartyClassification" v-model="general_info.third_party_classification_id"
                                                :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                :placeholder="$t('vendorrepository.select_classification')"
                                                option-label="name" option-value="id" />


                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.date_of_incorporation')
                                                }}</label>
                                            <input type="date" v-model="general_info.date_of_incorporation"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.head_office_location')
                                                }}</label>
                                            <input type="text" v-model="general_info.head_office_location"
                                                :placeholder="$t('thirdpartyprofile.head_office_location_placeholder')"
                                                class="form-control" />
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">{{ $t('thirdpartyprofile.place_of_incorporation')
                                                }}</label>
                                            <input type="text" v-model="general_info.place_of_incorporation"
                                                :placeholder="$t('thirdpartyprofile.place_of_incorporation_placeholder')"
                                                class="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Contact List -->
                            <div class="accordion-item">
                                <div class="accordion-header" @click="toggleSection('contact')">
                                    <span>{{ $t('thirdpartyprofile.contact_list') }}</span>
                                    <svg :class="['chevron', { 'rotated': openSections.contact }]" width="20"
                                        height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div v-show="openSections.contact" class="accordion-content">
                                    <!-- Regular Contacts -->
                                    <h6 class="contact-section-title">{{ $t('thirdpartyprofile.contacts') }}</h6>
                                    <div v-for="(cont, index) in contact" :key="'contact-' + index" class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.contact_name')
                                                    }}</label>
                                                <input type="text" v-model="cont.name"
                                                    :placeholder="$t('thirdpartyprofile.name_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.phone') }}</label>
                                                <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')"
                                                    v-model="cont.phone" placeholder="Enter Phone Number"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.email') }}</label>
                                                <input type="email" v-model="cont.email"
                                                    :placeholder="$t('thirdpartyprofile.email_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button" @click="addItem('contact')"
                                                    class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="contact.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('contact', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Business Contacts -->
                                    <h6 class="contact-section-title mt-4">{{ $t('thirdpartyprofile.business_contacts')
                                        }}</h6>
                                    <div v-for="(cont, index) in business_contact" :key="'business-' + index"
                                        class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.contact_name')
                                                    }}</label>
                                                <input type="text" v-model="cont.name"
                                                    :placeholder="$t('thirdpartyprofile.name_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.phone') }}</label>
                                                <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')"
                                                    v-model="cont.phone" placeholder="Enter Phone Number"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.email') }}</label>
                                                <input type="email" v-model="cont.email"
                                                    :placeholder="$t('thirdpartyprofile.email_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button"
                                                    @click="addItem('business_contact')" class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="business_contact.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('business_contact', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Technical Contacts -->
                                    <h6 class="contact-section-title mt-4">{{ $t('thirdpartyprofile.technical_contacts')
                                        }}</h6>
                                    <div v-for="(cont, index) in technical_contact" :key="'technical-' + index"
                                        class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.contact_name')
                                                    }}</label>
                                                <input type="text" v-model="cont.name"
                                                    :placeholder="$t('thirdpartyprofile.name_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.phone') }}</label>
                                                <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')"
                                                    v-model="cont.phone" placeholder="Enter Phone Number"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.email') }}</label>
                                                <input type="email" v-model="cont.email"
                                                    :placeholder="$t('thirdpartyprofile.email_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button"
                                                    @click="addItem('technical_contact')" class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="technical_contact.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('technical_contact', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Cyber Security Contacts -->
                                    <h6 class="contact-section-title mt-4">{{
                                        $t('thirdpartyprofile.cyber_security_contacts') }}</h6>
                                    <div v-for="(cont, index) in cyber_contact" :key="'cyber-' + index"
                                        class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.contact_name')
                                                    }}</label>
                                                <input type="text" v-model="cont.name"
                                                    :placeholder="$t('thirdpartyprofile.name_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.phone') }}</label>
                                                <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')"
                                                    v-model="cont.phone" placeholder="Enter Phone Number"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.email') }}</label>
                                                <input type="email" v-model="cont.email"
                                                    :placeholder="$t('thirdpartyprofile.email_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button"
                                                    @click="addItem('cyber_contact')" class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="cyber_contact.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('cyber_contact', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Interested Entities -->
                            <div class="accordion-item">
                                <div class="accordion-header" @click="toggleSection('entities')">
                                    <span>{{ $t('thirdpartyprofile.interested_entities') }}</span>
                                    <svg :class="['chevron', { 'rotated': openSections.entities }]" width="20"
                                        height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div v-show="openSections.entities" class="accordion-content">
                                    <div v-for="(entity, index) in entities" :key="'entity-' + index"
                                        class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.entity') }}</label>
                                                <input type="text" v-model="entity.entity"
                                                    :placeholder="$t('thirdpartyprofile.entity_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.date') }}</label>
                                                <input type="date" v-model="entity.date" class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.involvement')
                                                    }}</label>
                                                <input type="text" v-model="entity.involvement"
                                                    :placeholder="$t('thirdpartyprofile.involvement_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button" @click="addItem('entities')"
                                                    class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="entities.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('entities', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
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
                                    <div v-for="(subsidiary, index) in subsidiaries" :key="'subsidiary-' + index"
                                        class="contact-row">
                                        <div class="row align-items-end">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.affiliation')
                                                    }}</label>
                                                <input type="text" v-model="subsidiary.affiliation"
                                                    :placeholder="$t('thirdpartyprofile.affiliation_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.date') }}</label>
                                                <input type="date" v-model="subsidiary.date" class="form-control" />
                                            </div>
                                            <div class="col-md-3 mb-2">
                                                <label class="form-label">{{ $t('thirdpartyprofile.involvement')
                                                    }}</label>
                                                <input type="text" v-model="subsidiary.involvement"
                                                    :placeholder="$t('thirdpartyprofile.involvement_placeholder')"
                                                    class="form-control" />
                                            </div>
                                            <div class="col-md-1 mb-2">
                                                <button v-if="index === 0" type="button"
                                                    @click="addItem('subsidiaries')" class="btn-add">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 5V15M5 10H15" stroke="white" stroke-width="2"
                                                            stroke-linecap="round" />
                                                    </svg>
                                                </button>
                                                <button v-if="subsidiaries.length > 1 && index !== 0" type="button"
                                                    @click="removeItem('subsidiaries', index)" class="btn-remove">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path
                                                            d="M7 3H13M3 5H17M15.5 5L15 16C15 16.5304 14.7893 17.0391 14.4142 17.4142C14.0391 17.7893 13.5304 18 13 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16L4.5 5"
                                                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
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
                        <button type="submit" class="btn btn-save" :disabled="loading">
                            {{ loading ? 'Saving...' : $t('thirdpartyprofile.submit') }}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</template>

<script>
import LazySelectField from "@/components/LazySelectField.vue";
import vSelect from "vue-select";

export default {
    name: "CreateProfileModal",
    components: {
        vSelect,
        LazySelectField
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        classifications: {
            type: Array,
            default: () => []
        },
        api: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            openSections: {
                general: true,
                contact: false,
                entities: false,
                subsidiaries: false
            },
            general_info: {
                third_party_name: "",
                owner: "",
                agreement: "",
                domain: "",
                contract_term: "",
                third_party_classification_id: "",
                date_of_incorporation: "",
                place_of_incorporation: "",
                head_office_location: "",
            },
            contact: [{ name: "", phone: "", email: "" }],
            business_contact: [{ name: "", phone: "", email: "" }],
            technical_contact: [{ name: "", phone: "", email: "" }],
            cyber_contact: [{ name: "", phone: "", email: "" }],
            entities: [{ entity: "", date: "", involvement: "" }],
            subsidiaries: [{ affiliation: "", date: "", involvement: "" }],
            loading: false,
        };
    },
    methods: {
        toggleSection(section) {
            this.openSections[section] = !this.openSections[section];
        },
        addItem(type) {
            if (type === "contact" || type === "business_contact" || type === "technical_contact" || type === "cyber_contact") {
                this[type].push({ name: "", phone: "", email: "" });
            } else if (type === "entities") {
                this[type].push({ entity: "", date: "", involvement: "" });
            } else if (type === "subsidiaries") {
                this[type].push({ affiliation: "", date: "", involvement: "" });
            }
        },
        removeItem(type, index) {
            this[type].splice(index, 1);
        },
        closeModal() {
            this.resetFields();
            this.$emit('close');
        },
        async submitForm() {
            this.loading = true;

            const profileData = {
                third_party_name: this.general_info.third_party_name,
                owner: this.general_info.owner,
                agreement: this.general_info.agreement,
                domain: this.general_info.domain,
                contract_term: this.general_info.contract_term,
                third_party_classification_id: this.general_info.third_party_classification_id,
                date_of_incorporation: this.general_info.date_of_incorporation,
                place_of_incorporation: this.general_info.place_of_incorporation,
                head_office_location: this.general_info.head_office_location,
                contact: this.contact,
                business_contact: this.business_contact,
                technical_contact: this.technical_contact,
                cyber_contact: this.cyber_contact,
                entities: this.entities,
                subsidiaries: this.subsidiaries,
            };

            try {
                const response = await this.api.insert(profileData);
                if (response.status == 'success') {
                    this.resetFields();
                    this.$emit('success', response);
                } else {
                    this.$emit('error', response);
                }
            } catch (error) {
                this.$emit('error', error);
            } finally {
                this.loading = false;
            }
        },
        resetFields() {
            this.openSections = {
                general: true,
                contact: false,
                entities: false,
                subsidiaries: false
            };
            this.general_info = {
                third_party_name: "",
                owner: "",
                agreement: "",
                domain: "",
                contract_term: "",
                third_party_classification_id: "",
                date_of_incorporation: "",
                place_of_incorporation: "",
                head_office_location: "",
            };
            this.contact = [{ name: "", phone: "", email: "" }];
            this.business_contact = [{ name: "", phone: "", email: "" }];
            this.technical_contact = [{ name: "", phone: "", email: "" }];
            this.cyber_contact = [{ name: "", phone: "", email: "" }];
            this.entities = [{ entity: "", date: "", involvement: "" }];
            this.subsidiaries = [{ affiliation: "", date: "", involvement: "" }];
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

/* Form Styles */
.form-label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.form-control {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    outline: none;
}

/* Contact Section Styles */
.contact-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
}

.contact-row {
    margin-bottom: 12px;
}

/* Button Styles */
.btn-add {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: none;
    background: #7c3aed;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 0;
}

.btn-add:hover {
    background: #6d28d9;
}

.btn-remove {
    display: flex;
    flex-direction: row;
    /* Flow: Horizontal */
    align-items: center;
    justify-content: center;
    width: 25px;
    /* Fixed width */
    height: 25px;
    /* Fixed height */
    border-radius: 6.25px;
    border: 1.25px solid #A92525;
    /* Visible border */
    background-color: #A92525;
    color: #FFFFFF;
    gap: 12.5px;
    /* Space between inner elements (if any icon + text) */
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    padding: 0;
}

.btn-remove:hover {
    background-color: #c73535;
    /* lighter hover color */
}

.btn-remove:active {
    transform: scale(0.95);
}



/* Modal Footer Buttons */
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
}

.modal-title {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0;
    color: #000000;
    text-transform: capitalize;
    /* Title Case */
    vertical-align: middle;
}

.modal-header {

    border-bottom: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
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

.btn-save {
    /* padding: 10px 24px;
    border-radius: 6px;
    border: none;
    background: #7c3aed;
    color: white;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s; */
}

.btn-save:hover:not(:disabled) {
    background: #6d28d9;
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row, [dir="rtl"] .form-control ,[dir="rtl"] .contact-section-title{
text-align: end;
}
[dir="rtl"] .accordion-header , [dir="rtl"] .modal-footer{
    flex-direction: row-reverse;
}
</style>