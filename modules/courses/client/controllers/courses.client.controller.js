(function () {
  'use strict';

  angular
    .module('courses')
    .controller('CoursesController', CoursesController);

  CoursesController.$inject = ['$scope', '$state', 'courseResolve', '$window', 'Authentication'];

  function CoursesController($scope, $state, course, $window, Authentication) {
    var vm = this;

    vm.course = course;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.save = save;

    // Save course
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.courseForm');
        return false;
      }

      // Create a new course, or update the current instance
      vm.course.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.manage.courses.view', {
          courseSerial: res.serial
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
