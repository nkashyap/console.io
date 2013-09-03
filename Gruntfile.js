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
            'client': {
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
                dest: 'dist/client/<%= pkg.project %>.js'
            },
            'app': {
                options: {
                    separator: '\n\n',
                    banner: '/**\n * Name: <%= pkg.project %>\n' +
                        ' * Version: <%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Website: <%= pkg.homepage %>\n' +
                        ' * Author: <%= pkg.author.name %>\n' +
                        ' * Email: <%= pkg.author.email %>\n' +
                        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n'
                },
                src: [
                    'src/app/service/utils.js',
                    'src/app/service/socket.js',
                    'src/app/service/dhtmlxHelper.js',

                    'src/app/model/dhtmlx.js',

                    'src/app/view/app.js',
                    'src/app/view/device/device.js',
                    'src/app/view/**/*.js',

                    'src/app/controller/app.js',
                    'src/app/controller/device/device.js',
                    'src/app/controller/**/*.js',

                    'src/app/settings.js',
                    'src/app/constant.js',
                    'src/app/start.js'
                ],
                dest: 'dist/app/console.app.js'
            },
            'app-css': {
                options: {
                    separator: '\n\n',
                    banner: '/**\n * Name: <%= pkg.project %>\n' +
                        ' * Version: <%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Website: <%= pkg.homepage %>\n' +
                        ' * Author: <%= pkg.author.name %>\n' +
                        ' * Email: <%= pkg.author.email %>\n' +
                        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n'
                },
                src: ['src/app/**/*.css'],
                dest: 'dist/app/console.app.css'
            }
        },

        copy: {
            'client': {
                files: [
                    {
                        src: ['console.css'],
                        dest: 'dist/client/',
                        expand: true,
                        cwd: 'src/app/css/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            },
            'plugins': {
                files: [
                    {
                        src: ['*.*'],
                        dest: 'dist/client/plugins/',
                        expand: true,
                        cwd: 'src/client/plugins/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            },
            'app': {
                files: [
                    {
                        src: ['*.html'],
                        dest: 'dist/app/',
                        expand: true,
                        cwd: 'src/app/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },

        uglify: {
            'client': {
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
                    'dist/client/<%= pkg.project %>.min.js': ['<%= concat["client"].dest %>']
                }
            },
            'plugins': {
                files: {
                    'dist/client/plugins/html2canvas.min.js': ['src/client/plugins/html2canvas.js']
                }
            },
            'app': {
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
                    'dist/app/console.app.min.js': ['<%= concat["app"].dest %>']
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
            'client': {
                options: {
                    reporterOutput: 'dist/client/report/js/junit.xml',
                    globals: {
                        ConsoleIO: true,
                        module: true
                    }
                },
                src: ['src/client/**/*.js']
            },
            'app': {
                options: {
                    reporterOutput: 'dist/app/report/js/junit.xml'
                },
                src: ['src/app/**/*.js']
            }
        },

        csslint: {
            'client': {
                options: {
                    formatters: [
                        { id: 'text', dest: 'dist/client/report/css/text.txt' },
                        { id: 'compact', dest: 'dist/client/report/css/compact.txt' },
                        { id: 'lint-xml', dest: 'dist/client/report/css/lint.xml' },
                        { id: 'csslint-xml', dest: 'dist/client/report/css/csslint.xml' },
                        { id: 'checkstyle-xml', dest: 'dist/client/report/css/checkstyle.xml' },
                        { id: 'junit-xml', dest: 'dist/client/report/css/junit.xml' }
                    ],
                    'import': false
                },
                src: ['src/app/css/console.css']
            },
            'app': {
                options: {
                    formatters: [
                        { id: 'text', dest: 'dist/app/report/css/text.txt' },
                        { id: 'compact', dest: 'dist/app/report/css/compact.txt' },
                        { id: 'lint-xml', dest: 'dist/app/report/css/lint.xml' },
                        { id: 'csslint-xml', dest: 'dist/app/report/css/csslint.xml' },
                        { id: 'checkstyle-xml', dest: 'dist/app/report/css/checkstyle.xml' },
                        { id: 'junit-xml', dest: 'dist/app/report/css/junit.xml' }
                    ],
                    //'adjoining-classes': false,
                    //'outline-none': false,
                    'regex-selectors': false,
                    'box-model': false,
                    'important': false,
                    'import': false
                },
                src: ['src/app/css/*.css']
            }
        },

        cssmin: {
            'client': {
                options: {
                    banner: '/**\n * Name: <%= pkg.project %>\n' +
                        ' * Version: <%= pkg.version %>\n' +
                        ' * Description: <%= pkg.description %>\n' +
                        ' * Website: <%= pkg.homepage %>\n' +
                        ' * Author: <%= pkg.author.name %>\n' +
                        ' * Email: <%= pkg.author.email %>\n' +
                        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n'
                },
                expand: true,
                cwd: 'src/app/css/',
                src: ['console.css'],
                dest: 'dist/client/',
                ext: '.min.css'
            },
            'app': {
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
                    'dist/app/console.app.min.css': [
                        'src/app/css/console.css',
                        'src/app/css/main.css',
                        'src/app/css/scrollbar.css'
                    ]
                }
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
};