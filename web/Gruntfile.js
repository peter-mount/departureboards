/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
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
        concat:{
            dist: {
                src: [
                    "public_html/js/jquery-3.1.1.min.js",
                    "public_html/js/bootstrap.min.js",
                    "public_html/js/typeahead.min.js",
                    "public_html/js/departure.js"
                ],
                dest: "public_html/departure.js"
            }
        },
        uglify: {
            mobile: {
                src: "public_html/departure.js",
                dest: "public_html/departure-min.js"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['cssmin','concat','uglify']);
};
