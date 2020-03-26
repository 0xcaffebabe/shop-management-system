<template>
    <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <el-table :data="permissionList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="权限名称" prop="autnName"/>
            <el-table-column label="路径" prop="path"/>
            <el-table-column label="权限等级" prop="level">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.level == 1">一级</el-tag>
                <el-tag v-else-if="scope.row.level == 2" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      permissionList: []
    }
  },
  created () {
    this.getPermissionList()
  },
  methods: {
    async getPermissionList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.permissionList = res.data
    }
  }
}
</script>

<style lang="less" scoped>

</style>
