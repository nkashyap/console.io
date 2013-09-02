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
            'console-client': {
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
                dest: 'dist/console.io-client/<%= pkg.project %>.js'
            }
        },

        copy: {
            'console-client': {
                files: [
                    {
                        src: ['console.io.css'],
                        dest: 'dist/console.io-client/',
                        expand: true,
                        cwd: 'app/resources/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            },
            'console-plugins': {
                files: [
                    {
                        src: ['*.*'],
                        dest: 'dist/console.io-client/plugins/',
                        expand: true,
                        cwd: 'src/plugins/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },

        uglify: {
            'console-client': {
                options: {
                    banner: '/**\n * Name: <%= pkg.project %>\n' +
                        ' * Version: <%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Website: <%= pkg.homepage %>\n' +
                        ' * Author: <%= pkg.author.name %>\n' +
                        ' * Email: <%= pkg.author.email %>\n' +
                        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n'
                },
                files: {
                    'dist/console.io-client/<%= pkg.project %>.min.js': ['<%= concat["console-client"].dest %>']
                }
            },
            'console-plugins': {
                files: {
                    'dist/console.io-client/plugins/html2canvas.min.js': ['src/plugins/html2canvas.js']
                }
            }
        },

//        jshint: {
//            files: ['src/**/*.js', 'app/**/*.js'],
//            options: {
//                browser: true,
//                globals: {
//                    ConsoleIO: true,
//                    console: true,
//                    document: true,
//                    module: true
//                }
//            }
//        },

//        csslint: {
//            lax: {
//                options: {
//                    import: false
//                },
//                src: ['app/**/*.css']
//            }
//        },

        cssmin: {
            'console-client': {
                options: {
                    banner: '/**\n * Name: <%= pkg.project %>\n' +
                        ' * Version: <%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Website: <%= pkg.homepage %>\n' +
                        ' * Author: <%= pkg.author.name %>\n' +
                        ' * Email: <%= pkg.author.email %>\n' +
                        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n'
                },
                expand: true,
                cwd: 'app/resources/',
                src: ['console.io.css'],
                dest: 'dist/console.io-client/',
                ext: '.io.min.css'
            }
        },

//        compile: {
//            name: '<%= pkg.project %>',
//            description: '<%= pkg.description %>',
//            version: '<%= pkg.version %>',
//            url: '<%= pkg.homepage %>',
//            options: {
//                paths: 'src/',
//                outdir: 'dist/'
//            }
//        },

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
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'copy', 'cssmin', 'uglify']);
};