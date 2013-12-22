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
    }
  });

  grunt.registerTask('default', ['jshint', 'watch']);
};
