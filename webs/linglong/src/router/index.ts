import type { RouteRecordRaw } from "vue-router";

export const CommonRoutes: RouteRecordRaw[] = [
    {
        name: "login",
        path: "/login",
        component: () => import("@/views/login/index.vue")
    }
];
