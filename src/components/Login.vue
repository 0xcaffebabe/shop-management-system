<template>
  <div class="login_container">
    <div class="login_box">
        <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0px" class="login_form">
        <el-form-item prop="name">
          <el-input v-model="form.name" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        name: 'admin',
        password: '123456'
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在2-10之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.formRef.resetFields()
    },
    login () {
      this.$refs.formRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post('/login', {
            username: this.form.name,
            password: this.form.password
          })
          if (result.meta.status !== 200) {
            return this.$message.error('登录失败:' + result.meta.msg)
          }
          this.$message.success('登录成功')
          window.sessionStorage.setItem('token', result.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;
}
.login_box {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  .avatar_box {
    position: relative;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    height: 130px;
    width: 130px;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
    }
  }
}
.btns {
  float: right;
}
.login_form {
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}
</style>
