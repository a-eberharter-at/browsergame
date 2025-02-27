// stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { User } from '@auth0/auth0-spa-js';

export const useUserStore = defineStore('user', () => {
  // Define a reactive reference to hold the user data
  const user = ref<User | null>(null);
  const token = ref<any>(null);
  // Define actions to modify the user data
  function setUser(userData: User | null) {
    user.value = userData;
  }
  function setToken(tokenData: any) {
    token.value = tokenData;
  }

  return {
    user,
    token,
    setUser,
    setToken,
  };
});
