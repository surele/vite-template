import { CommonRoutes } from "@/router";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "welcome",
        component: () => import("@/pages/index/views/welcome/index.vue")
    },
    {
        path: "/about",
        name: "about",
        component: () => import("@/pages/index/views/about/index.vue")
    },
    {
        path: "/workbentch",
        name: "workbentch",
        component: () => import("@/pages/index/views/demo/index.vue")
    },
    ...CommonRoutes
];

const router = createRouter({
    // history: createWebHistory(import.meta.env.BASE_URL),
    history: createWebHashHistory(),
    routes
});

export default router;
