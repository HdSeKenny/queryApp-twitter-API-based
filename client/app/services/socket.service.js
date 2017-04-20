'use strict';

angular.module('queryApp')
  .factory('socket', function($rootScope) {
    //connect client socket.io
    var socket = io.connect();
    return {
      //client socket.on function
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      //client socket.emit function
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
});