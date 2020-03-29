<template>
    <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input v-model="queryInfo.query" placeholder="请输入内容" class="input-with-select" clearable @clear="getGoodsList">
                <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="goAddPage">添加商品</el-button>
            </el-col>
          </el-row>
          <!-- 商品数据区域 -->
          <el-table
          :data="goodsList"
          border stripe
          >
            <el-table-column type="index"/>
            <el-table-column label="商品名称" prop="goods_name"/>
            <el-table-column label="价格" prop="goods_price" width="95px"/>
            <el-table-column label="重量" prop="goods_weight" width="95px"/>
            <el-table-column label="创建时间" width="140px">
              <template slot-scope="scope">
                {{scope.row.add_time | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
             <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="queryInfo.pagesize"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品数据列表
      goodsList: [],
      // 商品数据总数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getGoodsList()
    },
    handleCurrentChange (num) {
      this.queryInfo.pagenum = num
      this.getGoodsList()
    },
    async deleteGoods (goods) {
      const ret = await this.$confirm('确认删除商品:' + goods.goods_name, {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).catch(e => e)
      if (ret !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${goods.goods_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-pagination {
    margin-top: 15px;
  }
</style>
