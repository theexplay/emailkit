// Gulp module imports
import { src, dest, watch, parallel, series } from 'gulp';
import livereload from 'gulp-livereload';
import pug from 'gulp-pug';
import gulpif from 'gulp-if';
import notify from 'gulp-notify';

const emitty = require('emitty').setup('src', 'pug');

// Build Directories
// ----
const dirs = {
    pug: {
        src: './src',
        dest: './build/html'
    }
};

// File Sources
// ----
const sources = {
    pug: `./src/*.pug`,
    pugWatch: `./src/**/*.pug`,
};

export const buildPug = () => {
    let condition = (file) => (/.minify.pug/.test(file.path));

    return new Promise((resolve, reject) => {
        emitty.scan(global.emittyChangedFile).then(() => {
            src(sources.pug)
                .pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
                .pipe(gulpif(condition, pug({pretty: false}), pug({pretty: true})))
                .on('error', notify.onError({
                    title: "Error in Pug building",
                    message: "<%= error.name %>: <%= error.message %>"
                }))
                .pipe(dest(dirs.pug.dest))
                .pipe(livereload())
                .on('end', resolve)
                .on('error', reject);
        });
    });
};

// Watch Task
export const devWatch = () => {
    global.watch = true;
    livereload.listen();

    watch(sources.pugWatch, series('buildPug'))
        .on('all', (event, filepath) => {
            global.emittyChangedFile = filepath;
        });
};

// Development Task
export const dev = series(buildPug, devWatch);

// Собрать только pug файлы
export const build = buildPug;
