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
                titleTarget: /<!--DECK-TITLE-->/,
                slidesTarget: /<!--DECK-SLIDES-->/
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
                files: [ 'gruntfile.js', '*.json' ],
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

        <title><!--DECK-TITLE--></title>

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
                <!--DECK-SLIDES-->
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
        let deck = grunt.option('deck') || '';
        if (deck === '') {
            grunt.fail.fatal('No deck specified');
        }

        let deckOption = grunt.file.readJSON(deck);

        let data = grunt.task.current.data;

        let src = data.src;
        let slidesTarget = data.slidesTarget;
        let titleTarget = data.titleTarget;
        let content = deckOption.files;
        let title = deckOption.title || 'Untitled';

        content = content.map(f => {
            return grunt.file.read(f);
        });

        let srcContent = grunt.file.read(src);
        srcContent = srcContent.replace(slidesTarget, content.join("\n"));
        srcContent = srcContent.replace(titleTarget, title);
        grunt.file.write(src, srcContent);
    });

    grunt.registerTask('rebundle', [ 'mkdir:dev', 'clean:dev', 'copy:dev', 'blankIndex:dev', 'injectContent:dev' ]);
};