'use strict';

angular.module('queryApp')
   .controller('UserCtrl', function($scope, socket, $routeParams, Tweet) {
      $scope.tweets = [];
      $scope.commonlyWords = [];
      $scope.user = {};
      $scope.userImg = {};
      $scope.locations = [];
      // Get single tweet info
      Tweet.getUser($routeParams.userId)
         .success(function(data) {
            $scope.user = data[0];
            getTwitterTweets(data[0].screen_name);
         })
         .error(function(err) {

         })

      // Get twitter recent tweets with socket emitter
      function getTwitterTweets(screen_name) {
         socket.emit('user_tweets', { screen_name: screen_name });
      }

      // Get returned tweets by server socket
      socket.on('returned_tweets', function(data) {
         $scope.tweets.push(data);
         $scope.singleTweet = data;
         if (data.location !== null && data.location !== "") {
            for (var i = 0; i < $scope.locations.length; i++) {
               if ($scope.locations[i] !== data.location) {
                  $scope.locations.push(data.location);
               }
            };

            console.log(data.location);
         };
      })

      // Get user recent 10 frequent words by server socket
      socket.on('user_word_count', function(data) {
         $scope.commonlyWords.push(data);
      })

   });