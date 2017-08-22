
var
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-minify-css'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    minifyHTML = require('gulp-minify-html'),
    addsrc = require('gulp-add-src'),
    templateCache = require('gulp-angular-templatecache'),
    template = require('gulp-template'),
    modify = require('gulp-modify'),
    jsonFormat = require('gulp-json-format'),
    csv2json = require('gulp-csv2json');



import fs from "fs";
import gulp from 'gulp';
import {merge} from 'event-stream'
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import preprocessify from 'preprocessify';
import gulpif from "gulp-if";


const $ = require('gulp-load-plugins')();


const paths = {
    scripts: 'src/settings-page/js/**/*.*',
    csvFiles: 'resources/*.csv',
    less: 'src/settings-page/less/**/*.*',
    cssOutput: 'src/settings-page/css/',
    images: 'src/settings-page/img/**/*.*',
    templates: 'src/settings-page/templates/**/*.html',
    index: 'src/settings-page/*.html',
    bower_fonts: 'src/settings-page/fonts/*.{ttf,woff,eof,svg}'
};



let production = process.env.NODE_ENV === "production";
let target = process.env.TARGET || "chrome";
let environment = process.env.NODE_ENV || "development";

let generic = JSON.parse(fs.readFileSync(`./config/${environment}.json`));
let specific = JSON.parse(fs.readFileSync(`./config/${target}.json`));
let context = Object.assign({}, generic, specific);

const settingsPageDir = `./build/${target}/settings-page`;

let manifest = {
    dev: {
        "background": {
            "scripts": [
               // "scripts/livereload.js",
               // "scripts/background.js"
            ]
        }
    },

    firefox: {
        "applications": {
            "gecko": {
                "id": "affilinet-toolbar@affili.net"
            }
        }
    }
}

// Tasks
gulp.task('clean', () => {
    return pipe(`./build/${target}`, $.clean())
})

gulp.task('build', (cb) => {
    $.runSequence('clean', 'copyDependencies', 'copyCSVFiles', 'build-settings-page', 'styles', 'ext', cb)
});

gulp.task('watch', ['build'], () => {
    $.livereload.listen();


    gulp.watch(
        ['./src/**/*']
    ).on("change", () => {
        $.runSequence('build', $.livereload.reload);
    });
});

gulp.task('default', ['build']);


gulp.task('ext', ['manifest', 'js'], () => {
    return mergeAll(target)
});


// -----------------
// COMMON
// -----------------
gulp.task('js', () => {
    return buildJS(target)
})

gulp.task('styles', () => {
    return gulp.src('src/styles/**/*.scss')
        .pipe($.plumber())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe(gulp.dest(`build/${target}/styles`));
});

gulp.task("manifest", () => {
    return gulp.src('./manifest.json')
        .pipe(gulpif(!production, $.mergeJson({
            fileName: "manifest.json",
            jsonSpace: " ".repeat(4),
            endObj: manifest.dev
        })))
        .pipe(gulpif(target === "firefox", $.mergeJson({
            fileName: "manifest.json",
            jsonSpace: " ".repeat(4),
            endObj: manifest.firefox
        })))
        .pipe(gulp.dest(`./build/${target}`))
});



gulp.task('copyDependencies', () => {
    return gulp.src('node_modules/papaparse/papaparse.min.js')
        .pipe(gulp.dest(`src/scripts/services`));
});


gulp.task('copyCSVFiles',  () => {

    gulp.src('./resources/*.csv')
        .pipe(gulp.dest('./src/data'));

    gulp.src('./resources/*.csv')
        .pipe(gulp.dest(`build/${target}/data`));
});

// -----------------
// DIST
// -----------------
gulp.task('dist', (cb) => {
    $.runSequence('build', 'zip', cb)
});

gulp.task('zip', () => {
    return pipe(`./build/${target}/**/*`, $.zip(`${target}.zip`), './dist')
})


// -----------------
// SETTINGS PAGE (angular)
// -----------------


/**
 * Handle bower components from index
 */
gulp.task('minify', function() {
    return gulp.src(paths.index)
        .pipe(usemin({
            js: ['concat'],
            css: ['concat']
        }))

        .pipe(usemin({
            js: [minifyJs(), 'concat'],
            css: [minifyCss({keepSpecialComments: 0}), 'concat'],
        }))

        .pipe(gulp.dest(settingsPageDir));
});

/**
 * Copy assets
 */

gulp.task('copy-bower-fonts', function() {
    return gulp.src(paths.bower_fonts)
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest(settingsPageDir +'/lib'));
});

/**
 * Handle custom files
 */


gulp.task('custom-templates', function() {
    return  gulp.src(paths.templates)
        .pipe(templateCache({'module' : 'template',  root:'templates', standalone : true}))
        .pipe(gulp.dest( settingsPageDir +'/js'));

});

gulp.task('custom-images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest( settingsPageDir + '/img'));
});

gulp.task('custom-js', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('dashboard.min.js'))
        .pipe(gulp.dest( settingsPageDir + '/js'));
});

gulp.task('custom-less', function() {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(gulp.dest(paths.cssOutput));
});


gulp.task('build-settings-page', ['minify', 'copy-bower-fonts', 'custom-templates', 'custom-images', 'custom-js', 'custom-less' ]);




// Helpers
function pipe(src, ...transforms) {
    return transforms.reduce((stream, transform) => {
        const isDest = typeof transform === 'string'
        return stream.pipe(isDest ? gulp.dest(transform) : transform)
    }, gulp.src(src))
}

function mergeAll(dest) {
    return merge(
        pipe('./src/icons/**/*', `./build/${dest}/icons`),
        pipe(['./src/_locales/**/*'], `./build/${dest}/_locales`),
        pipe([`./src/images/${target}/**/*`], `./build/${dest}/images`),
        pipe(['./src/images/shared/**/*'], `./build/${dest}/images`),
        pipe(['./src/*.html'], `./build/${dest}`)
    )
}

function buildJS(target) {
    const files = [
        'background.js',
        'contentscript.js',
        'popup.js',
        'livereload.js',
        'services/publisherWebservice.js',
        'utils/ext.js',
        'utils/storage.js',
    ];

    let tasks = files.map(file => {
        return browserify({
            entries: 'src/scripts/' + file,
            debug: true
        })
            .transform('babelify', {presets: ['es2015']})
            .transform(preprocessify, {
                includeExtensions: ['.js'],
                context: context
            })
            .bundle()
            .pipe(source(file))
            .pipe(buffer())
            .pipe(gulpif(!production, $.sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(!production, $.sourcemaps.write('./')))
            .pipe(gulpif(production, $.uglify({
                "mangle": false,
                "output": {
                    "ascii_only": true
                }
            })))
            .pipe(gulp.dest(`build/${target}/scripts`));
    });

    return merge.apply(null, tasks);
}