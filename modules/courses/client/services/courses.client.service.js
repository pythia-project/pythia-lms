(function () {
  'use strict';

  angular
    .module('courses.services')
    .factory('CoursesService', CoursesService);

  CoursesService.$inject = ['$resource'];

  function CoursesService($resource) {
    var Course = $resource('api/courses/:courseSerial', {
      courseSerial: ''
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Course.prototype, {
      createOrUpdate: function() {
        var course = this;
        return createOrUpdate(course);
      }
    });

    return Course;

    function createOrUpdate(course) {
      if (course._id) {
        return course.$update(onSuccess, onError);
      } else {
        return course.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(course) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      console.log(error);
    }
  }
}());
