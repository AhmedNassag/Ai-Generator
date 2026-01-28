<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('thirdpartyprofile.risk_mgmt')"
    :mainSubPage="$t('thirdpartyprofile.third_party')" :subPage="$t('thirdpartyprofile.profiles')"
    :titlePage="$t('thirdpartyprofile.profiles')" v-permission:show>

    <div v-permission:edit v-permission:delete></div>
    <template #datatable>
      <DataTable ref="table" v-permission:show v-permission:insert id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <template #Name="{ item }"> {{ item.third_party_name }} </template>
        <template #classification="{ item }"> {{ item.classification?.name }} </template>

        <template #created_at="{ item }"> {{ formatDate(item.created_at) }} </template>

        <template #addAction="{ item }">
          <li v-permission:viewProfile>
            <a @click="openModal(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="icofont icofont-eye me-2"></i> {{ $t('thirdpartyprofile.view') }}
            </a>
          </li>
        </template>

      </DataTable>

    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <!-- create -->
  <div v-if="showModal" class="modal d-block modal-fade">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('thirdpartyprofile.create_third_party_profile') }}</h5>
          <button type="button" class="btn-close" @click="closeCreateModal()"></button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="accordion" id="thirdPartyAccordion">

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse"
                    data-bs-target="#generalInfo">
                    {{ $t('thirdpartyprofile.general_information') }}
                  </button>
                </h2>
                <div id="generalInfo" class="accordion-collapse collapse show" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div class="row">
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.third_party_name') }}</label>
                        <input type="text" required v-model="general_info.third_party_name"
                          :placeholder="$t('thirdpartyprofile.third_party_name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.owner_ceo') }}</label>
                        <input type="text" v-model="general_info.owner"
                          :placeholder="$t('thirdpartyprofile.owner_ceo_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.domain') }}</label>
                        <input type="text" v-model="general_info.domain"
                          :placeholder="$t('thirdpartyprofile.domain_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.agreement') }}</label>

                        <input type="text" v-model="general_info.agreement"
                          :placeholder="$t('thirdpartyprofile.agreement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.contract_term') }}</label>

                        <input type="number" v-model="general_info.contract_term"
                          :placeholder="$t('thirdpartyprofile.contract_term_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.classification') }}</label>

                        <v-select id="classifications" v-model="general_info.third_party_classification_id"
                          :options="classifications" :placeholder="$t('thirdpartyprofile.select_classification')"
                          :reduce="option => option.id" label="name" clearable></v-select>

                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.date_of_incorporation') }}</label>

                        <input type="date" v-model="general_info.date_of_incorporation" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.place_of_incorporation') }}</label>

                        <textarea v-model="general_info.place_of_incorporation"
                          :placeholder="$t('thirdpartyprofile.place_of_incorporation_placeholder')"
                          class="form-control"></textarea>
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.head_office_location') }}</label>

                        <textarea v-model="general_info.head_office_location"
                          :placeholder="$t('thirdpartyprofile.head_office_location_placeholder')"
                          class="form-control"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#contactList">
                    {{ $t('thirdpartyprofile.contact_list') }}
                  </button>
                </h2>
                <div id="contactList" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <label>{{ $t('thirdpartyprofile.contacts') }}</label>
                    <div v-for="(cont, index) in contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>

                        <input type="text" v-model="cont.name" :placeholder="$t('thirdpartyprofile.name_placeholder')"
                          class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')" v-model="cont.phone"
                          class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="cont.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.business_contacts') }}</label>
                    <div v-for="(contact, index) in business_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>
                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('business_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="business_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('business_contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.technical_contacts') }}</label>
                    <div v-for="(contact, index) in technical_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>

                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>

                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('technical_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="technical_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('technical_contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.cyber_security_contacts') }}</label>
                    <div v-for="(contact, index) in cyber_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>
                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>

                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('cyber_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="cyber_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('cyber_contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>


                  </div>
                </div>
              </div>


              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#interestedEntities">
                    {{ $t('thirdpartyprofile.interested_entities') }}
                  </button>
                </h2>
                <div id="interestedEntities" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div v-for="(entity, index) in entities" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.entity') }}</label>

                        <input type="text" v-model="entity.entity"
                          :placeholder="$t('thirdpartyprofile.entity_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.date') }}</label>
                        <input type="date" v-model="entity.date" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.involvement') }}</label>

                        <input type="text" v-model="entity.involvement"
                          :placeholder="$t('thirdpartyprofile.involvement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('entities')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="entities.length > 1 && index !== 0" type="button"
                          @click="removeItem('entities', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#subsidiaries">
                    {{ $t('thirdpartyprofile.subsidiaries') }}
                  </button>
                </h2>
                <div id="subsidiaries" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div v-for="(subsidiary, index) in subsidiaries" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.affiliation') }}</label>
                        <input type="text" v-model="subsidiary.affiliation"
                          :placeholder="$t('thirdpartyprofile.affiliation_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.date') }}</label>
                        <input type="date" v-model="subsidiary.date" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.involvement') }}</label>
                        <input type="text" v-model="subsidiary.involvement"
                          :placeholder="$t('thirdpartyprofile.involvement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItem('subsidiaries')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="subsidiaries.length > 1 && index !== 0" type="button"
                          @click="removeItem('subsidiaries', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal()">{{
              $t('thirdpartyprofile.cancel')
            }}</button>
            <button type="submit" class="btn btn-success">{{ $t('thirdpartyprofile.submit') }}</button>
          </div>
        </form>

      </div>
    </div>
  </div>


  <!-- edit  -->
  <div v-if="showEditModal" class="modal d-block modal-fade">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('thirdpartyprofile.edit_third_party_profile') }}</h5>
          <button type="button" class="btn-close" @click="showEditModal = false"></button>
        </div>

        <form @submit.prevent="submitEditForm(editableProfile.id)">
          <div class="modal-body">
            <div class="accordion" id="thirdPartyAccordion">

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse"
                    data-bs-target="#generalInfo">
                    {{ $t('thirdpartyprofile.general_information') }}
                  </button>
                </h2>
                <div id="generalInfo" class="accordion-collapse collapse show" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div class="row">
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.third_party_name') }}</label>
                        <input type="text" v-model="editableProfile.third_party_name"
                          :placeholder="$t('thirdpartyprofile.third_party_name_placeholder')" class="form-control"
                          required />
                      </div>
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.owner_ceo') }}</label>
                        <input type="text" v-model="editableProfile.owner"
                          :placeholder="$t('thirdpartyprofile.owner_ceo_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4 mb-2">
                        <label>{{ $t('thirdpartyprofile.domain') }}</label>
                        <input type="text" v-model="editableProfile.domain"
                          :placeholder="$t('thirdpartyprofile.domain')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.agreement') }}</label>

                        <input type="text" v-model="editableProfile.agreement"
                          :placeholder="$t('thirdpartyprofile.agreement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.contract_term') }}</label>

                        <input type="number" v-model="editableProfile.contract_term"
                          :placeholder="$t('thirdpartyprofile.contract_term_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.classification') }}</label>
                        <v-select id="classifications" v-model="editableProfile.third_party_classification_id"
                          :options="classifications" :placeholder="$t('thirdpartyprofile.select_classification')"
                          :reduce="option => option.id" label="name" clearable></v-select>

                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.date_of_incorporation') }}</label>

                        <input type="date" v-model="editableProfile.date_of_incorporation" class="form-control" />
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.place_of_incorporation') }}</label>

                        <textarea v-model="editableProfile.place_of_incorporation"
                          :placeholder="$t('thirdpartyprofile.place_of_incorporation_placeholder')"
                          class="form-control"></textarea>
                      </div>
                      <div class="col-md-6 mb-2">
                        <label>{{ $t('thirdpartyprofile.head_office_location') }}</label>

                        <textarea v-model="editableProfile.head_office_location"
                          :placeholder="$t('thirdpartyprofile.head_office_location_placeholder')"
                          class="form-control"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#contactList">
                    {{ $t('thirdpartyprofile.contact_list') }}
                  </button>
                </h2>
                <div id="contactList" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <label>{{ $t('thirdpartyprofile.contacts') }}</label>
                    <div v-for="(cont, index) in editableContacts" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>

                        <input type="text" v-model="cont.name" :placeholder="$t('thirdpartyprofile.name_placeholder')"
                          class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="cont.phone = cont.phone.replace(/\D/g, '')" v-model="cont.phone"
                          class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="cont.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('editableContacts')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editableContacts.length > 1 && index !== 0" type="button"
                          @click="removeItem('editableContacts', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.business_contacts') }}</label>
                    <div v-for="(contact, index) in editablebusiness_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>
                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('editablebusiness_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editablebusiness_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('editablebusiness_contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.technical_contacts') }}</label>
                    <div v-for="(contact, index) in editabletechnical_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>

                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>

                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>
                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('editabletechnical_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editabletechnical_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('editabletechnical_contact', index)"
                          class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>

                    <label>{{ $t('thirdpartyprofile.cyber_security_contacts') }}</label>
                    <div v-for="(contact, index) in editablecyber_contact" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.contact_name') }}</label>
                        <input type="text" v-model="contact.name"
                          :placeholder="$t('thirdpartyprofile.name_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.phone') }}</label>
                        <input type="tel" @input="contact.phone = contact.phone.replace(/\D/g, '')"
                          v-model="contact.phone" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.email') }}</label>

                        <input type="email" v-model="contact.email"
                          :placeholder="$t('thirdpartyprofile.email_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('editablecyber_contact')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editablecyber_contact.length > 1 && index !== 0" type="button"
                          @click="removeItem('editablecyber_contact', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                    <hr>


                  </div>
                </div>
              </div>


              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#interestedEntities">
                    {{ $t('thirdpartyprofile.interested_entities') }}
                  </button>
                </h2>
                <div id="interestedEntities" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div v-for="(entity, index) in editableProfile.entities" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.entity') }}</label>

                        <input type="text" v-model="entity.entity"
                          :placeholder="$t('thirdpartyprofile.entity_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.date') }}</label>
                        <input type="date" v-model="entity.date" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.involvement') }}</label>

                        <input type="text" v-model="entity.involvement"
                          :placeholder="$t('thirdpartyprofile.involvement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('entities')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editableProfile.entities.length > 1 && index !== 0" type="button"
                          @click="removeItemInEdit('entities', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#subsidiaries">
                    {{ $t('thirdpartyprofile.subsidiaries') }}
                  </button>
                </h2>
                <div id="subsidiaries" class="accordion-collapse collapse" data-bs-parent="#thirdPartyAccordion">
                  <div class="accordion-body">
                    <div v-for="(subsidiary, index) in editableProfile.subsidiaries" :key="index" class="row mb-2">
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.affiliation') }}</label>
                        <input type="text" v-model="subsidiary.affiliation"
                          :placeholder="$t('thirdpartyprofile.affiliation_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label>{{ $t('thirdpartyprofile.date') }}</label>
                        <input type="date" v-model="subsidiary.date" class="form-control" />
                      </div>
                      <div class="col-md-3">
                        <label>{{ $t('thirdpartyprofile.involvement') }}</label>
                        <input type="text" v-model="subsidiary.involvement"
                          :placeholder="$t('thirdpartyprofile.involvement_placeholder')" class="form-control" />
                      </div>
                      <div class="col-md-1">
                        <button v-if="index === 0" type="button" @click="addItemInEdit('subsidiaries')"
                          class="btn btn-sm mt-2">➕</button>
                        <button v-if="editableProfile.subsidiaries.length > 1 && index !== 0" type="button"
                          @click="removeItemInEdit('subsidiaries', index)" class="btn btn-sm mt-2 ms-1">➖</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">{{
              $t('thirdpartyprofile.cancel') }}</button>
            <button type="submit" class="btn btn-success">{{ $t('thirdpartyprofile.update') }}</button>
          </div>
        </form>

      </div>
    </div>
  </div>



  <!-- View request modal -->
  <v-dialog v-model="viewProfileModal" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t('thirdpartyprofile.view_request') }}</h1>
        <v-btn icon @click="viewProfileModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-expansion-panels multiple v-model="expandedPanels">
          <!-- General Information Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-info">
              {{ $t('thirdpartyprofile.general_information') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.third_party_name') }}:</b> {{ viewProfileData.third_party_name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.owner_ceo') }}:</b> {{ viewProfileData.owner }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.domain') }}:</b> {{ viewProfileData.domain }}</p>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.agreement') }}:</b> {{ viewProfileData.agreement }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.contract_term') }}:</b> {{ viewProfileData.contract_term }}</p>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <v-row>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.classification') }}:</b> {{ viewProfileData.classification.name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.head_office_location') }}:</b> {{ viewProfileData.head_office_location
                  }}
                  </p>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <v-row>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.place_of_incorporation') }}:</b> {{
                    viewProfileData.place_of_incorporation }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.date_of_incorporation') }}:</b> {{
                    viewProfileData.date_of_incorporation
                  }}</p>
                </v-col>
              </v-row>

            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Contact List Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-info">
              {{ $t('thirdpartyprofile.contact_list') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <h4 class=" my-2">{{ $t('thirdpartyprofile.contact') }}</h4>
              <v-row v-for="contact in viewProfileData.normal_contacts" :key="contact.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.contact_name') }}:</b> {{ contact.name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.phone') }}:</b> {{ contact.phone }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.email') }}:</b> {{ contact.email }}</p>
                </v-col>
              </v-row>
              <v-divider></v-divider>

              <h4 class=" my-2">{{ $t('thirdpartyprofile.business_contact') }}</h4>
              <v-row v-for="contact in viewProfileData.business_contacts" :key="contact.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.contact_name') }}:</b> {{ contact.name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.phone') }}:</b> {{ contact.phone }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.email') }}:</b> {{ contact.email }}</p>
                </v-col>
              </v-row>
              <v-divider></v-divider>

              <h4 class=" my-2">{{ $t('thirdpartyprofile.technical_contact') }}</h4>
              <v-row v-for="contact in viewProfileData.technical_contacts" :key="contact.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.contact_name') }}:</b> {{ contact.name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.phone') }}:</b> {{ contact.phone }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.email') }}:</b> {{ contact.email }}</p>
                </v-col>
              </v-row>
              <v-divider></v-divider>

              <h4 class=" my-2">{{ $t('thirdpartyprofile.cyber_contact') }}</h4>
              <v-row v-for="contact in viewProfileData.cyber_contacts" :key="contact.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.contact_name') }}:</b> {{ contact.name }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.phone') }}:</b> {{ contact.phone }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.email') }}:</b> {{ contact.email }}</p>
                </v-col>
              </v-row>

            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Interested Entities Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-info">
              {{ $t('thirdpartyprofile.interested_entities') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row v-for="entity in viewProfileData.entities" :key="entity.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.entity') }}:</b> {{ entity.entity }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.date') }}:</b> {{ entity.date }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.involvement') }}:</b> {{ entity.involvement }}</p>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Subsidiaries Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-info">
              {{ $t('thirdpartyprofile.subsidiaries') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row v-for="subsidiary in viewProfileData.subsidiaries" :key="subsidiary.id">
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.affiliation') }}:</b> {{ subsidiary.affiliation }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.date') }}:</b> {{ subsidiary.date }}</p>
                </v-col>
                <v-col>
                  <p><b>{{ $t('thirdpartyprofile.involvement') }}:</b> {{ subsidiary.involvement }}</p>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" size="large" rounded="lg" class="text-white mr-2 bg-info"
          @click="viewProfileModal = false">
          {{ $t('thirdpartyprofile.close') }}
        </v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
// Importing necessary components and API modules
import thirdpartyprofile from "@/API/ThirdPartyProfile/ThirdPartyProfile";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { ref } from "vue";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect
  },

  setup() {
    // Initialize API and other required properties
    const api = new thirdpartyprofile();
    const apiParams = {
      with: ["normalContacts", "businessContacts", "technicalContacts", "cyberContacts", "entities", "subsidiaries", "classification"],
    };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields
    };
  },

  async mounted() {
    this.loadClassifications();
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      showModal: false,
      showEditModal: false,
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
      successMessage: "",
      errorMessage: "",
      classifications: [],

      editableProfile: {},
      editableContacts: [],
      editablebusiness_contact: [],
      editabletechnical_contact: [],
      editablecyber_contact: [],

      viewProfileModal: false,
      viewProfileData: null,
      expandedPanels: [0],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "Name", title: this.$t("thirdpartyprofile.name"), data: "third_party_name", defaultContent: "N/A" },
      { title: this.$t("thirdpartyprofile.owner"), data: "owner", defaultContent: "N/A" },
      { id: "classification", title: this.$t("thirdpartyprofile.classification"), data: "classification.name", defaultContent: "N/A" },
      { title: this.$t("thirdpartyprofile.contract_term"), data: "contract_term", defaultContent: "N/A" },
      { id: "created_at", title: this.$t("thirdpartyprofile.created_at"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartyprofile.thirdpartyprofilename"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("thirdpartyprofile.name_description"),
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("thirdpartyprofile.thirdpartyprofileemail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: this.$t("thirdpartyprofile.email_description"),
        col: 6,
      },
      {
        type: "options",  // Dropdown/select field
        name: "myOptions",
        label: this.$t("thirdpartyprofile.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("thirdpartyprofile.options_description"),
      },
      {
        name: "terms",
        label: this.$t("thirdpartyprofile.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t("thirdpartyprofile.terms_description"),
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartyprofile.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: this.$t("thirdpartyprofile.description_description"),
        col: 12,
      },
    ];
  },

  methods: {
    formatDate(date) {
      if (!date) return "N/A";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));
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

    addItemInEdit(type) {
      if (type === "editableContacts" || type === "editablebusiness_contact" || type === "editabletechnical_contact" || type === "editablecyber_contact") {
        this[type].push({ name: "", phone: "", email: "" });
      } else if (type === "entities") {
        this.editableProfile.entities.push({ entity: "", date: "", involvement: "" });
      } else if (type === "subsidiaries") {
        this.editableProfile.subsidiaries.push({ affiliation: "", date: "", involvement: "" });
      }
    },

    // Load classifications using API class
    async loadClassifications() {
      try {
        this.classifications = await this.api.getClassifications();
      } catch (error) {
        console.error('Error loading classifications:', error);
        this.api.poup({ status: false, message: error.message }, this.$t("user.Error"));
      }
    },

    removeItem(type, index) {
      this[type].splice(index, 1);
    },

    removeItemInEdit(type, index) {
      if (type === "entities") {
        this.editableProfile.entities.splice(index, 1);
      } else if (type === "subsidiaries") {
        this.editableProfile.subsidiaries.splice(index, 1);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.showModal = true;
    },

    closeCreateModal() {
      this.showModal = false;
      this.emptyFields();
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.getProfileData(data.id);
      this.showEditModal = true;
    },

    // Get profile data using API class
    async getProfileData(id) {
      try {
        const response = await this.api.getProfileData(id);
        this.editableProfile = response;

        this.editableContacts = this.editableProfile.contacts.filter(contact => contact.type === 1);
        this.editablebusiness_contact = this.editableProfile.contacts.filter(contact => contact.type === 2);
        this.editabletechnical_contact = this.editableProfile.contacts.filter(contact => contact.type === 3);
        this.editablecyber_contact = this.editableProfile.contacts.filter(contact => contact.type === 4);
      } catch (error) {
        console.error('Error loading profile data:', error);
        this.api.poup({ status: false, message: error.message }, this.$t("user.Error"));
      }
    },

    // Submit form using API class
    async submitForm() {
      this.loading = true;
      this.successMessage = "";
      this.errorMessage = "";

      const profileData = {
        // general info
        third_party_name: this.general_info.third_party_name,
        owner: this.general_info.owner,
        agreement: this.general_info.agreement,
        domain: this.general_info.domain,
        contract_term: this.general_info.contract_term,
        third_party_classification_id: this.general_info.third_party_classification_id,
        date_of_incorporation: this.general_info.date_of_incorporation,
        place_of_incorporation: this.general_info.place_of_incorporation,
        head_office_location: this.general_info.head_office_location,

        // contacts
        contact: this.contact,
        business_contact: this.business_contact,
        technical_contact: this.technical_contact,
        cyber_contact: this.cyber_contact,
        entities: this.entities,
        subsidiaries: this.subsidiaries,
      };

      try {
        const response = await this.api.createProfile(profileData);
        this.showModal = false;
        this.$refs.table.refreshTable();
        this.emptyFields();
        this.api.poup(response, this.$t("thirdpartyprofile.added_successfully"));
      } catch (error) {
        this.api.poup({ status: false, message: error.message }, this.$t("user.Error"));
      } finally {
        this.loading = false;
      }
    },

    // Submit edit form using API class
    async submitEditForm(id) {
      this.loading = true;

      const profileData = {
        // general info
        third_party_name: this.editableProfile.third_party_name,
        owner: this.editableProfile.owner,
        agreement: this.editableProfile.agreement,
        domain: this.editableProfile.domain,
        contract_term: this.editableProfile.contract_term,
        third_party_classification_id: this.editableProfile.third_party_classification_id,
        date_of_incorporation: this.editableProfile.date_of_incorporation,
        place_of_incorporation: this.editableProfile.place_of_incorporation,
        head_office_location: this.editableProfile.head_office_location,

        // contacts
        contact: this.editableContacts,
        business_contact: this.editablebusiness_contact,
        technical_contact: this.editabletechnical_contact,
        cyber_contact: this.editablecyber_contact,
        entities: this.editableProfile.entities,
        subsidiaries: this.editableProfile.subsidiaries,
      };

      try {
        const response = await this.api.updateProfile(id, profileData);
        this.showEditModal = false;
        this.$refs.table.refreshTable();
        this.api.poup(response, this.$t("thirdpartyprofile.updated_successfully"));
      } catch (error) {
        console.error('Error updating profile:', error);
        this.api.poup({ status: false, message: error.message }, this.$t("user.Error"));
      } finally {
        this.loading = false;
      }
    },

    emptyFields() {
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
    },

    openModal(selectedRow) {
      this.viewProfileData = { ...selectedRow };
      this.viewProfileModal = true;
      console.log("this.viewProfileData", this.viewProfileData);
    },
  },
};
</script>

<style scoped>

.v-expansion-panel {
  background-color: transparent !important;
  color: black !important;
}

.v-expansion-panel-text {
  border-left: 0px solid #cccccc !important;
}

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
</style>