var designMixer = angular.module('DesignMixer', ['ui.router']);

designMixer.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $stateProvider.state('thumbs', {
    url: '/',
    controller: 'Thumbs.controller',
    templateUrl: '/templates/thumbs.html'
  });

    $stateProvider.state('detail', {
      url: '/detail',
      controller: 'Detail.controller',
      templateUrl: '/templates/detail.html'
    });
  }]);

designMixer.controller('Thumbs.controller', function ($scope) {
  function genBrick() {
    var height = ~~(Math.random() * 500) + 100;
    var id = ~~(Math.random() * 10000);
    return {
      src: 'http://lorempixel.com/280/' + height + '/?' + id
    };
  }

  $scope.bricks = [
    genBrick(),
    genBrick(),
    genBrick(),
    genBrick(),
    genBrick(),
    genBrick()
  ];

  $scope.add = function add() {
    $scope.bricks.push(genBrick());
  };

  $scope.remove = function remove() {
    $scope.bricks.splice(
      ~~(Math.random() * $scope.bricks.length),
      1
    );
  };
});