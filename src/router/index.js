import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store/index.js'
import Home from '../views/Home.vue'
import Auth from '../views/Auth.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/auth',
		name: 'Auth',
		component: Auth
	}
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!store.getters.token) {
			console.log('No token found, redirecting to auth page...')
			next('/auth');
			return;
		}
	} 
	
	next();
})

export default router
