/* gulpfile.js
 * Glup task-runner configruation for project
 * Dependencies: dev-tasks, gulp, gulp-util modules
 * Author: Joshua Carter
 * Created: June 08, 2019
 */
"use strict";
//include modules
var DevOps = require("dev-tasks"),
    fs = require("fs"),
    gulp = require("gulp"),
    log = require("fancy-log"),
    path = require("path"),
    Q = require("q");

//configure dev-tasks
DevOps.init({
    appName: 'adrizer-stocks-project',
    babelExtOptions: {
        "ignore": [
            "./src/styles",
            "*.css"
        ],
        "plugins": [
            ["@babel/plugin-proposal-class-properties", { "loose": true }],
            ["@babel/plugin-proposal-private-methods", { "loose": true }]
            //["transform-import-css", {"generateScopedName": "[local]"}]
        ]
    },
    wpExtOptions: {
        module: {
            rules: [
                undefined,
                undefined,
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
            ],
        }
    },
    wpSingleEntryPoint: "./src/app.js",
    gitCommitterName: 'DevTasks',
    gitCommitterEmail: 'carter.joshua.603@gmail.com'
});



//default gulp task: documentation
gulp.task('default', function () {
    log(
`

Available Gulp Commands:
 - lint
 - build
 - bundle
 - minify
 - release major|minor|patch
`
    );
});

//lint code using ESLint
gulp.task('lint', function (cb) {
    DevOps.lint();
    return cb();
});

//transpile code using babel
gulp.task('build', function () {
    //lint first
    DevOps.lint();
    return DevOps.build();
});

//build code using webpack and babel
gulp.task('bundle', function () {
    //lint first
    DevOps.lint();
    return DevOps.bundle();
});

//build our code and minify it using webpack and babili
gulp.task('minify', function () {
    //lint first
    DevOps.lint();
    //run build again
    return DevOps.bundle().then(function () {
        //now minify
        return DevOps.bundle("production", true);
    }).then(function (stats) {
        return Q.nbind(fs.writeFile)(
            "./webpack-stats.json",
            JSON.stringify(stats.toJson())
        );
    }).catch(err => {
        console.warn("Error writing Webpack stats to file: ", err);
    });
});

//create a new release and push it to master
gulp.task('release', function () {
    return DevOps.release();
});


//create dummy tasks so that we can use non-hyphentated arguments
var dummy = function (cb) {
        return cb();
    },
    dummies = ['patch', 'minor', 'major'];
for (let i=0; i<dummies.length; i++) {
    gulp.task(dummies[i], dummy);
}
