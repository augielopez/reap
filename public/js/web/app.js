'use strict';

// Declare app level module which depends on filters, and services
angular.module('Reap', ['ngRoute']).
  config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
    $locationProvider.hashPrefix('!');

    $routeProvider.
      when('/', {
        templateUrl: '/views/home/splash.html',
        controller: 'SplashCtrl'
      }).
      when('/about', {
        templateUrl: '/views/home/about.html',
        controller: 'SplashCtrl'
      }).
      when('/login', {
        templateUrl: '/views/auth/login.html',
        controller: 'LoginCtrl'
      }).
      when('/signup', {
        templateUrl: '/views/auth/signup.html',
        controller: 'SignupCtrl'
      }).
      when('/studio', {
        templateUrl: '/views/studio/home.html',
        controller: 'StudioCtrl'
        // resolve: {
        //   auth: ['AuthService', function(AuthService) {
        //     AuthService.protectedEndpoint();
        //   }]
        // }
      }).
      otherwise({
        redirectTo: '/'
      })

    
  }])
  // run(['AuthService',
  // function(AuthService) {
  //   AuthService.initialize();
  // }]);
