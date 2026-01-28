import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { onMounted, onUnmounted } from 'vue';
import Menu from "@/core/data/menu.json";
import { useI18n } from 'vue-i18n';
import menu from "@/types/menu"

interface searchdatas {
    icon1: string,
    icon2: string,
    path: string,
    title: string
}

interface search {
    icon1: string,
    icon2: string,
    path: string,
    title: string,
    bookmark: string
}

export const useMenuStore = defineStore("menu", () => {
    const { t, locale } = useI18n();
    
    const data1 = ref(Menu.data);

    // Helper function to translate menu items recursively
    function translateMenuItem(item: any): any {
        const translatedItem = { ...item };
        
        // Translate title if it exists
        if (item.title) {
            // Try to find translation in menu.{title} format
            const translationKey = `menu.${item.title}`;
            const translation = t(translationKey);
            
            // Only use translation if it's different from the key (meaning it was found)
            translatedItem.title = translation !== translationKey ? translation : item.title;
        }
        
        // Translate headTitle1 if it exists
        if (item.headTitle1) {
            const translationKey = `menu.${item.headTitle1}`;
            const translation = t(translationKey);
            translatedItem.headTitle1 = translation !== translationKey ? translation : item.headTitle1;
        }
        
        // Recursively translate children
        if (item.children && Array.isArray(item.children)) {
            translatedItem.children = item.children.map((child: any) => translateMenuItem(child));
        }
        
        return translatedItem;
    }

    // Computed property that returns translated menu data
    const data = computed(() => {
        return data1.value.map(item => translateMenuItem(item));
    });

    const togglesidebar = ref<boolean>(window.innerWidth < 991);
    const activeoverlay = ref<boolean>(false);
    const customizer = ref<string>("");
    const searchData = ref<searchdatas[]>([]);
    const searchDatas = ref<search[]>([]);
    const searchOpen = ref<boolean>(false);
    const hideRightArrowRTL = ref<boolean>(false)
    const hideLeftArrowRTL = ref<boolean>(true)
    const hideRightArrow = ref<boolean>(true)
    const hideLeftArrow = ref<boolean>(true)
    const width = ref<number>(0)
    const height = ref<number>(0)
    const margin = ref<number>(0)
    const menuWidth = ref<number>(0)
    const perentName = ref<string>('')
    const subName = ref<string>('')
    const childName = ref<string>('')
    const bodyToggle = ref(false)
    const perentToggle = ref<boolean>(false)
    const subToggle = ref<boolean>(false)
    const childToggle = ref<boolean>(false)

    function toggle_sidebar() {
        togglesidebar.value = !togglesidebar.value;

        if (window.innerWidth < 991) {
            activeoverlay.value = togglesidebar.value; 
        } else {
            activeoverlay.value = false; 
        }
    }

    onMounted(() => {
        const handleResize = () => {
            togglesidebar.value = window.innerWidth >= 991;
        };

        window.addEventListener('resize', handleResize);
        handleResize(); 

        onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
        });
    });

    function subMenuToggle(Name: string) {
        perentName.value = perentName.value != Name ? Name : ""
        perentToggle.value = perentName.value != "" ? true : false
    }

    function subChildMenu(subTitle: string) {
        subName.value = subName.value != subTitle ? subTitle : ''
        subToggle.value = subName.value != "" ? true : false
    }

    function childMenu(childTitle: string) {
        childName.value = childName.value != childTitle ? childTitle : "";
        childToggle.value = childName.value != '' ? true : false
    }

    function searchTerm(term: any) {
        const items: any = [];
        const searchval = term.toLowerCase();
        const translatedData = data.value;
        
        translatedData.filter((menuItems: any) => {
            if (menuItems.title?.toLowerCase().includes(term) && menuItems.type === 'link') {
                items.push(menuItems);
            }
            menuItems.children?.filter((subItems: any) => {
                if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
                    subItems.icon1 = menuItems.icon1
                    items.push(subItems);
                }
                if (!subItems.children) return false;
                subItems.children?.filter((suSubItems: any) => {
                    if (suSubItems.title?.toLowerCase().includes(term)) {
                        suSubItems.icon1 = menuItems.icon1
                        items.push(suSubItems);
                    }
                })
            })
            searchData.value = items;
        })
    }

    function searchterm(terms: any) {
        const items: any = [];
        const searchval = terms.toLowerCase();
        const translatedData = data.value;
        
        translatedData.filter((menuItems: any) => {
            if (menuItems.title?.toLowerCase().includes(terms) && menuItems.type === 'link') {
                items.push(menuItems);
            }
            menuItems.children?.filter((subItems: any) => {
                if (subItems.title?.toLowerCase().includes(terms) && subItems.type === 'link') {
                    subItems.icon1 = menuItems.icon1
                    items.push(subItems);
                }
                if (!subItems.children) return false;
                subItems.children?.filter((suSubItems: any) => {
                    if (suSubItems.title?.toLowerCase().includes(terms)) {
                        suSubItems.icon1 = menuItems.icon1
                        items.push(suSubItems);
                    }
                })
            })
            searchDatas.value = items;
        })
    }

    function setNavActive(item: any) {
        if (!item.active) {
            data.value.forEach((a: any) => {
                if (data.value.includes(item))
                    a.active = false;
                if (!a.children) return false;
                a.children.forEach((b: any) => {
                    if (a.children.includes(item)) {
                        b.active = false;
                    }
                });
            });
        }
        item.active = !item.active;
        if (item.active) {
            bodyToggle.value = true
        }
        else {
            bodyToggle.value = false
        }
    }

    return {
        data,
        togglesidebar,
        activeoverlay,
        toggle_sidebar,
        setNavActive,
        customizer,
        searchTerm,
        searchterm,
        searchData,
        searchOpen,
        hideRightArrowRTL,
        hideLeftArrowRTL,
        hideRightArrow,
        hideLeftArrow,
        width,
        height,
        margin,
        menuWidth,
        searchDatas,
        data1,
        bodyToggle,
        subMenuToggle,
        subChildMenu,
        childMenu,
        perentName,
        subName,
        childName,
        perentToggle,
        subToggle,
        childToggle
    };
});