<script lang="ts" setup name="LinlongLoginPage">
import { ref } from "vue";
const title = "表单设计器";
const logging = ref(false);
const username = ref("");
const password = ref("");

const onLogin = () => {
    if (!validate()) {
        return false;
    }
    login();
};

function login() {
    if (logging.value) return;
    logging.value = true;

    // if (process.env.NODE_ENV === "production") {
    //     const lisence = SettingUtil.commonGetCookie("licenseKey");
    //     if (!lisence) {
    //         this.$message.error("授权信息缺失");
    //         this.logging = false;
    //         return;
    //     }
    // }

    commonService
        .login(username.value, password.value)
        .then(async (res: any) => {
            console.log("success");
        })
        .catch((error: any) => {
            console.error(error);
        })
        .finally(() => {
            logging.value = false;
        });
}

function validate() {
    if (!username.value) {
        return false;
    }
    if (!password.value) {
        return false;
    }
    return true;
}
</script>
<template>
    <article class="v-linglong-login-page">
        <main class="content">
            <section class="title">
                <div class="logo"></div>
                <div>
                    <p class="title-name">{{ title }}</p>
                    <p class="title-desc">欢迎使用{{ title }}</p>
                </div>
            </section>
            <section class="form">
                <a-input class="login-input" placeholder="请输入账号" allow-clear v-model.trim="username">
                    <template #prefix>
                        <div class="user"></div>
                    </template>
                </a-input>
                <a-input-password
                    class="login-input"
                    placeholder="请输入密码"
                    allow-clear
                    v-model.trim="password"
                    type="password"
                    @pressEnter="onLogin"
                >
                    <template #prefix>
                        <div class="password"></div>
                    </template>
                </a-input-password>
                <a-button :loading="logging" class="login-button" @click="onLogin"
                    >{{ logging ? "登录中" : "登录" }}<span v-if="logging">...</span></a-button
                >
            </section>
        </main>
    </article>
</template>
<style lang="scss">
.v-linglong-login-page {
    @include size;
    @include bg-img("@/assets/images/login/bg.jpg");
    position: relative;
    .content {
        @include size(28%, auto);
        @include flex(column, flex-start, flex-start);
        position: absolute;
        top: 50%;
        right: 10%;
        overflow: hidden;
        transform: translateY(-50%);
        .title {
            @include flex(row, flex-start, center);
            width: 100%;
            margin-bottom: 0.6rem;

            .logo {
                @include size(1.4rem, 1.4rem);
                @include bg-img("@/assets/images/login/logo.png");
            }

            &-name {
                @include font(0.6rem, bold);
                margin-bottom: 0;
                color: #223355;
                letter-spacing: 12px;
            }

            &-desc {
                margin-bottom: 0;
                font-size: 0.24rem;
                color: #667799;
                letter-spacing: 12px;
            }
        }
        .login-button {
            @include size(100%, 0.6rem);
            @include font(0.28rem, bold);
            line-height: 0.6rem;
            color: #fff;
            text-align: center;
            cursor: pointer;
            background-image: linear-gradient(139deg, #4376ec 13%, #37c8ff 99%);
            border-radius: 8px;
        }

        .login-input {
            @include size(100%, 0.6rem);
            margin-bottom: 0.4rem;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 0.1rem;
            box-shadow: inset 8px 8px 20px 0 rgba(0, 46, 122, 0.1);

            .ant-input {
                background-color: transparent;
            }

            input:-internal-autofill-previewed,
            input:-internal-autofill-selected {
                -webkit-text-fill-color: #223355 !important;
                transition: background-color 5000s ease-in-out 0s !important;
            }

            input::-webkit-input-placeholder {
                font-size: 0.2rem;
            }

            .user {
                @include size(0.32rem, 0.32rem);
                @include bg-img("@/assets/images/login/user.png");
                margin-left: 0.1rem;
            }

            .password {
                @include size(0.32rem, 0.32rem);
                @include bg-img("@/assets/images/login/password.png");
                margin-left: 0.1rem;
            }

            .ant-input-clear-icon {
                font-size: 0.18rem;
            }

            .anticon-eye-invisible {
                @include bg-img("@/assets/images/login/unsee.png");
            }

            .anticon-eye {
                @include bg-img("@/assets/images/login/see.png");
            }

            .ant-input-password-icon {
                @include size(0.22rem, 0.22rem);

                > svg {
                    display: none;
                }
            }
        }
    }
}
</style>
