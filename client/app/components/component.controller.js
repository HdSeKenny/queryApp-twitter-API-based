'use strict';

angular.module('queryApp')
  .controller('ComponentCtrl', function ($scope, $routeParams,$location) {
    $scope.menu = [{
      'title': 'Query',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });