<template>
  <div class="row row-sm">
    <div class="col-lg-12 col-md-12">
      <div class="card custom-card">
        <div class="card-body">
          <div class="row row-sm">
            <div class="col-lg-12">
              <div class="form-group">
                <label for="name">Name</label>

                <input
                  class="form-control"
                  required=""
                  type="text"
                  v-model="newItem.name"
                />
              </div>
            </div>
            <table class="table" v-if="!load">
              <thead>
                <tr>
                  <th scope="col">{{ $t("i18n.key") }}</th>
                  <th scope="col" v-for="lang in language" :key="lang">
                    {{ lang }}
                  </th>

                  <th scope="col">{{ $t("site.delete") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <input class="form-control" v-model="newData.key" />
                  </th>
                  <td v-for="lang in language" :key="lang">
                    <input class="form-control" v-model="newData[lang]" />
                  </td>

                  <td>
                    <button
                      class="btn ripple btn-outline-primary btn-icon mr-2"
                      @click="add(newData)"
                    >
                      <i class="si si-plus"></i>
                    </button>
                  </td>
                </tr>
                <tr v-for="(value, key, index) in newItem.en" :key="index">
                  <th scope="row">
                    {{ Object.keys(value)[0] }}
                  </th>

                  <td v-for="lang in language" :key="lang">
                    <input
                      class="form-control"
                      type="text"
                      v-model="newItem[lang][key][Object.keys(value)[0]]"
                    />
                  </td>
                  <td>
                    <button
                      class="btn ripple btn-outline-danger btn-icon mr-2"
                      @click="deleteItem(index)"
                    >
                      <i class="si si-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <div class="row">
            <div class="col-6">
              <button
                class="btn ripple btn-primary col-12"
                variant="primary"
                :disabled="!newItem.ar"
                @click="submit()"
              >
                <i class="fa fa-plus" /> {{ $t("site.save") }}
              </button>
            </div>
            <div class="col-6">
              <button
                class="btn ripple btn-warning col-12"
                @click="goToTable()"
                variant="success"
              >
                <i class="fa fa-ban"></i> {{ $t("site.cancel") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from "@/API/Auth";
import Translate from "@/API/Translations/Translations";
export default {
  props: {
    newItem: Object,
  },
  components: {
    Form,
  },
  setup() {
    const api = new Translate();
    const translate = {};
    const language = Auth.LANGUAGE.map((a) => a.code);
    console.log(language);
    return {
      api,
      translate,
      language,
    };
  },
  // setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      load: false,
      file: {},
      invalid: {},
      errors: [],

      newData: {},
      value: [],
      ids: {},
    };
  },
  async created() {
    this.load = true;

    // this.translate=;

    //   this.language.forEach((element) => {
    //   this.translate[element] =this.newItem[element];
    // });
    //     console.log("ind",this.translate);
    this.load = false;
  },
  methods: {
    async goToTable() {
      console.log(this.$parent);
      this.$parent.tab = 0;
      this.newItem = {};
    },
    async submit() {
      // console.log(this.newItem);
      const ret = await this.api.from(this.newItem, false, false);

      this.goToTable();
      //  if (ret.data.errors) {
      //    this.errors = ret.data.errors;
      //    console.log("in", this.errors);
      //  } else this.goToTable();
    },
    add() {
      // if (!this.newItem.data) this.newItem.data = [];
      console.log(this.newData);
      let trKey = "";
      this.language.forEach((lang) => {
        if (!this.newItem[lang]) {
          this.newItem[lang] = [];
        }
        this.newItem[lang].push({ [this.newData.key]: this.newData[lang] });
      });

      this.newData = {};
    },
    deleteItem(index) {
      this.language.forEach((lang) => {
        this.newItem[lang].splice(index, 1);
      });
    },
  },
};
</script>

<style>
</style>
