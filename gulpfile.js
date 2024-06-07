const {
  task,
  src,
  dest,
  series,
} = require('gulp');

const ts = require('gulp-typescript');
const sass = require('gulp-dart-sass');

// has to match the outDir in tsconfig.json
const outDir = 'dist'
// has to match the assets directories specified in server.ts
const assetsPath = `${outDir}/public`;

// ------------------------ TypeScript ------------------------ 
const tsProject = ts.createProject('tsconfig.json');
task('compile-typescript', () => tsProject.src().pipe(tsProject()).js.pipe(dest(outDir)));

// ------------------------ Bundle ------------------------ 
task('bundle-views', () => src(['./app/**/*.njk'], { base: '' }).pipe(dest(outDir)));
task('bundle-locales', () => src(['./app/**/*.yaml'], { base: '' }).pipe(dest(outDir)));
task('bundle', series(['bundle-views', 'bundle-locales']));

// ------------------------ Static Assets ------------------------ 
// we grab our custom SASS files, as well as the required stylesheets from govuk library
task('sass', () => src(['./app/assets/stylesheets/*.scss'])
  .pipe(sass({
    errLogToConsole: true,
    outputStyle: 'compressed',
    includePaths: [
      'node_modules/govuk_frontend_toolkit/stylesheets',
      'node_modules/govuk-elements-sass/public/sass'
    ]
  }).on('error', sass.logError))
  .pipe(dest(`${assetsPath}/css`))
);

task('js', () => src(['./app/assets/javascript/*.js'])
  .pipe(dest(`${assetsPath}/javascript`))
);

// we need to get CASA default images, like the Crown image
task('img', () => src(['./node_modules/govuk-frontend/govuk/assets/images/**/*'])
  .pipe(dest(`${assetsPath}/images`))
);

// we need to get fonts that are used by CASA
task('fonts', () => src(['./node_modules/govuk-frontend/govuk/assets/fonts/**/*'])
  .pipe(dest(`${assetsPath}/fonts`))
);

task('build', series(['sass', 'js', 'img', 'fonts']));

// ------------------------ Compile ------------------------ 
task('compile', series(['compile-typescript', 'bundle', 'build']));
