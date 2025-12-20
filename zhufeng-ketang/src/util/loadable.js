import LoadingComponent from "../components/loading.vue";

const loadable = (importFunc) => {
  let component = () => ({
    component: importFunc(),
    loading: LoadingComponent,
    delay: 0,
  });
  return {
    render: (h) => h(component),
  };
};

// 路由切换，异步加载的 loading
export default loadable;
