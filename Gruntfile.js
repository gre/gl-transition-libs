module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      src: ['src/*.js']
    },
    watch: {
      lib: {
        files: '<%= jshint.src %>',
        tasks: ['jshint']
      }
    },
    'gh-pages': {
      options: {
        base: 'example'
      },
      src: ['**']
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

  grunt.registerTask('default', ['jshint', 'watch']);
  grunt.registerTask('publish', ['shell:buildExample', 'gh-pages']);
};
