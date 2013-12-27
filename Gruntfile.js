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
      }
    },
    watch: {
      lib: {
        files: '<%= jshint.src %>',
        tasks: ['jshint', 'browserify']
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
