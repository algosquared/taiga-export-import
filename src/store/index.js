import { createStore } from 'vuex'
import auth from './modules/auth.js'
import projects from './modules/projects.js';

export default createStore({
  state: {
	taigaURL: 'https://api.taiga.io/api/v1',
  },
  getters: {
	taigaURL: state => state.taigaURL,
  },
  mutations: {
  },
  actions: {
	resetState({ commit }) {
		commit('resetAuthState');
	}
  },
  modules: {
	auth, projects
  }
})
