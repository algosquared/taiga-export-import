<template>
	<div class="auth">
		<form @submit.prevent="login">
			<h1>Taiga Export</h1>
			<div class="input-container">
				<input 
					type="text" 
					name="username"
					placeholder="Username or email (case sensitive)"
					autofocus 
					required
					ref="inputUsername"
				>
			</div>
			<div class="input-container">
				<input 
					:type="showPassword ? 'text' : 'password'" 
					name="password"
					placeholder="Password"
					required
				>
				<button
					class="show-password"
					type="button"
					@click="showPassword = !showPassword"
				>{{ showPassword ? 'Hide' : 'Show' }}</button>
			</div>
			<button
				type="submit"
				class="login"
			>{{ isLoading ? 'Loading...' : 'Login' }}</button>
		</form>
	</div>
</template>

<script>
	export default {
		name: 'Auth',
		data: () => ({
			isLoading: false,
			showPassword: false
		}),
		methods: {
			async login() {
				try {
					this.isLoading = true;
					const username = document.querySelector('input[name="username"]').value;
					const password = document.querySelector('input[name="password"]').value;
					await this.$store.dispatch('login', { username, password });
					this.$router.push({ name: 'Home' });
				} catch (error) {
					console.error(error.response)
					if (error.response?.data?.detail) 
						this.$toast.error(error.response.data.detail, { theme: 'dark' });
					else if (error.response?.data?._error_message)
						this.$toast.error(error.response.data._error_message, { theme: 'dark' });
					else
						this.$toast.error('Something went wrong', { theme: 'dark' });
				} 
				finally {
					this.isLoading = false;
				}
			}
		},
		mounted() {
			this.$store.dispatch('resetState');
			this.$refs.inputUsername.focus();
		}
	}
</script>

<style lang="sass" scoped>
$night-color: #1a1d1f
$dark-color: #25292d
$light-grey-color: #3e3e3e
.auth
	display: flex
	justify-content: center
	align-items: center
	height: 100vh
	overflow: hidden
	background: $dark-color
	form
		display: flex
		flex-direction: column
		align-items: center
		width: 400px
		h1 
			margin-bottom: 20px
			color: #fff
			text-transform: uppercase
		.input-container
			width: 100%
			position: relative
			margin-bottom: 10px
			.show-password
				position: absolute
				top: 50%
				right: 10px
				transform: translateY(-50%)
				background: none
				border: none
				color: #fff
				cursor: pointer
				text-transform: uppercase
				font-size: 0.75rem
		input
			padding: 10px 15px
			border-radius: 5px
			width: 100%
			font-size: 0.9rem
			background: $dark-color
			color: #fff
			border: 1px solid $light-grey-color
			transition: all .1s ease-in-out
			letter-spacing: 0.5px
			&:focus,
			&:hover
				border-color: rgba(#fff, .5)
				background: $night-color
		button.login
			margin-top: 10px
			padding: 10px 15px
			border: none
			border-radius: 5px
			width: 100%
			cursor: pointer
			background: #83eede
			transition: all .2s ease-in-out
			font-weight: bold
			text-transform: uppercase
			&:hover
				color: #fff
				background: #00b8a9
		
</style>
