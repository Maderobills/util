// stores/breadCrumbStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  Home, 
  ChevronRight,
  Settings,
  User,
  FileText,
  ShoppingCart,
  Search,
  Mail,
  Lock,
  Hash,
  Phone,
  // Add more icons as needed
} from 'lucide-vue-next';

export const useBreadCrumbStore = defineStore('breadcrumb', () => {
  // State
  const breadcrumbs = ref([]);
  
  // Available icons mapping
  const iconMap = {
    'home': Home,
    'settings': Settings,
    'user': User,
    'file': FileText,
    'cart': ShoppingCart,
    'search': Search,
    'mail': Mail,
    'lock': Lock,
    'hash': Hash,
    'phone': Phone,
    // Add more mappings as needed
  };
  
  // Get the icon component by name
  const getIcon = (iconName) => {
    return iconMap[iconName] || null;
  };
  
  // Set full breadcrumb path
  const setBreadcrumbs = (items) => {
    breadcrumbs.value = items.map(item => ({
      ...item,
      icon: typeof item.icon === 'string' ? getIcon(item.icon) : item.icon
    }));
  };
  
  // Add a breadcrumb
  const addBreadcrumb = (item) => {
    const newItem = {
      ...item,
      icon: typeof item.icon === 'string' ? getIcon(item.icon) : item.icon
    };
    breadcrumbs.value.push(newItem);
  };
  
  // Remove the last breadcrumb
  const removeLastBreadcrumb = () => {
    if (breadcrumbs.value.length > 0) {
      breadcrumbs.value.pop();
    }
  };
  
  // Clear all breadcrumbs
  const clearBreadcrumbs = () => {
    breadcrumbs.value = [];
  };
  
  // Reset to just home
  const resetToHome = () => {
    breadcrumbs.value = [{
      label: 'Home',
      route: '/',
      icon: Home
    }];
  };
  
  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeLastBreadcrumb,
    clearBreadcrumbs,
    resetToHome,
    getIcon
  };
});