(function () {
  'use strict';

  angular
    .module('problems.services')
    .factory('ProblemsService', ProblemsService);

  ProblemsService.$inject = ['$resource'];

  function ProblemsService($resource) {
    var Problem = $resource('api/problems/:problemId', {
      problemId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Problem.prototype, {
      createOrUpdate: function() {
        var problem = this;
        return createOrUpdate(problem);
      }
    });

    return Problem;

    function createOrUpdate(problem) {
      if (problem._id) {
        return problem.$update(onSuccess, onError);
      } else {
        return problem.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(article) {
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
