<template>
    <div :class="colClass">
        <div class="card " :class="cardClass">
            <div class="card-header " :class="cardhaderClass">
                <h3 class="mb-0" :class="titleClass"><i v-if="icon" :class="iconClass"></i>{{ title }}
                </h3>
                <h5 class="txt-light" v-if="head">{{ heading }}</h5>
                <p :class="pre" v-html="props.desc"></p><code v-if="codeClass">{{ codeClass }}</code>
                <div v-if="pres" v-html="descClass"></div><span v-if="span" v-html="spanClass"></span>
            </div>
            <div class="card-body" :class="cardbodyClass">
                <slot />
            </div>
            <slot name="light-box" />
            <div class="card-footer" :class="footerClass" v-if="footer">
                <div class="table-responsive theme-scrollbar" v-if="table">
                    <table class="w-100">
                        <tbody>
                            <tr>
                                <th> Class</th>
                                <th>Value of the class</th>
                            </tr>
                            <tr>
                                <td><code>{{ content }}</code></td>
                                <td>{{ startClass }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h6 class="mb-0" v-if="con">{{ footerTitle }}</h6>
                <h3 class="mb-0 text-end" v-if="element">Cion Theme</h3>
                <div v-if="buttons">
                    <button class="btn  m-r-15" :class="submitClass" type="submit">Submit</button>
                    <button class="btn " :class="cancelClass" type="submit">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
let props = defineProps({
    title: String,
    cardClass: String,
    colClass: String,
    cardbodyClass: String,
    cardhaderClass: String,
    desc: String,
    pre: String,
    codeClass: String,
    footer: String,
    content: String,
    startClass: String,
    descClass: String,
    pres: String,
    spanClass: String,
    span: String,
    icon: String,
    table: String,
    footerClass: String,
    footerTitle: String,
    titleClass: String,
    element: String,
    con: String,
    head: String,
    heading: String,
    iconClass: String,
    buttons: String,
    submitClass: String,
    cancelClass: String
})
</script>