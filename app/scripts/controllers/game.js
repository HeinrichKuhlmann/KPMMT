'use strict';
function animator(shapes, $timeout) {
    (function tick() {
        var i;
        var now = new Date().getTime();
        var maxX      = 600;
        var maxY      = 600;
        var now = new Date().getTime();

		angular.forEach(shapes, function(shape,i){
			var shape = shapes[i];
			var elapsed = (shape.timestamp || now) - now;

			shape.timestamp = now;
			shape.x += elapsed * shape.velX / 1000;
			shape.y += elapsed * shape.velY / 1000;

			if (shape.x + 30 > maxX) {
			   shape.x = maxX - 30;
			   shape.velX *= -1;
			}
			if (shape.x < 0) {
			   shape.x = 0;
			   shape.velX *= -1;
			}

			if (shape.y + 30 > maxY) {
			   shape.y = maxY - 30;
			   shape.velY *= -1;
			}
			if (shape.y < 0) {
			   shape.y = 0;
			   shape.velY *= -1;
			}
        });

         $timeout(tick, 30);
    })();
}

angular.module('gdriveClickTheBallsApp').controller('MainCtrl', function ($scope, $timeout) {
    //######################################## GOOGLE RTAPI INIT #########################
	/**
     * This function is called the first time that the Realtime model is created
     * for a file. This function should be used to initialize any values of the
     * model. In this case, we just create the single string model that will be
     * used to control our text box. The string has a starting value of 'Hello
     * Realtime World!', and is named 'text'.
     * @param model {gapi.drive.realtime.Model} the Realtime root model object.
     */
    function initializeModel(model) {
      var string = model.createString('Click The Ballz!');
      model.getRoot().set('text', string);
    }

    /**
     * This function is called when the Realtime file has been loaded. It should
     * be used to initialize any user interface components and event handlers
     * depending on the Realtime model. In this case, create a text control binder
     * and bind it to our string model that we created in initializeModel.
     * @param doc {gapi.drive.realtime.Document} the Realtime document.
     */
    $scope.onFileLoaded = function(doc) {
		$scope.doc = doc;
		$scope.collaborators = $scope.doc.getCollaborators();
		angular.forEach($scope.collaborators, function(v,k){
			if(v.isMe)
				$scope.myColor = v.color;
		});
		$scope.shapes = $scope.doc.getModel().createMap();
		color     : color,
			x         : Math.min(380,Math.max(20,(Math.random() * 380))),
			y         : Math.min(180,Math.max(20,(Math.random() * 180))),

			velX    : (Math.random() * maxVelocity),
			velY    : (Math.random() * maxVelocity)
		$scope.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, $scope.onCollaboratorJoined);
		$scope.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, $scope.onCollaboratorLeft);
		$scope.doc.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, $scope.initShapes);
		gapi.drive.realtime.custom.registerType($scope.shapes, 'Shapes');
		gapi.drive.realtime.custom.setOnLoaded($scope.shapes, $scope.initShapes);
		$scope.isAuthorized = true;
		$scope.$digest();
	}

    /**
     * Options for the Realtime loader.
     */
    var realtimeOptions = {
      /**
       * Client ID from the APIs Console.
       */
      clientId: '633280430175.apps.googleusercontent.com',

      /**
       * The ID of the button to click to authorize. Must be a DOM element ID.
       */
      authButtonElementId: 'authorizeButton',

      /**
       * Function to be called when a Realtime model is first created.
       */
      initializeModel: initializeModel,

      /**
       * Autocreate files right after auth automatically.
       */
      autoCreate: true,

      /**
       * Autocreate files right after auth automatically.
       */
       defaultTitle: "New Realtime Quickstart File",

      /**
       * Function to be called every time a Realtime file is loaded.
       */
      onFileLoaded: $scope.onFileLoaded
    }

    /**
     * Start the Realtime loader with the options.
     */
    $scope.startRealtime = function() {
		var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
		realtimeLoader.start();
		
    }
	//#####################################################################
	
	
	$scope.shapes   = {};
	$scope.remove = function(i, ball) {
		if(ball.color == $scope.myColor){
			delete $scope.shapes[i];  
			// TODO : SYNC the removed element to google
		}
    }
	$scope.start = function(){
		angular.forEach($scope.collaborators,function(v,k){
			for (var i = 0; i < 10; i++) {
				$scope.shapes.set("#"+ Math.floor(Math.random()* 100000000000), $scope.buildShape(v.color));
			}
		});
		$scope.doc.getModel().createMap($scope.shapes);
		$scope.doc.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, $scope.initShapes);
		$scope.isStarting = true;
		$scope.starting(3);
	}
	
	$scope.initShapes = function(event) {
		$scope.shapes = event.values;
	}
	
	$scope.started = false;
	$scope.isStarting = false;
	$scope.starting = function(s)  {
		$scope.isStartingIn = s;
		if(s)
			$timeout(function(){$scope.starting(s-1)},1000);
		else {
			$scope.started = true;
			$scope.isStarting = false;
			$scope.startGame();
		}
	}

	$scope.buildShape = function(color) {
		var maxVelocity = 250;
		return {
			color     : color,
			x         : Math.min(380,Math.max(20,(Math.random() * 380))),
			y         : Math.min(180,Math.max(20,(Math.random() * 180))),

			velX    : (Math.random() * maxVelocity),
			velY    : (Math.random() * maxVelocity)
		};
	}
	
	$scope.startGame = function() {

		// Publish list of shapes on the $scope/presentationModel
		// Then populate the list with 100 shapes randomized in position
		// and color
		
		
		// Start timer-based, changes of the shape properties
		animator( $scope.shapes, $timeout );
	}
	
	
	$scope.startRealtime();
	
	
	
	$scope.who = "";
	$scope.showName = function(name){
		$scope.who = name;
	}
	$scope.collaborators = [];
	$scope.myColor = "";

	$scope.onCollaboratorJoined = function(event) {
		$scope.collaborators = $scope.doc.getCollaborators();
	};

	$scope.onCollaboratorLeft = function(event) {
		$scope.collaborators = $scope.doc.getCollaborators();
	};
	
	
});

  
  
  
 