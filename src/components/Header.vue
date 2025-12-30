<template>
	<div class="header">
		<div class="logo">
			Taiga Export
		</div>
	</div>
</template>

<script>
export default {
	name: 'Header'
}
</script>

<style lang="sass" scoped>
.header 
	display: flex
	justify-content: space-between
	align-items: center
	padding: 20px
	border-bottom: 1px solid #3e3e3e
	background: transparent
	height: 60px
	.logo
		text-transform: uppercase
		font-size: 1rem
		font-weight: 700
		color: #fff

</style>