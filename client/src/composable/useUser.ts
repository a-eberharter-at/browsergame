import { useUserStore } from '@/stores/user';  // Import your user store
import { computed } from 'vue';
import type {User} from "@auth0/auth0-spa-js";

export function useUser() {
  const userStore = useUserStore();  // Access the user store

  // You can return computed properties and actions to manipulate the store
  const user = computed(() => userStore.user);
  const token = computed(() => userStore.token);
  const setUser = (userData: User | null) => userStore.setUser(userData);

  const setToken = (tokenData: any) => userStore.setToken(tokenData);

  return {
    user,
    token,
    setUser,
    setToken
  };
}
