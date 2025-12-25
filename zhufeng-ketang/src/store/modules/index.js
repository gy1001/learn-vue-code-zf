import HomeState from "./home/state";
import HomeActions from "./home/actions";
import HomeMutations from "./home/mutations";

import LessonState from "./lesson/state";
import LessonActions from "./lesson/actions";
import LessonMutations from "./lesson/mutations";

import UserState from "./user/state";
import UserActions from "./user/actions";
import UserMutations from "./user/mutations";

const modules = {
  home: {
    namespaced: true,
    state: HomeState,
    mutations: HomeMutations,
    actions: HomeActions,
  },
  lesson: {
    namespaced: true,
    state: LessonState,
    mutations: LessonMutations,
    actions: LessonActions,
  },
  users: {
    namespaced: true,
    state: UserState,
    mutations: UserMutations,
    actions: UserActions,
  },
};

export default modules;
