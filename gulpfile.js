/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

const fs = require('fs'),
      path = require('path'),
      gulp = require('gulp'),
      del = require('del'),
      runSequence = require('run-sequence'),
      bs = require('browser-sync'),
      gulpLoadPlugins = require('gulp-load-plugins'),
      swPrecache = require('sw-precache'),
      pkg = require('./package.json'),
      critical = require('critical').stream,

      autoprefixer = require('autoprefixer'),
      cssimport = require('postcss-import'),
      cssvars = require('postcss-custom-properties'),
      // inlinesource = require('gulp-inline-source'),
      // gcmq = require('gulp-group-css-media-queries'),

      $ = gulpLoadPlugins(),
      browserSync = bs.create(),
      reload = browserSync.reload;


// Optimize images
gulp.task('images', ['webp'], () =>
  gulp.src(['app/images/**/*.{jpg,png,svg}', '!app/images/sprite/*', '!app/images/svg/*'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.stream())
    .pipe($.size({title: 'images'}))
);

// Convert images to WebP
gulp.task('webp', () => {
  return gulp.src(['app/images/**/*.{jpg,png}', '!app/images/sprite/*'])
    .pipe($.webp({
      quality: 85
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'webp'}));
});

// Clean cache
gulp.task('cleanCache', () => {
  return $.cache.clearAll();
});

// Sprite images
// gulp.task('sprite', () => {
//   var spriteData =
//   gulp.src('app/images/sprite/*.*') // raw images for sprite path
//   .pipe($.spritesmith({
//     imgName: 'sprite.png',
//     cssName: '_sprite.scss',
//     cssFormat: 'scss',
//     padding: 3,
//     cssTemplate: 'scss.template.mustache',
//     algorithm: 'binary-tree'
//   }));
//
//   spriteData.img.pipe(gulp.dest('app/images/')); // path for compiled sprite image
//   spriteData.css.pipe(gulp.dest('app/styles/')); // path for compiled sprite variables
// });

// Copy fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// SVG copy
// gulp.task('svgCopy', () => {
//   return gulp.src(['app/images/svg/**'])
//     .pipe(gulp.dest('dist/images/svg'))
//     .pipe($.size({title: 'copy SVG'}));
// });

// Copy all files from the root level (app)
gulp.task('copy', ['fonts'], () =>
  gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  var plugins = [
    cssimport,
    autoprefixer({browsers: ['> 1%'], cascade: false}),
    cssvars
  ];

  return gulp.src([
    'app/styles/main.css',
    'app/styles/desktop.css'
  ])
    // .pipe($.newer('.tmp/styles'))
    // .pipe(gulp.dest('.tmp/styles'))
    .pipe($.postcss(plugins))
    .pipe($.if('*.css', $.cssnano({
      discardUnused: false
    })))
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('critical', () => {
  return gulp.src('dist/*.html')
    .pipe(critical({
      base: 'dist/',
      src: 'index.html',
      css: ['dist/styles/main.min.css'],
      dest: 'styles/critical.css',
      dimensions: [{
        width: 320,
        height: 480
      },{
        width: 768,
        height: 1024
      },{
        width: 1366,
        height: 960
      }],
      minify: true,
      ignore: ['@font-face']
    }))
    .pipe($.size({title: 'critical'}))
    .pipe(gulp.dest('dist/styles'));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enables ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
var scriptsArray = [
  './app/scripts/vue.js',
  // './app/scripts/vue.min.js',
  './app/scripts/dragscroll.js',
  './app/scripts/main.js'
];

var scriptsArrayProd = [
  // './app/scripts/vue.js',
  './app/scripts/vue.min.js',
  './app/scripts/dragscroll.js',
  './app/scripts/main.js'
];

// Copy basket.js
gulp.task('copyScripts', () => {
    gulp.src([
      './app/scripts/fontfaceobserver.min.js',
      './app/scripts/fontfacesnippet.js',
    ])
      .pipe($.size({title: 'copyScripts'}))
      .pipe(gulp.dest('dist/scripts'))
    }
);

function handleError (error) {
  console.log(error.toString());
  this.emit('end');
}


// Concatenate all scripts
gulp.task('scripts', ['copyScripts'], () => {
    gulp.src(scriptsArray)
      .pipe($.babel())
      .on('error', handleError)
      .pipe($.concat('main.js'))
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/scripts'))
    }
);

// Concatenate & minify all scripts
gulp.task('scriptsProd', ['copyScripts'], () => {
    gulp.src(scriptsArrayProd)
      .pipe($.babel())
      .on('error', handleError)
      .pipe($.concat('main.js'))
      .pipe($.uglify({preserveComments: 'some'}).on('error', function(uglify) {
        console.error(uglify.message);
        this.emit('end');
      }))
      .pipe($.size({title: 'scriptsProd'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/scripts'))
    }
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: false
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Inline styles and scripts in html-file
// gulp.task('inline', () => {
//   return gulp.src('dist/*.html')
//   .pipe(inlinesource())
//   .pipe(gulp.dest('dist/'));
// });

// Clean output directory
gulp.task('clean', cb => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Clean after build
gulp.task('cleanAfter', cb => del([
  'dist/styles/critical.css',
  'dist/styles/index.css',
  'dist/images/sprite/**'
], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['default'], () => {
  browserSync.init({
    notify: true,
    server: ['.tmp', 'dist'],
    reloadDelay: 800,
    port: 3000,
    ghostMode: false
  });

  gulp.watch(['app/**/*.html'], ['html', reload]);
  gulp.watch(['app/styles/**/*.css'], ['styles']);
  gulp.watch(['app/scripts/**/*.js'], ['scripts', reload]);
  gulp.watch(['app/images/**/*.{jpg,png}', '!app/images/sprite/*'], ['images']);
});

// Build dev files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    ['cleanCache', 'html', 'scripts', 'images', 'styles'],
    'copy',
    'generate-service-worker',
    cb
  )
);

// Build production files, the default task
gulp.task('build', ['clean'], cb =>
  runSequence(
    ['cleanCache', 'html', 'scriptsProd', 'images', 'styles'],
    ['copy'],
    'generate-service-worker',
    // , 'critical'
    // 'inline',
    // 'cleanAfter',
    cb
  )
);

gulp.task('copy-sw-scripts', () => {
  return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', 'app/scripts/sw/runtime-caching.js'])
    .pipe(gulp.dest('dist/scripts/sw'));
});

gulp.task('generate-service-worker', ['copy-sw-scripts'], () => {
  const rootDir = 'dist';
  const filepath = path.join(rootDir, 'service-worker.js');

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || 'kyivstar-app',
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: [
      'scripts/sw/sw-toolbox.js',
      'scripts/sw/runtime-caching.js'
    ],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${rootDir}/images/**/*`,
      `${rootDir}/fonts/**/*.woff2`,
      `${rootDir}/scripts/**/*.js`,
      `${rootDir}/styles/**/*.css`,
      `${rootDir}/*.{html,json}`
    ],
    // Translates a static file path to the relative URL that it's served from.
    // This is '/' rather than path.sep because the paths returned from
    // glob always use '/'.
    stripPrefix: rootDir + '/'
  });
});
