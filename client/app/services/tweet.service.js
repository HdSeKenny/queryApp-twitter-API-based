'use strict';

angular.module('queryApp')
  .factory('Tweet', function($http) {
    return {
      getTweets: function() {
        return $http.get('/api/tweets');
      },
      getTweet: function(tweetId) {
        return $http.get('/api/tweets/' + tweetId);

      },
      getUser: function(userId) {
        return $http.get('/api/users/' + userId);
      },
      getTags: function() {
        return $http.get('/api/tags');
      }
    };
  });
