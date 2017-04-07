var gulp = require("gulp"),
    browserSync = require("browser-sync").create()
    sass = require("gulp-sass");

//HTTP local server + watching changes in files
gulp.task("serve", ["sass"], function() {
  browserSync.init({
    server: "./"
  });

  gulp.watch("./scss/*.scss", ['sass'])
  gulp.watch("*.html").on("change", browserSync.reload);
  gulp.watch("./js/*.js").on("change", browserSync.reload);
  gulp.watch("./css/*.css").on("change", browserSync.reload);
})

//Compilation SCSS files to CSS
gulp.task("sass", function() {
  console.log("sass");
  return gulp.src("./scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./css"))
        .pipe(browserSync.stream());
})

gulp.task("default", ["serve"]);
