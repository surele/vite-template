import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import store from "@/stores";

// 创建vue实例
const app = createApp(App);

app.use(router);
app.use(store);

// 挂载实例
app.mount("#app");
