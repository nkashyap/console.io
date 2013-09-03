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
                    'src/client/util.js',
                    'src/client/storage.js',
                    'src/client/events.js',
                    'src/client/stringify.js',
                    'src/client/formatter.js',
                    'src/client/stacktrace.js',
                    'src/client/transport.js',
                    'src/client/console.js',
                    'src/client/client.js',
                    'src/client/config.js',
                    'src/client/web.js'
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
                        cwd: 'src/client/plugins/',
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
                    'dist/console.io-client/plugins/html2canvas.min.js': ['src/client/plugins/html2canvas.js']
                }
            }
        },

        jshint: {
            options: {
                reporter: 'jslint',
                browser: true,
                devel: true,
                force: true
            },
            'console-client': {
                options: {
                    reporterOutput: 'dist/console.io-client/report/js/junit.xml',
                    globals: {
                        ConsoleIO: true,
                        module: true
                    }
                },
                src: ['src/client/**/*.js']
            },
            'console-app': {
                options: {
                    reporterOutput: 'dist/console.io-app/report/js/junit.xml'
                },
                src: ['app/**/*.js']
            }
        },

        csslint: {
            'console-client': {
                options: {
                    formatters: [
                        { id: 'text', dest: 'dist/console.io-client/report/css/text.txt' },
                        { id: 'compact', dest: 'dist/console.io-client/report/css/compact.txt' },
                        { id: 'lint-xml', dest: 'dist/console.io-client/report/css/lint.xml' },
                        { id: 'csslint-xml', dest: 'dist/console.io-client/report/css/csslint.xml' },
                        { id: 'checkstyle-xml', dest: 'dist/console.io-client/report/css/checkstyle.xml' },
                        { id: 'junit-xml', dest: 'dist/console.io-client/report/css/junit.xml' }
                    ],
                    'import': false
                },
                src: ['app/resources/console.io.css']
            },
            'console-app': {
                options: {
                    formatters: [
                        { id: 'text', dest: 'dist/console.io-app/report/css/text.txt' },
                        { id: 'compact', dest: 'dist/console.io-app/report/css/compact.txt' },
                        { id: 'lint-xml', dest: 'dist/console.io-app/report/css/lint.xml' },
                        { id: 'csslint-xml', dest: 'dist/console.io-app/report/css/csslint.xml' },
                        { id: 'checkstyle-xml', dest: 'dist/console.io-app/report/css/checkstyle.xml' },
                        { id: 'junit-xml', dest: 'dist/console.io-app/report/css/junit.xml' }
                    ],
                    //'adjoining-classes': false,
                    //'outline-none': false,
                    'regex-selectors': false,
                    'box-model': false,
                    'important': false,
                    'import': false
                },
                src: ['app/resources/**/*.css']
            }
        },

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
    grunt.registerTask('default', ['jshint', 'csslint', 'concat', 'copy', 'cssmin', 'uglify']);
    //grunt.registerTask('default', ['concat', 'copy', 'cssmin', 'uglify']);
};