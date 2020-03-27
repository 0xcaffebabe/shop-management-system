<template>
    <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <el-row>
            <el-col>
              <el-button type="primary" @click="showAddCate">添加分类</el-button>
            </el-col>
          </el-row>
          <!-- 表格 -->
          <tree-table class="tree-table"
          :data="cateList"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index
          index-text="#"
          border
          :show-row-hover="false"
          >
            <!-- 是否有效列模板 -->
            <template slot="isok" slot-scope="scope">
              <i class="el-icon-success" v-if="!scope.row.cate_deleted" style="color:lightgreen"></i>
              <i class="el-icon-error" v-else style="color:red"></i>
            </template>
            <!-- 排序列模板 -->
            <template slot="order" slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
              <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
              <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <!-- 操作列模板 -->
            <template slot="opt">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">编辑</el-button>
            </template>
          </tree-table>
          <!-- 分页 -->
           <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-card>
        <!-- 分类添加对话框 -->
        <el-dialog
          title="添加分类"
          :visible.sync="addCateDialogVisible"
          width="50%"
          @close="addCateDialogClosed"
          >
          <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
              <el-cascader
                expand-trigger="hover"
                clearable
                change-on-select
                v-model="selectOption"
                :props="cascaderProps"
                :options="parentCateList"
                @change="parentCateChange"
                ></el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总条数
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      addCateDialogVisible: false,
      // 添加分类表单对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 分类表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // 父级分类ID
      selectOption: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created () {
    this.getCategories()
  },
  methods: {
    async getCategories () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getCategories()
    },
    handleCurrentChange (page) {
      this.queryInfo.pagenum = page
      this.getCategories()
    },
    showAddCate () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentCateList = res.data
    },
    // 父级选择项发生变化
    parentCateChange () {
      if (this.selectOption.length > 0) {
        this.addCateForm.cat_pid = this.selectOption[this.selectOption.length - 1]
        this.addCateForm.cat_level = this.selectOption.length
      }
    },
    // 添加新分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请将信息填写完整')
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getCategories()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectOption = []
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>
