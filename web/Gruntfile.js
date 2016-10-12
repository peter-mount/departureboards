module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    "public_html/departure-min.css": [
                        "public_html/css/bootstrap.min.css",
                        "public_html/css/ldb.css",
                        "public_html/css/mobile.css"
                    ]
                }
            }
        },
        concat: {
            dist: {
                src: [
                    "public_html/js/jquery-3.1.1.min.js",
                    "public_html/js/bootstrap.min.js",
                    "public_html/js/typeahead.min.js",
                    "public_html/js/departure.js"
                ],
                dest: "dist/departure.js"
            }
        },
        uglify: {
            mobile: {
                src: "dist/departure.js",
                dest: "dist/departure-min.js"
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "dist/index.html": "public_html/index.html"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.registerTask('build', ['cssmin', 'concat', 'uglify', 'htmlmin']);
};
