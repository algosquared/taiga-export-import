import axios from "axios";

const getDefaultState = () => ({
	token: null,
	userId: null
});

export default {
	state: getDefaultState(),
	getters: {
		token: state => state.token,
		userId: state => state.userId,
		authHeaders: state => {
			if (state.token) {
				return { headers: { Authorization: `Bearer ${state.token}` } };
			} else {
				return {};
			}
		}
	},
	mutations: {
		setToken(state, token) {
			state.token = token;
		},
		setUserId(state, userId) {
			state.userId = userId;
		},
		resetAuthState(state) {
			Object.assign(state, getDefaultState());
		}
	},
	actions: {
		async login({ commit, getters }, { username, password }) {
			const response = await axios.post(`${getters.taigaURL}/auth`, {
				type: "normal",
				username,
				password
			});
			const token = response.data.auth_token;
			commit('setToken', token);
			const userId = response.data.id;
			commit('setUserId', userId);
		}
	},
};
