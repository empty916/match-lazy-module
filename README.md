# match-lazy-module
匹配需要懒加载的模块，并且生成对应的懒加载代码文件

1. 假设，有项目如下

   - src
       - modules
           - page1
             - index.js
           - page2
             - list
               - index.js

1. 我需要将modules下面的模块都要懒加载,webpack做不到这一点


````node

const path = require("path");
const matchLazyModule = require('match-lazy-module');

const project = "src"; // 项目源码目录
const slash = "/"; // 目录见的分隔符
const projectPath = path
	.join(__dirname, "..", "..", project)
	.replace(/\\|\//g, slash); // 项目绝对路径
const moduleDirName = "modules"; // 懒加载模块所在的目录名字
const moduleBasePath = path.join(__dirname, "..", "..", project, moduleDirName); // 懒加载模块所在的目录的绝对路径
const matchFileName = "index"; // 模块中可以匹配的文件名

const importPathPrefix = "@client"; // 导出模块的路径前缀
const fileName = path.join(__dirname, "lazyLoadModuleConfig.js"); // 生成文件的全路径

const generateLazyModule = matchLazyModule({
    projectPath,
    moduleBasePath,
    moduleDirName,
	matchFileName,
    importPathPrefix,
    fileName
});

generateLazyModule(); // 执行


````


````node
// 生成后的文件如下
// lazyLoadModuleConfig.js


export default {
  modules: {
    page1: () => import(/* webpackChunkName:"page1" */ '@client/modules/page1/index'),
    page2List: () => import(/* webpackChunkName:"page2List" */ '@client/modules/page1/list/index'),
  },
};

````