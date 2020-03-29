<template>
    <div>
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
          <el-alert
          title="添加商品信息"
          type="info"
          center
          :closable="false"
          show-icon>
        </el-alert>
        <el-steps :space="200" :active="stepActiveIndex - 0" align-center finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          label-position="top"
          >
          <el-tabs tab-position="left"
            v-model="stepActiveIndex"
            :before-leave="handleBeforeTabLeave"
            @tab-click="handleTabClick"
            >
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
                <el-form-item label="商品分类" prop="goods_cat">
                  <el-cascader
                    v-model="addForm.goods_cat"
                    :options="cateList"
                    :props="cateProps"
                    clearable
                    @change="handleCateChange"></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
                  <el-checkbox-group v-model="item.attr_vals">
                    <el-checkbox
                      :label="item1"
                      v-for="item1 in item.attr_vals"
                      :key="item1"
                      border
                      />
                  </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                action="http://127.0.0.1:8888/api/private/v1/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                :headers="headers"
                :on-success="handleUploadSuccess"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor
                v-model="addForm.goods_introduce"
              />
              <el-button type="primary" style="margin-top:15px" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
      <!-- 预览上传图片对话框 -->
      <el-dialog
        title="预览"
        :visible.sync="previewDialogVisible"
        width="50%">
        <img :src="uploadPreviewPath" alt="" style="width:100%">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      stepActiveIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请填写商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请填写商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请填写商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请填写商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      // 级联选择项参数
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        goods_introduce: ''
      },
      // 商品动态参数
      manyData: [],
      // 静态属性列表
      onlyData: [],
      fileList: [],
      // 图片上传组件请求头
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      uploadPreviewPath: '',
      previewDialogVisible: false
    }
  },
  computed: {
    catId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
    },
    handleCateChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    handleBeforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      } else if (oldActiveName === '1') {
        this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'only' }
        }).then(data => {
          const res = data.data
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.onlyData = res.data
        })
      }
    },
    async handleTabClick () {
      if (this.stepActiveIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyData = res.data
      }
    },
    handlePreview (file) {
      this.uploadPreviewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove (file) {
      const path = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => item.tmp_path === path)
      this.addForm.pics.splice(index, 1)
    },
    handleUploadSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    addGoods () {
      this.$refs.addFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('请将商品信息填写完整')
        }
        const form = _.cloneDeep(this.addForm)
        // 分类ID列表
        form.goods_cat = form.goods_cat.join(',')
        // 动态参数
        this.manyData.forEach(item => {
          const info = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(info)
        })
        // 静态属性
        this.onlyData.forEach(item => {
          const info = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(info)
        })
        form.attrs = this.addForm.attrs
        // 发起请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin-top: 15px;
  }
  .el-step__title {
    font-size: 12px;
  }
  .el-tabs {
    margin-top: 15px;
  }
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
</style>
