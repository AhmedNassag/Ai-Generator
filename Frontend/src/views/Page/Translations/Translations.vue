<template>
  <div>
    <!-- Start page header -->
    <!-- <div class="page-header">
      <div>
        <h2 class="main-content-title tx-24 mg-b-5">
          {{ $t("translate.translate") }}
        </h2>
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">{{ $t("site.main") }}</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ $t("settings.settings") }}
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ $t("translate.translate") }}
          </li>
        </ol>
      </div>
    </div> -->
    <!-- End page header -->

    <!-- Row -->
    <div class="row sidemenu-height">
      <div class="col-lg-12">
        <div class="card custom-card">
          <div class="card-body">
            <div class="panel panel-primary tabs-style-2">
              <div class="tab-menu-heading">
                <div class="tabs-menu1">
                  <!-- Tabs -->
                  <ul class="nav panel-tabs main-nav-line" role="tablist">
                    <li>
                      <a
                        href="javascript:;"
                        class="nav-link mt-1"
                        :class="tab == 0 ? 'active' : ''"
                        @click="tab = 0"
                        >{{ $t("site.records") }}</a
                      >
                    </li>
                    <li>
                      <a
                        href="javascript:;"
                        class="nav-link mt-1"
                        :class="tab == 1 ? 'active' : ''"
                        @click="
                          newItem = {};
                          tab = 1;
                        "
                        >{{ $t("site.add") }}</a
                      >
                    </li>
                  </ul>
                </div>
              </div>
              <div
                class="panel-body tabs-menu-body main-content-body-right border"
              >
                <div class="tab-content">
                  <div class="tab-pane active show" id="tab4" role="tabpanel">
                    <DataTable v-if="tab==0"
                      ref="table"
                      id="example-table"
                      :tableClass="'table table-striped table-bordered'"
                      :columns="tableColumns"
                      :api="api"
                      :apiParams="{}"
                      :editItem="editItem"
                      :openForm="openForm"
                      :type="type"
                    >
                      <!-- Customizing the display of the 'Name' column in the table -->
                      <template #color.hexcode="{ item }">
                        <input
                          class="rounded-3"
                          type="color"
                          :value="item.hexcolor"
                          disabled
                        />
                      </template>
                    </DataTable>
                    <Form :newItem="newItem" v-else></Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- End Row -->
  </div>
</template>

<script>
import DataTable from "@/components/DataTable.vue";
import translate from "@/API/Translations/Translations";
import Form from "@/views/Page/Translations/components/Form.vue";
import Auth from "@/API/Auth";

export default {
  name: "HomeView",
  components: {
    DataTable,
    Form,
  },
  setup() {
    const api = new translate();
    const fields = [];
    const fromFields = [];
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const language = Auth.LANGUAGE;
    // console.log(language);
    return {
      api,
      fields,
      fromFields,
      apiParams,
      language,
    };
  },
  data() {
    return {
      tab: 0,
      newItem: {},
      newData: {},
    };
  },
  created() {
    this.fields = [
      {
        key: "name",
        label: this.$t("site.name"),
        sortable: true,
      },
    ];

    this.fromFields = [
      {
        type: "text",
        name: "name",
        label: this.$t("site.name"),
        col: 6,
        rules: "required",
      },
      {
        type: "translate",
        name: "translate",
        label: this.$t("translate.translate"),
        col: 6,
        rules: "required",
      },

      // {
      //   type: "options",
      //   name: "options",
      //   label: this.$t("translate.options"),
      //   options:['a','s'],
      //   col: 6,
      //   rules: "required",
      // },
    ];
  },
  methods: {
    editItem(data) {
      this.newItem = data;
      this.tab = 1;
    },
  },
};
</script>

<style></style>
