import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "home",
        component: () => import("@/pages/index/views/welcome/index.vue")
    },
    {
        path: "/about",
        name: "about",
        component: () => import("@/pages/index/views/about/index.vue")
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
