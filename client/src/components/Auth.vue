<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {Auth0Client, User} from '@auth0/auth0-spa-js';


const auth0 = new Auth0Client({
  domain: "dev-robotron.eu.auth0.com",
  clientId: "k383oM5B2sBJnCGQALYNYorv4FbLEaab",
  authorizationParams: {
    redirect_uri: "http://localhost:3001/"
  }
});
import {useUser} from "@/composable/useUser.ts";

const { user, setUser, setToken } = useUser();

const authIsRunning = ref<boolean>(false);


onMounted(async () => {
  try {
    authIsRunning.value = true;
    await auth0.getTokenSilently();
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
      // User is already logged in
      setUser(await auth0.getUser() || null);
      const token = await auth0.getIdTokenClaims();
      setToken(token?.__raw);
      authIsRunning.value = false;
    } else {
      console.log("[AUTH] Mounted: CheckForRedirectCallback")
      // User is not authenticated, check for redirect callback
      await checkForRedirectCallback();
    }
  } catch (error:any) {
    if (error.error !== 'login_required') {
      throw error;
    }
    setToken(null);
    authIsRunning.value = false;
  }
  /*
  // Initialize Auth0
  auth0.value = await createAuth0Client({ domain, clientId });

  // Check if returning from authentication
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.value?.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  // Check if already authenticated
  isAuthenticated.value = await auth0.value?.isAuthenticated() || false;
  if (isAuthenticated.value) {
    user.value = await auth0.value?.getUser();
  }

   */
});

async function login() {
  console.log("[AUTH] Login")
  await auth0.loginWithRedirect();
}
async function checkForRedirectCallback(){
  authIsRunning.value = true;
  try {
    const redirectResult = await auth0.handleRedirectCallback();
    //logged in. you can get the user profile like this:
    setUser(await auth0.getUser() || null);
    const token = await auth0.getIdTokenClaims();
    setToken(token?.__raw);
    console.log("[AUTH] User: ", user);
    authIsRunning.value = false;
  } catch (e){
    console.error(e);
    authIsRunning.value = false;
    setToken(null);
  }
}

async function logout() {
  console.log("[AUTH] Logout");
  await auth0.logout();
}
</script>

<template>
  <div class="auth-container" v-if="!user">
      <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded cursor-pointer" :disabled="authIsRunning" @click="login">Login</button>
  </div>
  <div class="auth-container" v-else>
    <button class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded cursor-pointer" @click="logout">Logout</button>
  </div>
</template>

