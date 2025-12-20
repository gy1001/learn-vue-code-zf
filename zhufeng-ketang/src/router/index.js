import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/home/index.vue";
import loadable from "@/util/loadable";

Vue.use(VueRouter);
// 自动生成路由， 不建议路由自动配置，可配置性比较低（比如批注，钩子等）
const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/lesson",
    name: "lesson",
    // 默认白页， 加载完毕在渲染
    component: loadable(() =>
      import(/* webpackChunkName: "lesson" */ "../views/lesson/index.vue")
    ),
  },
  {
    path: "/profile",
    name: "profile",
    component: loadable(() =>
      import(/* webpackChunkName: "profile" */ "../views/profile/index.vue")
    ),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
