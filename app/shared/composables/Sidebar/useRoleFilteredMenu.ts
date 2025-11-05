// app/composables/useRoleFilteredMenu.ts
import { computed } from 'vue';
import { useAuthStore } from '~/shared/stores/authStore';
import { menuItems, type MenuGroup, type MenuItem } from '~/shared/composables/Sidebar/useMenuData';

export function useRoleFilteredMenu() {
  const authStore = useAuthStore();

  const roleFilteredMenu = computed(() => {
    if (!authStore.isLoggedIn || !authStore.user?.role) {
      // Ak používateľ nie je prihlásený, vrátime prázdne menu
      return [];
    }

    const userRole = authStore.user.role;

    // Prefiltrujeme celé menu
    const filtered: MenuGroup[] = menuItems.map(group => {
      // Z každej skupiny zoberieme len tie položky, ktoré zodpovedajú role
      const filteredItems = group.items.filter(item => 
        item.roles.includes(userRole)
      );

      // Vrátime skupinu, len ak má po filtrovaní nejaké položky
      if (filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
      return null;
    }).filter((group): group is MenuGroup => group !== null); // Odstránime prázdne skupiny

    return filtered;
  });

  return {
    roleFilteredMenu
  };
}