<template>
<el-container class="home-container">
    <el-header>
      <div>电商后台管理系统</div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="collapseMenu ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 左侧菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="collapseMenu"
          :collapse-transition="false"
          router
          :default-active="activePath"
          >
          <el-submenu :index="item.id + ''" v-for="(item, index) in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[index]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveState(item.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
</el-container>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      menuList: [],
      menuIcon: ['el-icon-shopping-bag-1', 'el-icon-s-order', 'el-icon-lock', 'el-icon-s-custom', 'el-icon-s-data'],
      collapseMenu: false,
      activePath: window.sessionStorage.getItem('path')
    }
  },
  methods: {
    logout () {
      window.sessionStorage.setItem('token', '')
      this.$router.push('/login')
    },
    async getMenu () {
      const { data: result } = await this.$http.get('/rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.menuList = result.data
    },
    toggleCollapse () {
      this.collapseMenu = !this.collapseMenu
    },
    saveState (path) {
      this.activePath = '/' + path
      window.sessionStorage.setItem('path', '/' + path)
    }
  },
  created () {
    this.getMenu()
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    div {
      color: #fff;
      font-size: 20px;
    }
  }
  .el-aside {
    background-color: #333744;
    transition: 0.5s all;
  }
  .el-main {
    background-color: #eaedf1;
  }
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    line-height: 24px;
    font-size: 10px;
    letter-spacing: 0.2rem;
    color: #fff;
    text-align: center;
    background-color: #4a5064;
    cursor: pointer;
  }
</style>
