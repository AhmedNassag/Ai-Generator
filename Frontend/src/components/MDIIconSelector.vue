<template>
     <div class="mdi-icon-selector">
       
   
       <div class="search-section">
         <div class="search-controls">
           <div class="search-input-wrapper">
             <v-icon class="search-icon">mdi-magnify</v-icon>
             <input 
               type="text" 
               v-model="searchTerm" 
               placeholder="Search icons..."
               class="search-input"
             >
             <button v-if="searchTerm" @click="searchTerm = ''" class="clear-btn">
               <v-icon>mdi-close</v-icon>
             </button>
           </div>
   
           <select v-model="category" class="category-select">
             <option v-for="cat in categories" :key="cat.value" :value="cat.value">
               {{ cat.label }}
             </option>
           </select>
         </div>
   
         <div class="results-count">
           Showing {{ filteredIcons.length }} icon{{ filteredIcons.length !== 1 ? 's' : '' }}
         </div>
       </div>
   
       
   
       <div class="icons-grid-section">
         <div v-if="filteredIcons.length === 0" class="no-results">
           <v-icon size="80">mdi-emoticon-sad-outline</v-icon>
           <p>No icons found matching "{{ searchTerm }}"</p>
         </div>
   
         <div v-else class="icons-grid">
           <div 
             v-for="icon in filteredIcons" 
             :key="icon.name"
             @click="selectIcon(icon)"
             :class="['icon-item', { selected: selectedIcon?.name === icon.name }]"
             :title="'mdi-' + icon.name"
           >
             <v-icon size="36">mdi-{{ icon.name }}</v-icon>
             <span class="icon-name">{{ icon.name }}</span>
           </div>
         </div>
       </div>
   
       
     </div>
   </template>
   
   <script>
   export default {
     name: 'MDIIconSelector',
     data() {
       return {
         searchTerm: '',
         selectedIcon: null,
         isCopied: false,
         category: 'common',
         categories: [
           { value: 'all', label: 'All Icons' },
           { value: 'common', label: 'Common' },
           { value: 'action', label: 'Action' },
           { value: 'communication', label: 'Communication' },
           { value: 'content', label: 'Content' },
           { value: 'av', label: 'Audio/Video' },
           { value: 'device', label: 'Device' },
           { value: 'editor', label: 'Editor' },
           { value: 'image', label: 'Image' },
           { value: 'maps', label: 'Maps' },
           { value: 'social', label: 'Social' },
           { value: 'alert', label: 'Alert' },
           { value: 'toggle', label: 'Toggle' }
         ],
         iconCategories: {
           common: ['home', 'menu', 'close', 'check', 'delete', 'plus', 'minus', 'magnify', 'cog', 'dots-vertical', 'dots-horizontal', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down'],
           content: ['content-copy', 'content-cut', 'content-paste', 'content-save', 'folder', 'folder-open', 'file', 'file-document', 'paperclip', 'link', 'link-off', 'text-box', 'format-text'],
           communication: ['email', 'phone', 'message', 'chat', 'comment', 'forum', 'video', 'voicemail', 'contacts', 'at', 'send'],
           action: ['cart', 'heart', 'heart-outline', 'star', 'star-outline', 'thumb-up', 'thumb-down', 'bookmark', 'bookmark-outline', 'help-circle', 'information', 'lock', 'lock-open', 'eye', 'eye-off', 'refresh', 'download', 'upload'],
           alert: ['alert', 'alert-circle', 'alert-octagon', 'warning', 'error', 'check-circle', 'information-outline', 'bell', 'bell-outline'],
           av: ['play', 'pause', 'stop', 'skip-next', 'skip-previous', 'volume-high', 'volume-off', 'microphone', 'microphone-off', 'music', 'playlist-play'],
           device: ['laptop', 'cellphone', 'tablet', 'watch', 'monitor', 'keyboard', 'mouse', 'headphones', 'battery', 'wifi'],
           editor: ['format-bold', 'format-italic', 'format-underline', 'format-align-left', 'format-align-center', 'format-align-right', 'format-list-bulleted', 'format-list-numbered', 'undo', 'redo'],
           image: ['image', 'camera', 'camera-image', 'brush', 'palette', 'crop', 'rotate-right', 'blur', 'brightness-6'],
           maps: ['map', 'navigation', 'crosshairs-gps', 'map-marker', 'directions', 'pin', 'compass'],
           social: ['account', 'account-circle', 'account-multiple', 'human', 'account-plus', 'share', 'earth', 'account-group'],
           toggle: ['checkbox-marked', 'checkbox-blank-outline', 'radiobox-marked', 'radiobox-blank', 'toggle-switch', 'toggle-switch-off', 'star-check', 'circle-slice-8']
         }
       }
     },
     computed: {
       allIcons() {
         const icons = []
         Object.keys(this.iconCategories).forEach(cat => {
           this.iconCategories[cat].forEach(name => {
             icons.push({ name, category: cat })
           })
         })
         return icons
       },
       filteredIcons() {
         let filtered = this.allIcons
         
         if (this.category !== 'all') {
           filtered = filtered.filter(icon => icon.category === this.category)
         }
         
         if (this.searchTerm) {
           filtered = filtered.filter(icon => 
             icon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
           )
         }
         
         return filtered
       }
     },
     methods: {
       selectIcon(icon) {
         this.selectedIcon = icon
         this.isCopied = false
         this.$emit('icon-selected', `mdi-${icon.name}`)
       },
       async copyToClipboard() {
         const iconName = `mdi-${this.selectedIcon.name}`
         try {
           await navigator.clipboard.writeText(iconName)
           this.isCopied = true
           setTimeout(() => {
             this.isCopied = false
           }, 2000)
         } catch (err) {
           console.error('Failed to copy:', err)
         }
       }
     }
   }
   </script>
   
   <style scoped>
   /* .mdi-icon-selector {
     max-width: 1400px;
     margin: 0 auto;
     padding: 20px;
   } */
   
   .header {
     text-align: center;
     margin-bottom: 30px;
   }
   
   .header h1 {
     font-size: 2.5rem;
     margin-bottom: 10px;
     color: #333;
   }
   
   .header p {
     font-size: 1.1rem;
     color: #666;
   }
   
   .search-section {
     background: white;
     border-radius: 12px;
     padding: 25px;
     margin-bottom: 20px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
   }
   
   .search-controls {
     display: flex;
     gap: 15px;
     flex-wrap: wrap;
   }
   
   .search-input-wrapper {
     flex: 1;
     min-width: 250px;
     position: relative;
   }
   
   .search-input {
     width: 100%;
     padding: 12px 45px 12px 45px;
     border: 2px solid #e0e0e0;
     border-radius: 8px;
     font-size: 16px;
     transition: all 0.3s;
   }
   
   .search-input:focus {
     outline: none;
     border-color: #1976d2;
     box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
   }
   
   .search-icon {
     position: absolute;
     left: 15px;
     top: 50%;
     transform: translateY(-50%);
     color: #999;
   }
   
   .clear-btn {
     position: absolute;
     right: 15px;
     top: 50%;
     transform: translateY(-50%);
     background: none;
     border: none;
     cursor: pointer;
     color: #999;
     padding: 5px;
     display: flex;
     align-items: center;
   }
   
   .clear-btn:hover {
     color: #333;
   }
   
   .category-select {
     padding: 12px 15px;
     border: 2px solid #e0e0e0;
     border-radius: 8px;
     font-size: 16px;
     cursor: pointer;
     background: white;
     min-width: 150px;
     transition: all 0.3s;
   }
   
   .category-select:focus {
     outline: none;
     border-color: #1976d2;
     box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
   }
   
   .results-count {
     margin-top: 15px;
     color: #666;
     font-size: 14px;
   }
   
   .selected-icon-display {
     background: white;
     border-radius: 12px;
     padding: 25px;
     margin-bottom: 20px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
     display: flex;
     justify-content: space-between;
     align-items: center;
     flex-wrap: wrap;
     gap: 20px;
   }
   
   .selected-icon-info {
     display: flex;
     align-items: center;
     gap: 20px;
   }
   
   .selected-icon-preview {
     width: 70px;
     height: 70px;
     background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
     border-radius: 12px;
     display: flex;
     align-items: center;
     justify-content: center;
     color: white;
   }
   
   .selected-icon-details h3 {
     font-size: 1.3rem;
     color: #333;
     margin-bottom: 5px;
   }
   
   .selected-icon-details p {
     color: #666;
     text-transform: capitalize;
   }
   
   .copy-btn {
     padding: 12px 24px;
     background: #1976d2;
     color: white;
     border: none;
     border-radius: 8px;
     cursor: pointer;
     font-size: 16px;
     display: flex;
     align-items: center;
     gap: 8px;
     transition: all 0.3s;
   }
   
   .copy-btn:hover {
     background: #1565c0;
     transform: translateY(-2px);
     box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
   }
   
   .copy-btn.copied {
     background: #4caf50;
   }
   
   .icons-grid-section {
     /* background: white;
     border-radius: 12px;
     padding: 25px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.1); */
     overflow-y:scroll;
     height:18.75rem

   }
   
   .icons-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
     gap: 12px;
   }
   
   .icon-item {
     /* aspect-ratio: 1; */
     background: #f8f9fa;
     border: 2px solid transparent;
     border-radius: 10px;
     padding: 15px;
     cursor: pointer;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     transition: all 0.2s;
   }
   
   .icon-item:hover {
     background: #e3f2fd;
     transform: scale(1.05);
     border-color: #1976d2;
   }
   
   .icon-item.selected {
     background: #e3f2fd;
     border-color: #1976d2;
     box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
   }
   
   .icon-item:hover :deep(.v-icon) {
     color: #1976d2 !important;
   }
   
   .icon-name {
     font-size: 11px;
     color: #666;
     text-align: center;
     word-break: break-all;
     line-height: 1.3;
     margin-top: 8px;
   }
   
   .no-results {
     text-align: center;
     padding: 60px 20px;
     color: #999;
   }
   
   .no-results :deep(.v-icon) {
     opacity: 0.3;
     margin-bottom: 20px;
   }
   
   .no-results p {
     font-size: 1.2rem;
   }
   
   .footer-info {
     background: white;
     border-radius: 12px;
     padding: 20px;
     margin-top: 20px;
     text-align: center;
     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
   }
   
   .footer-info p {
     color: #666;
     line-height: 1.6;
     margin-bottom: 10px;
   }
   
   .footer-info a {
     color: #1976d2;
     text-decoration: none;
     font-weight: 600;
   }
   
   .footer-info a:hover {
     text-decoration: underline;
   }
   
   @media (max-width: 768px) {
     .header h1 {
       font-size: 2rem;
     }
   
     .icons-grid {
       grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
       gap: 8px;
     }
   
     .selected-icon-display {
       flex-direction: column;
       align-items: flex-start;
     }
   }
   </style>