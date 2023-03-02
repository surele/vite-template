<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores";
import { reactive } from "vue";

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => reactive({ name: "xiaoming", age: 1 })
    }
});
const userStore = useUserStore();
const { count } = storeToRefs(userStore);
const { increment } = userStore;
const onChange = () => {
    // props.user.age += 1;
};
</script>

<template>
    <div class="user-setting">
        <a-avatar :size="64" @click="onChange">
            <template #icon><UserOutlined /></template>
        </a-avatar>
        <div class="user-info">
            {{ user.name }}
            {{ user.age }}
            {{ count }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.layout-header {
    width: 100%;
    height: 0.5rem;
}
</style>
