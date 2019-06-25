module.exports = grunt => {

    require('load-grunt-tasks')(grunt);

    let port = grunt.option('port') || 8000;
    let root = grunt.option('root') || '.';

    if (!Array.isArray(root)) root = [root];
    let tmpPath = root.map(path => path + '/.tmp');

    grunt.initConfig({
        // pkg: grunt.file.readJSON('package.json'),

        blankIndex: {
            dev: {
                title: 'Test',
                theme: 'black'
            }
        },

        connect: {
            server: {
                options: {
                    port: port,
                    base: tmpPath,
                    livereload: true,
                    open: true,
                    useAvailablePort: true
                }
            }
        },

        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        src: [
                            'slides/*.html'
                        ],
                        dest: tmpPath.join('/')
                    },
                    {
                        expand: true,
                        cwd:'node_modules/reveal.js',
                        src: [
                            'index.html',
                            'lib/**',
                            'js/**',
                            'css/**',
                            'plugin/**'
                        ],
                        dest: tmpPath.join('/')
                    }
                ]
            }
        },

        clean: {
            dev: [ 
                tmpPath.join('/')
            ]
        },

        injectContent: {
            dev: {
                src: tmpPath.join('/') + '/index.html',
                target: /<!--DECK-->/,
                files: [
                    'slides/slide1.html',
                    'slides/slide2.html',
                    'slides/slide3.html',
                    'slides/slide4.html',
                    'slides/slide5.html',
                    'slides/slide6.html',
                    'slides/slide7.html'
                ]
            }
        },

        mkdir: {
            dev: {
                options: {
                    creates: [
                        tmpPath
                    ]
                }
            }
        },

        watch: {
            js: {
                files: [ 'gruntfile.js' ],
                tasks: [ 'rebundle' ]
            },
            html: {
                files: root.map(path => path + '/slides/*.html'),
                tasks: [ 'rebundle' ]
            },
            options: {
                livereload: true
            }
        }
    });

    grunt.registerTask('serve', ['rebundle', 'connect', 'watch']);

    grunt.registerMultiTask('blankIndex', 'Create blank index', () => {
        let data = grunt.task.current.data;

        htmlContent = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

        <title>${data.title}</title>

        <link rel="stylesheet" href="css/reset.css">
        <link rel="stylesheet" href="css/reveal.css">
        <link rel="stylesheet" href="css/theme/${data.theme}.css">

        <!-- Theme used for syntax highlighting of code -->
        <link rel="stylesheet" href="lib/css/monokai.css">

        <!-- Printing and PDF exports -->
        <script>
            var link = document.createElement( 'link' );
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = window.location.search.match( /print-pdf/gi ) ? 'css/print/pdf.css' : 'css/print/paper.css';
            document.getElementsByTagName( 'head' )[0].appendChild( link );
        </script>
    </head>
    <body>
        <div class="reveal">
            <div class="slides">
                <!--DECK-->
            </div>
        </div>

        <script src="js/reveal.js"></script>

        <script>
            // More info about config & dependencies:
            // - https://github.com/hakimel/reveal.js#configuration
            // - https://github.com/hakimel/reveal.js#dependencies
            Reveal.initialize({
                dependencies: [
                    { src: 'plugin/markdown/marked.js' },
                    { src: 'plugin/markdown/markdown.js' },
                    { src: 'plugin/notes/notes.js', async: true },
                    { src: 'plugin/highlight/highlight.js', async: true }
                ]
            });
        </script>
    </body>
</html>`;
        grunt.file.write(tmpPath.join('/') + '/index.html', htmlContent);
    });

    grunt.registerMultiTask('injectContent', 'Inject multiple files content into a file', () => {
        let data = grunt.task.current.data;

        let src = data.src;
        let target = data.target;
        let content = data.files;

        content = content.map(f => {
            return grunt.file.read(f);
        });

        let srcContent = grunt.file.read(src);
        srcContent = srcContent.replace(target, content.join("\n"));
        grunt.file.write(src, srcContent);
    });

    grunt.registerTask('rebundle', [ 'mkdir:dev', 'clean:dev', 'copy:dev', 'blankIndex:dev', 'injectContent:dev' ]);
};