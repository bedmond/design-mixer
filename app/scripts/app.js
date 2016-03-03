//Placeholder images for styling and testing
//var image = {
  //src: "https://s3.amazonaws.com/designmixerimages/testing/IMG_0032.jpg"
//};

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

  //Add info to array of images to drive search?
  $scope.images = [
    "IMG_0032.jpg",
    "IMG_0035.jpg",
    "IMG_0040.jpg",
    "IMG_0041.jpg",
    "IMG_0042.jpg",
    "IMG_0043.jpg",
    "IMG_0045.jpg",
    "IMG_0047.jpg",
    "IMG_0048.jpg",
    "IMG_0049.jpg",
    "IMG_0051.jpg"
  ];

  $scope.getImage = function(imageName) {
    return "https://s3.amazonaws.com/designmixerimages/testing/" + imageName;
  };

  //Shuffles the images uploaded and in array.
  $scope.shuffle = function(images) {
    var m = images.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = images[m];
      images[m] = images[i];
      images[i] = t;
    }
    return images;
  }

  //need to figure out how to display image here after upload to Firebase
  //$scope.images = [];
  //for (var i = 0; i < 36; i++) {
    //$scope.images.push(angular.copy(image));
  //}

}]);

//Detail page displayed when thumb is clicked on.
designMixer.controller('Detail.controller', ['$scope', 'FIREBASE_URL', '$firebaseArray', function ($scope, FIREBASE_URL, $firebaseArray) {

  //work out how to display detail when thumb is clicked on

  $scope.images = [
    "IMG_0032.jpg",
    "IMG_0035.jpg",
    "IMG_0040.jpg",
    "IMG_0041.jpg",
    "IMG_0042.jpg",
    "IMG_0043.jpg",
    "IMG_0045.jpg",
    "IMG_0047.jpg",
    "IMG_0048.jpg",
    "IMG_0049.jpg",
    "IMG_0051.jpg"
  ];

  $scope.detail = function(imageName) {
    return "https://s3.amazonaws.com/designmixerimages/testing/" + imageName;
  };
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

  $scope.uploadImage = function() {
    console.log($scope.image);

    //load image to storage
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:6ed5170a-3463-4b8d-a14f-58a0b279baa3'
    });
    AWS.config.credentials.get(function(err) {
        if (err) alert(err);
        console.log(AWS.config.credentials);
    });

    var bucketName = 'designmixerimages';
    var bucket = new AWS.S3({
        params: {
            Bucket: bucketName
        }
    });

    if($scope.image) {
      var objKey = 'testing/' + $scope.image.name;
      var params = {
          Key: objKey,
          ContentType: $scope.image.type,
          Body: $scope.image,
          ACL: 'public-read'
      };

      bucket.putObject(params, function(err, data) {
        if (err) {
          alert(err.message);
          return false;
        } else {
          alert('Upload done');
      }
    })
    .on('httpUploadProgress', function(progress) {
      console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
    });
  } else {
    alert('No file selected');
  }

    //add image reference to database
    var name = $scope.image;
    $scope.images.$add({
      name: $scope.image,
      created_at: Firebase.ServerValue.TIMESTAMP,
      priority: -1

    });

    $scope.image = [];
  }
}]);

designMixer.directive("fileread", [function () {
    return {
        scope: {
            fileread: "=",
            obj: "=ngModel"
        },
        link: function (scope, element, attributes) {
            console.log(element);

            element.bind("change", function (changeEvent) {
                console.log(changeEvent.target.files[0]);
                //converts image to base64, may not need to do?
                //var reader = new FileReader();
                //reader.onload = function (loadEvent) {  
                scope.$apply(function () {
                    //scope.fileread = loadEvent.target.result;
                      scope.obj = changeEvent.target.files[0];

                      // or all selected files:
                      // scope.fileread = changeEvent.target.files; 
                });
                //reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);







