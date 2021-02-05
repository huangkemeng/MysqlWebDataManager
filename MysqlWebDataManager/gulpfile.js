/// <binding BeforeBuild='min' Clean='clean' ProjectOpened='auto' />
"use strict";

//加载使用到的 gulp 插件
const gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify"),
    changed = require("gulp-changed");


//定义 wwwroot 下的各文件存放路径
const paths = {
    root: "./wwwroot/",
    lib: './wwwroot/lib/'
};

//使用 npm 下载的前端组件包
const libs = [
    { name: "jquery", dist: "./node_modules/jquery/dist/**/*.*" },
    { name: "bootstrap", dist: "./node_modules/bootstrap/dist/**/*.*" },
    { name: "jquery-form", dist: "./node_modules/jquery-form/dist/**/*.*" },
    { name: "jquery-validation", dist: "./node_modules/jquery-validation/dist/**/*.*" },
    { name: "jquery-validation-unobtrusive", dist: "./node_modules/jquery-validation-unobtrusive/dist/**/*.*" },
    { name: "bootstrap-datetime-picker", dist: "./node_modules/bootstrap-datetime-picker/**/*.*" }
];

//移动 npm 下载的前端组件包到 wwwroot 路径下
gulp.task("move", done => {
    libs.forEach(function (item) {
        gulp.src(item.dist)
            .pipe(gulp.dest(paths.lib + item.name + "/dist"));
    });
    done();
});


