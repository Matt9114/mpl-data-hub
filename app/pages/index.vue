<script setup lang="ts">
const auth = useAuthStore()
if (auth.isLoggedIn) navigateTo('/profil')
else navigateTo('/login')
</script>
