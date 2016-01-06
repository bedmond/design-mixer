//Placeholder images for styling and testing
var thumb = {
  src: "https://farm5.staticflickr.com/4074/4915795521_40b2faf863_b.jpg"
};

var designMixer = angular.module('DesignMixer', ['ui.router', 'firebase']);

designMixer.run(['$rootScope', '$state', function($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
}]);

designMixer.factory('Auth', ['$firebaseAuth', 'FIREBASE_URL', function ($firebaseAuth, FIREBASE_URL) {
  
  var ref = new Firebase(FIREBASE_URL);
  return $firebaseAuth(ref);
}]);

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

  $stateProvider.state('register', {
    url: '/register',
    controller: 'Register.controller',
    templateUrl: '/templates/register.html',
  });

  $stateProvider.state('login', {
    url: '/login',
    controller: 'Login.controller',
    templateUrl: '/templates/login.html',
    resolve: {
      "currentAuth": ['Auth', function (Auth) {
        return Auth.$waitForAuth();
      }]
    }
  });

  $stateProvider.state('upload', {
    url: '/upload',
    controller: 'Upload.controller',
    templateUrl: '/templates/upload.html',
    resolve: {
      "currentAuth": ['Auth', function (Auth) {
        return Auth.$requireAuth();
      }]
    }
  });

}]);

designMixer.constant('FIREBASE_URL', 'https://designmixer.firebaseio.com');

//Search display page. Displays images that have been uploaded.
designMixer.controller('Thumbs.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseArray) {

   //replicates sample image for styling and testing
  $scope.thumbs = [];
    for (var i = 0; i < 36; i++) {
      $scope.thumbs.push(angular.copy(thumb));
    }

}]);

//Detail page displayed when thumb is clicked on.
designMixer.controller('Detail.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseArray) {
  
  $scope.detail = angular.copy(thumb)
}]);

//Register page, required for login.
designMixer.controller('Register.controller', ['$scope', '$firebaseArray', 'Auth', function ($scope, $firebaseArray, Auth) {

  $scope.createUser = function() {
    $scope.message = null;
    $scope.error = null;

    Auth.$createUser({
      email: $scope.email,
      password: $scope.password,
    }).then(function(userData) {
      console.log("User created with uid: " + userData.uid);
    }).catch(function(error) {
      $scope.error = error;
      console.log("Error: ", error);
    });
  }

}]);

//Login page, required for upload of images.
designMixer.controller('Login.controller', ['$scope', 'FIREBASE_URL', '$firebaseAuth', 'currentAuth', 'Auth', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseAuth, currentAuth, Auth, $firebaseArray) {

  $scope.auth = Auth;

  $scope.auth.$onAuth(function(authData) {
    $scope.authData = authData;
  });

  var ref = new Firebase(FIREBASE_URL);
  $scope.authObj = $firebaseAuth(ref);

  $scope.login = function() {
    $scope.message = null;
    $scope.error = null;

    $scope.authObj.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    }).then(function(authData) {
      console.log("Logged in as: ", authData.uid);
    }).catch(function(error) {
      console.error("Authentication failed: ", error);
    });
  }

  $scope.logout = function() {
    ref.unauth();
  };

}]);

//Upload page, must be registered and logged in.
designMixer.controller('Upload.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', 'currentAuth', function ($scope, FIREBASE_URL, $firebaseArray, currentAuth) {

  var ref = new Firebase(FIREBASE_URL);
  
  $scope.images = $firebaseArray(ref);

  //create data URL and add to firebase
  $scope.uploadImage = function() {

    var name = $scope.image;
    $scope.images.$add({
      name: $scope.image,
      created_at: Firebase.ServerValue.TIMESTAMP,
      priority: -1

    });

    $scope.image = [];
  }
}]);







