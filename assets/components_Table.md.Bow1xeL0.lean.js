const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/base.C1eXbaLq.js","assets/chunks/framework.BIUGJjsh.js"])))=>i.map(i=>d[i]);
import{p as k,D as r,v as d,V as E,B as g,c,o,b1 as e,ah as y,G as i,ai as F,k as a,w as h,ar as b}from"./chunks/framework.BIUGJjsh.js";import{I as u,$ as m}from"./chunks/index.CsPBRjmE.js";const C=`<template>\r
  <xw-table\r
    :data="tableData"\r
    :columns="columns"\r
    :pagination="pagination"\r
    :total="total"\r
    @page-change="handlePageChange"\r
  >\r
    <template #search>\r
      <el-form :model="searchForm" inline>\r
        <el-form-item label="姓名">\r
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />\r
        </el-form-item>\r
        <el-form-item>\r
          <el-button type="primary" @click="handleSearch">查询</el-button>\r
        </el-form-item>\r
      </el-form>\r
    </template>\r
  </xw-table>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, reactive } from 'vue';\r
\r
const tableData = ref([\r
  { id: 1, name: '张三', age: 25, address: '北京市朝阳区' },\r
  { id: 2, name: '李四', age: 30, address: '上海市浦东新区' },\r
  { id: 3, name: '王五', age: 28, address: '广州市天河区' },\r
]);\r
\r
const columns = ref([\r
  { type: 'index', label: '序号', width: 60 },\r
  { prop: 'name', label: '姓名', width: 120 },\r
  { prop: 'age', label: '年龄', width: 100 },\r
  { prop: 'address', label: '地址', showOverflowTooltip: true },\r
]);\r
\r
const pagination = reactive({\r
  currentPage: 1,\r
  pageSize: 10,\r
  pageSizes: [10, 20, 50, 100],\r
  layout: 'prev, pager, next, sizes, total',\r
  background: true,\r
});\r
\r
const total = ref(3);\r
\r
const handlePageChange = (pageInfo: any) => {\r
  console.log('分页变化:', pageInfo);\r
};\r
\r
const searchForm = reactive({\r
  name: '',\r
});\r
\r
const handleSearch = () => {\r
  console.log('搜索:', searchForm);\r
};\r
<\/script>\r
`,A=JSON.parse('{"title":"XwTable 表格组件","description":"","frontmatter":{},"headers":[],"relativePath":"components/Table.md","filePath":"components/Table.md","lastUpdated":1793956809000}'),B={name:"components/Table.md"},f=Object.assign(B,{setup(v){const t=k(!0),n=r();return d(async()=>{n.value=(await E(async()=>{const{default:l}=await import("./chunks/base.C1eXbaLq.js");return{default:l}},__vite__mapDeps([0,1]))).default}),(l,s)=>{const p=g("ClientOnly");return o(),c("div",null,[s[1]||(s[1]=e("",4)),y(i(a(u),null,null,512),[[F,t.value]]),i(p,null,{default:h(()=>[i(a(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(C)},b({_:2},[n.value?{name:"vue",fn:h(()=>[i(a(n))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=e("",47))])}}});export{A as __pageData,f as default};
