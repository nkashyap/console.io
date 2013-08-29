/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 19:39
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Grunt Build file
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: '\n\n',
                banner: '/**\n * Name: <%= pkg.project %>\n' +
                    ' * Version: <%= pkg.version %>\n' +
                    ' * Description: <%= pkg.description %>\n' +
                    ' * Website: <%= pkg.homepage %>\n' +
                    ' * Author: <%= pkg.author.name %>\n' +
                    ' * Email: <%= pkg.author.email %>\n' +
                    ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n' +
                    'var ConsoleIO = ("undefined" === typeof module ? {} : module.exports);\n' +
                    'ConsoleIO.version = "<%= pkg.version %>";\n\n' +
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
                    'src/config.js',
                    'src/web.js'
                ],

                dest: 'dist/<%= pkg.project %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/**\n * Name: <%= pkg.project %>\n' +
                    ' * Version: <%= pkg.version %>\n' +
                    ' * Description: <%= pkg.description %>\n' +
                    ' * Website: <%= pkg.homepage %>\n' +
                    ' * Author: <%= pkg.author.name %>\n' +
                    ' * Email: <%= pkg.author.email %>\n' +
                    ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n'
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