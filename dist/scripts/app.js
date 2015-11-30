//Need to show different images. How?
var thumb = {
  src: "https://farm5.staticflickr.com/4074/4915795521_40b2faf863_b.jpg"
};

var designMixer = angular.module('DesignMixer', ['ui.router', 'firebase']);

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
designMixer.constant('FIREBASE_URL', 'https://designmixer.firebaseio.com');

designMixer.controller('Thumbs.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseArray) {

  //Grab image url from storage to display after upload tool adds an image.
  //Replaces JS at the top of the page.
  //var ref = new Firebase(FIREBASE_URL);
  //var id = ~~(Math.random() * 10000);

  //$scope.thumbs = $firebaseArray(ref)

  //Build the firebaseArray.
  //$scope.thumbs = function() {
    //var name = $scope.thumb;
    //$scope.thumbs.$add({
      //name: $scope.thumb,
      //src:  "/assets/images/*.{png,jpg,jpeg,tiff} + id"
      //created_at: Firebase.ServerValue.TIMESTAMP
  //});

  $scope.thumbs = [];
    for (var i = 0; i < 36; i++) {
      $scope.thumbs.push(angular.copy(thumb));
    }
}]);

designMixer.controller('Detail.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseArray) {
  $scope.detail = angular.copy(thumb)
}])







