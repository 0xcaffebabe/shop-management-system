<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置参数"
        type="warning"
        :closable="false"
        show-icon
        >
      </el-alert>
      <!-- 商品分类 -->
      <el-row>
        <el-row>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
            >
          </el-cascader>
        </el-row>
      </el-row>
      <!-- tab区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <!-- 动态参数面板 -->
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="btnDisabled" @click="showAddDialog">添加参数</el-button>
        <el-table :data="manyData" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(i, scope.row)">
                {{item}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index"/>
          <el-table-column label="参数名称" prop="attr_name"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 静态属性面板 -->
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="btnDisabled" @click="showAddDialog">添加参数</el-button>
        <el-table :data="onlyData" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(i, scope.row)">
                {{item}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index"/>
          <el-table-column label="参数名称" prop="attr_name"/>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
      >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="活动名称" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 商品分类级联选择框配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品分类选中
      selectCateKeys: [],
      activeName: 'many',
      manyData: [],
      onlyData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    btnDisabled () {
      return this.selectCateKeys.length !== 3
    },
    // 三级分类ID
    cateId () {
      if (this.selectCateKeys.length !== 3) {
        return null
      } else {
        return this.selectCateKeys[2]
      }
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
    },
    handleChange () {
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        this.manyData = []
        this.onlyData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      res.data.forEach(item => {
        item.inputVisible = false
        item.inputValue = ''
        if (!item.attr_vals) {
          item.attr_vals = []
        } else {
          item.attr_vals = item.attr_vals.split(' ')
        }
      })

      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    showAddDialog () {
      this.addDialogVisible = true
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('请填写参数')
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    async deleteParams (id) {
      const ret = await this.$confirm('是否确认删除', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(e => e)
      if (ret !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getParamsData()
    },
    async handleInputConfirm (item) {
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        return
      }
      item.attr_vals.push(item.inputValue.trim())
      item.inputValue = ''
      item.inputVisible = false
      this.saveAttrVals(item)
    },
    showInput (item) {
      item.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除参数标签
    handleTagClose (i, item) {
      item.attr_vals.splice(i, 1)
      this.saveAttrVals(item)
    },
    async saveAttrVals (item) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${item.attr_id}`, {
        attr_name: item.attr_name,
        attr_sel: item.attr_sel,
        attr_vals: item.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    margin-top: 15px;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 100px;
  }
</style>
