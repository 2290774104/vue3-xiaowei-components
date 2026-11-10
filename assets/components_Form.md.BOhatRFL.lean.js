const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/base.BcNPzqq4.js","assets/chunks/framework.BIUGJjsh.js"])))=>i.map(i=>d[i]);
import{p,D as r,v as k,V as o,B as E,c,o as g,b1 as l,ah as u,G as t,ai as m,k as i,w as d,ar as b}from"./chunks/framework.BIUGJjsh.js";import{I as y,$ as F}from"./chunks/index.CsPBRjmE.js";const f=`<template>
  <div>
    <xw-form
      ref="formRef"
      :model="model"
      :items="items"
      :label-width="'100px'"
      :gutter="20"
      @submit="handleSubmit"
    >
      <template #actions>
        <el-button type="primary" @click="formRef.submit()">提交</el-button>
        <el-button @click="formRef.resetFields()">重置</el-button>
      </template>
    </xw-form>

    <p style="color: #666">当前数据：{{ model }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const formRef = ref();

const model = reactive({
  name: '',
  age: undefined,
  gender: '',
  hobbies: [],
  birthday: '',
});

const items = [
  { type: 'input', label: '姓名', prop: 'name', span: 12, required: true },
  { type: 'number', label: '年龄', prop: 'age', span: 12, required: true },
  {
    type: 'select',
    label: '性别',
    prop: 'gender',
    span: 12,
    required: true,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
  {
    type: 'checkbox',
    label: '爱好',
    prop: 'hobbies',
    span: 24,
    options: [
      { label: '阅读', value: 'read' },
      { label: '运动', value: 'sport' },
      { label: '音乐', value: 'music' },
    ],
  },
  { type: 'date', label: '生日', prop: 'birthday', span: 12 },
];

const handleSubmit = (data: any) => {
  console.log('提交数据', data);
};
<\/script>
`,_=JSON.parse('{"title":"XwForm 动态表单组件","description":"","frontmatter":{},"headers":[],"relativePath":"components/Form.md","filePath":"components/Form.md","lastUpdated":1793951459000}'),C={name:"components/Form.md"},x=Object.assign(C,{setup(v){const e=p(!0),a=r();return k(async()=>{a.value=(await o(async()=>{const{default:n}=await import("./chunks/base.BcNPzqq4.js");return{default:n}},__vite__mapDeps([0,1]))).default}),(n,s)=>{const h=E("ClientOnly");return g(),c("div",null,[s[1]||(s[1]=l("",4)),u(t(i(y),null,null,512),[[m,e.value]]),t(h,null,{default:d(()=>[t(i(F),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{e.value=!1}),vueCode:i(f)},b({_:2},[a.value?{name:"vue",fn:d(()=>[t(i(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=l("",27))])}}});export{_ as __pageData,x as default};
