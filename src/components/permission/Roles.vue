<template>
    <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <el-row>
            <el-col>
              <el-button type="primary">添加角色</el-button>
            </el-col>
          </el-row>
          <!-- 角色列表 -->
          <el-table
            :data="roleList"
            border stripe
          >
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row :class="['bdbottom', index === 0 ? 'bdtop' : '']" v-for="(item,index) in scope.row.children" :key="item.id" class="vcenter">
                  <el-col :span="5">
                    <el-tag  @close="removePermission(scope.row, item)" closable>{{item.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-row :class="[index1 ===0 ? '': 'bdtop']" v-for="(item1,index1) in item.children" :key="item1.id" class="vcenter">
                      <el-col :span="6">
                        <el-tag  @close="removePermission(scope.row, item1)" type="success" closable>{{item.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <el-col :span="18">
                        <el-tag closable @close="removePermission(scope.row, item2)" type="warning" v-for="(item2) in item1.children" :key="item2.id">
                          {{item2.authName}}
                        </el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index"/>
            <el-table-column label="角色" prop="roleName"/>
            <el-table-column label="角色描述" prop="roleDesc"/>
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetPermissionDialog(scope.row)">分配权限</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-dialog
          title="分配权限"
          :visible.sync="setPermissionDialogVisible"
          width="50%">
          <el-tree
          ref="treeRef"
          :data="permissionList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultKeys"
          ></el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setPermissionDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotPermission" >确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      setPermissionDialogVisible: false,
      permissionList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defaultKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleList = res.data
    },
    async removePermission (role, permission) {
      const ret = await this.$confirm(`此操作将永久删除权限"${permission.authName}",是否继续`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (ret !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${permission.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      role.children = res.data
    },
    async showSetPermissionDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleId = role.id
      this.permissionList = res.data
      this.defaultKeys = []
      this.getLeafKeys(role, this.defaultKeys)
      this.setPermissionDialogVisible = true
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    async allotPermission () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keysStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keysStr })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getRoleList()
      this.setPermissionDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin-top: 8px;
    margin-bottom: 8px ;
  }
  .bdtop {
    border-top: 1px solid #ccc;
  }
  .bdbottom {
    border-bottom: 1px solid #ccc;
  }
  .el-tag {
    margin-right: 8px;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
