<script setup lang="ts" name="welcome">
import Hello from "@/components/layout/LayoutHeader.vue";
</script>

<template>
    <a-button type="primary">123</a-button>
    <zhihu-outlined />
    <Hello msg="Vite + Vue" />
    <test-co></test-co>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
