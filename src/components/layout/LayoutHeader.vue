<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores";

defineProps<{ title: string }>();
const userStore = useUserStore();
const { count } = storeToRefs(userStore);
const { increment } = userStore;
</script>

<template>
    <header class="layout-header">
        <slot name="left">
            <div class="title">{{ title }}</div>
        </slot>
        <slot name="right"></slot>
    </header>
</template>

<style scoped lang="scss">
.layout-header {
    @include size(100%, 0.6rem);
    @include flex(row, space-between, center);
    background-image: linear-gradient(131deg, #fff, #fff 51%, #f0f8ff 100%, #f0f8ff 0);
    border: 1px solid rgba(51, 136, 255, 0.1);
    box-shadow: 4px 4px 40px 0 rgba(0, 114, 255, 0.1);
    .title {
        font-size: 0.18rem;
        font-weight: 600;
        color: #235;
    }
}
</style>
