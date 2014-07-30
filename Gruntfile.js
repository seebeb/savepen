module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
      css: {
        src: [
          'public/component/bootstrap/dist/css/bootstrap.min.css',
          'public/component/font-awesome/font-awesome.min.css',
          'public/stylesheets/style.css'
        ],
        dest: 'public/stylesheets/dist.css'
      },
      js: {
        src: [
          'public/component/jquery/dist/jquery.min.js',
          'public/component/bootstrap/dist/js/bootstrap.min.js'
        ],
        dest: 'public/javascripts/dist.js'
      }
    },
    cssmin: {
      css: {
        src: 'public/stylesheets/dist.css',
        dest: 'public/stylesheets/dist.css'
      }
    },
    uglify: {
      js: {
        files: {
          'public/javascripts/dist.js': ['public/javascripts/dist.js']
        }
      }
    },
    copy: {
      img: {
        expand: true,
        cwd: 'public/component/',
        src: ['**/*.jpg', '**/*.png', '**/*.jpeg'],
        dest: 'public/images/',
        flatten: true,
        filter: 'isFile',
      },
      fonts: {
        expand: true,
        cwd: 'public/component/',
        src: ['**/*.eot', '**/*.svg', '**/*.ttf', '**/*.woff', '**/*.otf'],
        dest: 'public/fonts/',
        flatten: true,
        filter: 'isFile',
      },
    },
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', [
    'concat:css',
    'cssmin:css',
    'concat:js',
    'uglify:js',
    'copy:fonts'
  ]);
};
