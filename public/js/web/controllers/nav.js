angular.module('Reap').
  controller('NavCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.activeSet = function(){
      if ($location.path() == '/about') {
        return 'about';
      } else if ($location.path() == '/login') {
        return 'login';
      } else {
        return false;
      }
    }

  }]);
