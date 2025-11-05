import { ref, computed, watch, type Ref } from 'vue';
// OPRAVA č. 1: Používame správnu cestu s aliasom `~`
import { type MenuGroup, type MenuItem, type MenuItemRoute } from '~/shared/composables/Sidebar/useMenuData';

export function useMenuFilter(menuItems: Ref<MenuGroup[]>) { 
  const searchQuery = ref('');
  const userExpandedGroups = ref<Set<string>>(new Set());
  const userExpandedMenu = ref<Set<string>>(new Set());
  const searchExpandedGroups = ref<Set<string>>(new Set());
  const searchExpandedMenu = ref<Set<string>>(new Set());

  watch(searchQuery, (newVal) => {
    if (!newVal) {
      searchExpandedGroups.value.clear();
      searchExpandedMenu.value.clear();
    }
  });

  const finalExpandedGroups = computed(() => new Set([...userExpandedGroups.value, ...searchExpandedGroups.value]));
  const finalExpandedMenu = computed(() => new Set([...userExpandedMenu.value, ...searchExpandedMenu.value]));
  
  // OPRAVA č. 2: Pridali sme chýbajúce funkcie
  function toggleGroup(groupName: string) {
    if (userExpandedGroups.value.has(groupName)) {
      userExpandedGroups.value.delete(groupName);
    } else {
      userExpandedGroups.value.add(groupName);
    }
    userExpandedGroups.value = new Set(userExpandedGroups.value);
  }

  function toggleSubmenu(itemKey: string) {
    if (userExpandedMenu.value.has(itemKey)) {
      userExpandedMenu.value.delete(itemKey);
    } else {
      userExpandedMenu.value.add(itemKey);
    }
    userExpandedMenu.value = new Set(userExpandedMenu.value);
  }

  const filteredMenu = computed(() => {
    if (!searchQuery.value) return menuItems.value; 

    const q = searchQuery.value.toLowerCase();
    searchExpandedGroups.value.clear();
    searchExpandedMenu.value.clear();

    return menuItems.value.map(group => { 
      const groupMatch = group.name.toLowerCase().includes(q);
      let foundAnyItem = false;

      // OPRAVA č. 3: Pridali sme typ pre 'item'
      const filteredItems = group.items.map((item: MenuItem) => {
        const labelMatch = item.label.toLowerCase().includes(q);
        if (item.to) {
          if (labelMatch) {
            foundAnyItem = true;
            return item;
          }
          return null;
        } else if (item.routes) {
          // OPRAVA č. 4: Pridali sme typ pre 'r'
          const filteredRoutes = item.routes.filter((r: MenuItemRoute) => r.label.toLowerCase().includes(q));
          if (filteredRoutes.length > 0 || labelMatch) {
            foundAnyItem = true;
            searchExpandedMenu.value.add(item.key);
            return { ...item, routes: filteredRoutes.length ? filteredRoutes : item.routes };
          }
          return null;
        }
        return null;
      }).filter(Boolean) as MenuItem[];

      if (groupMatch || foundAnyItem) {
        searchExpandedGroups.value.add(group.name);
        return { ...group, items: groupMatch ? group.items : filteredItems };
      }
      return null;
    }).filter(Boolean) as MenuGroup[];
  });

  return {
    searchQuery,
    filteredMenu,
    finalExpandedGroups,
    finalExpandedMenu,
    toggleGroup,
    toggleSubmenu
  };
}