module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      src: ['src/*.js']
    },
    browserify: {
      lib: {
        src: 'src/glsl-transition.js',
        dest: 'dist/glsl-transition.js',
        options: {
          standalone: "GlslTransition"
        }
      },
      test: {
        src: 'test/index.js',
        dest: 'test/bundle.js',
        options: {
          debug: true
        }
      }
    },
    watch: {
      lib: {
        files: '<%= browserify.lib.src %>',
        tasks: ['jshint', 'browserify:lib']
      },
      test: {
        files: ['test/**.js', '!test/bundle.js'],
        tasks: ['browserify:test']
      }
    },
    'gh-pages': {
      example: {
        options: {
          base: 'example'
        },
        src: ['bundle.js', 'index.html']
      }
    },
    shell: {
      buildExample: {
        options: {
          execOptions: { cwd: "example" }
        },
        command: "npm install && npm run build"
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'browserify', 'watch']);
  grunt.registerTask('publish', ['shell:buildExample', 'gh-pages']);
};
