<script setup lang="ts" name="WB">
import LayoutHeader from "@/components/layout/LayoutHeader.vue";
import UserSetting from "@/components/UserSetting.vue";
import { ref } from "vue";
const user = ref({
    name: "lihua",
    age: 1
});
</script>

<template>
    <LayoutHeader title="工作1台">
        <template #right>
            <UserSetting></UserSetting>
        </template>
    </LayoutHeader>
</template>

<style scoped></style>
