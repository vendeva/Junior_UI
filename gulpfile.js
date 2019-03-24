const gulp = require('gulp'),
    gutil = require('gulp-util'),                 // Утилиты для Gulp плагинов
    plumber = require('gulp-plumber'),            // Обработчик ошибок сборщика
    path = require('path'),                       // Утилита для работы с путями
    less = require('gulp-less'),                  // Компилятор LESS
    watchLess = require('gulp-watch-less'),       // Наблюдатель за всеми includa'ми в файле
    concat = require('gulp-concat'),              // объединяет файлы в один бандл
    cleanCSS = require('gulp-clean-css'),         // сжимает css
    uglify = require('gulp-terser'),              // Сжимает js
    rename = require('gulp-rename');              // Переименовывает
    browserSync = require('browser-sync');           //Синхронизация с браузером

let task_env = "dev"; // Идентификатор цели запуска задачи (dev - для наблюдателей, prod - для финального билда)

const postcss = require('gulp-postcss');

const postcss_processors = [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-nested'),
    require('postcss-simple-vars'),
    require('postcss-hexrgba'),
    require('postcss-extend'),
    require('postcss-units'),
    require('postcss-cssnext')(['> 0.5%', 'last 10 versions']),
    require('postcss-easings'),
    require('postcss-object-fit-images'),
    require('postcss-flexibility')
];

// LESS
const cssPath = 'app/css/';
const lessPath = path.join(cssPath, 'less');        // Папка с LESS файлами
const mainLess = path.join(lessPath, 'style.less'); // Имя главного LESS файла проекта
const post_css_file = 'style.css';                     // Имя полученного файла
const post_css_path = path.join(cssPath, 'pcss');      // Папка назначения

const lessConfig = {
    paths: [
        lessPath,
        path.join(lessPath, 'modules'),
        path.join(lessPath, 'includes')
    ],
};

// PCSS
const post_css_main_file = path.join(post_css_path, post_css_file); // Имя главного (несжатого) CSS файла проекта
const cssOutFile = 'styleResult.css';                             // Имя полученного файла
const cssOutPath = path.join(cssPath, 'c');                       // Папка назначения

let clean_css_params = {
    format: 'keep-breaks'
};


// JS
// const jsPath = 'app/js/';                        // Папка с JS файлами
// const jsFiles = [                                // Исходные JS файлы
//     'lib/jquery-3.3.1.min.js',
//     'script.js'
// ];
// const jsOutFile = 'c.js';                        // Имя полученного файла
// const jsOutPath = path.join(jsPath, 'c');        // Папка назначения


const onError = function (err) {
    gutil.beep();
    console.log(err);
};

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    })
});


gulp.task('watch', ['browser-sync'], function(){                       // Наблюдает за файлами LESS и JS
    watchLess(mainLess, {
        name: 'LESS'
    })
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(less(lessConfig))
        .pipe(rename(post_css_file))
        .pipe(gulp.dest(post_css_path))
        .pipe(postcss(postcss_processors))
        .pipe(plumber.stop())
        .pipe(cleanCSS({}))
        .pipe(rename(cssOutFile))
        .pipe(gulp.dest(cssOutPath));

    // gulp.watch(jsFiles, {cwd: jsPath}, ['build-js']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/css/c/**/*.css', browserSync.reload);
    // gulp.watch('app/js/c/**/*.js', browserSync.reload);
});

gulp.task('less', function(){
    return gulp.src(mainLess)
        .pipe(less(lessConfig))
        .pipe(rename(post_css_file))
        .pipe(gulp.dest(post_css_path));

});

gulp.task('postcss', ['less'], function () {

    let resultCssPath = cssPath;

    if(task_env === 'prod'){
        clean_css_params = { };
        resultCssPath = cssOutPath;
    }

    return gulp.src(post_css_main_file)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(postcss(postcss_processors))
        .pipe(plumber.stop())
        .pipe(cleanCSS(clean_css_params))
        .pipe(rename(cssOutFile))
        .pipe(gulp.dest(resultCssPath));

});

gulp.task('production', function(){
    task_env = 'prod';
});


gulp.task('build-css-with-postcss', ['production','postcss']);


// gulp.task('build-js', function(){
//     gulp.src(jsFiles, { cwd: jsPath })
//         .pipe(concat(jsOutFile))
//         .pipe(uglify())
//         .pipe(gulp.dest(jsOutPath))
//
// });

gulp.task('build', ['build-css-with-postcss'/*, 'build-js'*/]);