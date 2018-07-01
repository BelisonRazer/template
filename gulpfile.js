var syntax        = 'sass'; // Syntax: sass or scss;

var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync').create();
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync');

		newer         = require('gulp-newer'); // filtered new file
		gulps         = require('gulp-series');
		debug         = require('gulp-debug');
		del           = require('del');
		gulpIf        = require('gulp-if');

gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/main.'+syntax+'')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/public'))
	// .pipe(browserSync.stream())
});

gulp.task('clean', function () {
	return del('public');
});

gulp.task('assets', function () {
    return gulp.src('assets/**', {since: gulp.lastRun("assets")})
        .pipe(newer('public'))
        .pipe(debug({title: 'assets'}))
        .pipe(gulp.dest('public'));
});

gulp.task('images', function () {
	return gulp.src(['blocks/header/**/*.*', '!blocks/**/**/styles/*'], {since: gulp.lastRun("images")})
		.pipe(ignore.exclude('./styles/**/*'))
		.pipe(newer('public'))
		.pipe(debug({title: 'header'}))
		.pipe(gulp.dest('public/blocks/header'))
});

gulp.task('img', function () {
	return gulp.src('img/**/*.*', {since: gulp.lastRun("img")})
		.pipe(newer('public'))
		.pipe(debug({title: 'soft-img'}))
		.pipe(gulp.dest('public/blocks/header'))
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'assets'), 'images', 'img'));

//-------------- js, rsync --------------

gulp.task('js', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	// .pipe(browserSync.reload({ stream: true }))
});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@mysite.com',
		destination: 'mysite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

//-------------- watch, sync --------------

gulp.task('watch', function () {
	gulp.watch('sass/**/*.*', gulp.series('styles'));
	gulp.watch('**/styles/*.*', gulp.series('styles'));
	gulp.watch('**/**/styles/*.*', gulp.series('styles'));
	gulp.watch('assets/**/*.*', gulp.series('assets'));
	gulp.watch('img/**/*.*', gulp.series('img'));
	gulp.watch('**/images/**/*.*', gulp.series('images'));
	gulp.watch('**/**/images/**/*.*', gulp.series('images'));
	gulp.watch('**/**/**/images/**/*.*', gulp.series('images'));
});

gulp.task('serve', function () {
	browserSync.init({server: 'public'})
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));

browserSync.watch('public/**/*.*').on('change', browserSync.reload);

//------------- other -------------

// gulp.task('browser-sync', function() {
// 	browserSync({
// 		server: {
// 			baseDir: 'app'
// 		},
// 		notify: false,
// 		// open: false,
// 		// online: false, // Work Offline Without Internet Connection
// 		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
// 	})
// });

// gulp.task('watch', ['styles', 'js', 'browser-sync'], function() {
// 	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
// 	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
// 	gulp.watch('app/*.html', browserSync.reload)
// });

// gulp.task('default', ['watch']);
