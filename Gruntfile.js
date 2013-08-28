/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 19:39
 * To change this template use File | Settings | File Templates.
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: '\n\n',
                banner: '/*! <%= pkg.project %> - v<%= pkg.version %> - ' +
                    '   <%= grunt.template.today("yyyy-mm-dd") %> */\n\n' +
                    'var ConsoleIO = ("undefined" === typeof module ? {} : module.exports);\n\n' +
                    '(function(){\n\n',
                footer: '\n\nif (typeof define === "function" && define.amd) {\n' +
                    '\tdefine([], function () { return ConsoleIO; });\n' +
                    '}\n\n' +
                    '}());'
            },
            console: {
                src: [
                    'src/util.js',
                    'src/storage.js',
                    'src/events.js',
                    'src/stringify.js',
                    'src/formatter.js',
                    'src/stacktrace.js',
                    'src/transport.js',
                    'src/console.js',
                    'src/client.js',
                    'src/console.io.js',
                    'src/web.js'
                ],

                dest: 'dist/<%= pkg.project %>.js'
            }
        },

        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.project %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            console: {
                files: {
                    'dist/<%= pkg.project %>.min.js': ['<%= concat.console.dest %>']
                }
            }
        },

        jshint: {
            files: ['src/**/*.js', 'app/**/*.js'],
            options: {
                browser: true,
                globals: {
                    ConsoleIO: true,
                    console: true,
                    document: true,
                    module: true
                }
            }
        },

        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);
};