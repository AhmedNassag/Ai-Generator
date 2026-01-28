<template>
     <div>
          <div class="imagePreviewWrapper" :style="{ 'background-image': `url(${previewImage})` }" @click="selectImage">
          </div>

          <div class="col-sm-12 col-md-12 col-lg-12">
               <div class="input-group file-browser"> <input type="text" class="form-control border-end-0 browse-file"
                         placeholder="choose" readonly=""> <label class="input-group-btn"> <span class="btn btn-primary">
                              Browse <input ref="fileInput" type="file" @input="pickFile" style="display: none;"> </span>
                    </label> </div>
          </div>
     </div>
</template>
   
<script>
export default {
     data() {
          return {
               previewImage: null
          };
     },
     methods: {
          selectImage() {
               this.$refs.fileInput.click()
          },
          pickFile() {
               let input = this.$refs.fileInput
               let file = input.files
               if (file && file[0]) {
                    let reader = new FileReader
                    reader.onload = e => {
                         this.previewImage = e.target.result
                    }
                    reader.readAsDataURL(file[0])
                    this.$emit('input', file[0])
               }
          }
     }
}
</script>
   
<style scoped lang="scss">
.imagePreviewWrapper {
     width: 250px;
     height: 250px;
     display: block;
     cursor: pointer;
     margin: 0 auto 30px;
     background-size: cover;
     background-position: center center;
}
</style>