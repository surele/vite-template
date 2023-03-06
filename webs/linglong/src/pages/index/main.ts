import { createApp } from "vue";
import "@/assets/styles/index.scss";
import App from "./App.vue";
import router from "./router";
import store from "@/stores";

// 创建vue实例
const app = createApp(App);

app.use(router);
app.use(store);
// app.component("test-co", {
//     setup() {
//         return {};
//     },
//     template: `
//     <button >
//       You clicked me  times.
//     </button>`
// });

// 挂载实例
app.mount("#app");
