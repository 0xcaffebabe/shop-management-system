<template>
    <div>
        home
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
  name: 'home',
  methods: {
    logout () {
      window.sessionStorage.setItem('token', '')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
