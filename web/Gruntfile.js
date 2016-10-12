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
                        "public_html/ldb.css",
                        "public_html/mobile.css"
                    ]
                }
            }
        },
        uglify: {
            mobile: {
                src: "public_html/departure.js",
                dest: "public_html/departure-min.js"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['cssmin','uglify']);
};
