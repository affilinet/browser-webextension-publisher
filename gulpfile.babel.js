
var
    gulp = require('gulp'),
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
    del = require('del'),
    usemin = require('gulp-usemin'),
    sass = require('gulp-sass');


import fs from "fs";
import {merge} from 'event-stream'
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import preprocessify from 'preprocessify';
import gulpif from "gulp-if";


const $ = require('gulp-load-plugins')();


const paths = {
    scripts: 'src/settings-page/js/**/*.*',
    less: 'src/settings-page/less/**/*.*',
    cssOutput: 'src/settings-page/css/',
    images: 'src/settings-page/img/**/*.*',
    templates: 'src/settings-page/templates/**/*.html',
    angularLocales: 'src/_locales/**/settings-page.json',
    index: 'src/settings-page/*.html',
    bower_fonts: 'src/settings-page/fonts/*.{ttf,woff,eof,svg}'
};



let production = process.env.NODE_ENV === "production";
let target = process.env.TARGET || "chrome";
let environment = process.env.NODE_ENV || "development";

console.log('TARGET', target);
console.log('environment', environment);


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
gulp.task('clean', function(){
    return del([`./build/${target}`])
})






// -----------------
// COMMON
// -----------------
gulp.task('js', gulp.series(() => {
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
}))

gulp.task('styles', gulp.series(() => {
    return gulp.src('src/styles/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(`build/${target}/styles`));

}));

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



gulp.task('ext', (cb) => {
  gulp.series('manifest', 'js');
  pipe('./src/icons/**/*', `./build/${target}/icons`);
  pipe(['./src/_locales/**/*'], `./build/${target}/_locales`);
  pipe([`./src/images/${target}/**/*`], `./build/${target}/images`);
  pipe(['./src/images/shared/**/*'], `./build/${target}/images`);
  pipe(['./src/*.html'], `./build/${target}`);
  cb()
});


gulp.task('copyDependencies', () => {
    return gulp.src('node_modules/papaparse/papaparse.min.js')
        .pipe(gulp.dest(`src/scripts/services`));
});


gulp.task('copyStaticFiles',  (done) => {
    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest(`build/${target}/fonts`));

    gulp.src(paths.angularLocales)
        .pipe(gulp.dest(`build/${target}/settings-page/locales/`));
    done()
});

// -----------------
// DIST
// -----------------


gulp.task('zip', (cb) => {
    pipe(`./build/${target}/**/*`, $.zip(`${target}.zip`), './dist');
    cb();
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

gulp.task('copy-locales', function() {
    return gulp.src(paths.angularLocales)
        .pipe(gulp.dest(paths.angularLocalesOutput));
});


gulp.task('build-settings-page', gulp.series('minify', 'copy-bower-fonts', 'custom-templates', 'custom-images', 'custom-js', 'custom-less' ));



// Helpers
function pipe(src, ...transforms) {
    return transforms.reduce((stream, transform) => {
        const isDest = typeof transform === 'string'
        return stream.pipe(isDest ? gulp.dest(transform) : transform)
    }, gulp.src(src))
}



gulp.task('build', (cb) => {
  gulp.series('clean', 'copyDependencies', 'copyStaticFiles', 'build-settings-page', 'styles', 'ext');
  cb();
});
gulp.task('dist', gulp.series('build', 'zip'));

gulp.task('watch', (cb) => {
  $.livereload.listen();

  gulp.watch('./src/**/*').on('change', function(event) {
    gulp.series('build', function() {
      $.livereload.reload()
    })

  });
  cb()
});


gulp.task('default',  gulp.series('build'));