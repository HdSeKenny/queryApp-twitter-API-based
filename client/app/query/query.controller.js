'use strict';

angular.module('queryApp')
   .controller('QueryCtrl', function($scope, socket, $http, Tweet) {

      $scope.frequentWords = [];
      $scope.tweets = [];

      var frequentWordArr = $scope.frequentWordArr = [];
      var geocoder = new google.maps.Geocoder();
      var markers = [];
      var locations = [];
      var authorArray = [];
      var authorTextArr = $scope.authorTextArr = [];
      var markersInfo = [];
      var map;
      var mapFlag = false;
      var TILE_SIZE = 256;
      var searched_address;

      // Get all tweets in the mysql database
      Tweet.getTweets().success(function(data) {
         $scope.tweets = data;
         for (var i = 0; i < data.length; i++) {
            if (data[i].location !== null && data[i].location !== '') {
               var locationObj = {
                  address: data[i].location,
                  userName: data[i].screen_name,
                  text: data[i].tweet_text,
                  image: data[i].profile_image_url
               }
               markersInfo.push(locationObj);
               geocoder.geocode({
                  'address': data[i].location
               }, function(results, status) {
                  if (status === google.maps.GeocoderStatus.OK) {
                     locations.push(results[0].geometry.location);
                  } else {
                     console.log("not found");
                  }
               });
            } else {
               console.log("location was null!");
            }
         }
      })

      // Make sure that the map is inited
      $scope.isInitMap = function() {
         return mapFlag;
      }

      //Init the google map
      $scope.initMap = function() {
         map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 38.034008, lng: -25.3975827 },
            zoom: 3
         });
         mapFlag = true;
         createMarkers();
      }

      // Create markers in google map with tweets' locations
      function createMarkers() {
         for (var index in locations) {
            var latLng = {
               lat: locations[index].lat(),
               lng: locations[index].lng()
            }
            var marker = new google.maps.Marker({
               position: latLng,
               map: map,
               draggable: true,
               animation: google.maps.Animation.DROP
            })
            var img = JSON.stringify(markersInfo[index].image).replace("mini_square", "medium");
            var userImg = img.replace(/"/g, "");
            var content = '<div id="iw_container">' +
               '<div class="col-xs-2"><p><img id="markerImg" src=' + userImg + '></p></div>' +
               '<div class="col-xs-10"><div class="iw_title">' + markersInfo[index].userName +
               '<span class="iw_address">' + markersInfo[index].address + '</span></div>' +
               '<div class="iw_content">' + markersInfo[index].text + '</div></div>' +
               '</div>';

            // Create info window for markers
            var infowindow = new google.maps.InfoWindow()
            google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
               return function() {
                  infowindow.setContent(content);
                  infowindow.open(map, marker);
                  if (marker.getAnimation() !== null) {
                     marker.setAnimation(null);
                  } else {
                     marker.setAnimation(google.maps.Animation.BOUNCE);
                  }

               };
            })(marker, content, infowindow));
         };

      }

      // Main search function
      $scope.searchTwitter = function() {
         alert('hello')
         var wordsArray = new Array();
         var dateString = '2016-05-';
         var author_string = '';
         var content = '';
         var geocode = null;
         var option;

         //Deal with search way
         if ($scope.filterBy == null) {
            option = " OR ";
         } else {
            option = " " + $scope.filterBy + " ";
         }

         // input content
         if ($scope.content != null) {
            wordsArray = $scope.content.split(/[,]+/);

            for (var i = 0; i < wordsArray.length; i++) {
               if (i == 0) {
                  content = wordsArray[i];
               } else {
                  content = content + option + wordsArray[i];
               }
            }
         }

         //input author
         if ($scope.author != null) {
            authorArray = $scope.author.split(/[ ,]+/);
            for (var i = 0; i < authorArray.length; i++) {
               if (i == authorArray.length - 1) {
                  author_string = author_string + "from:@" + authorArray[i];
               } else {
                  author_string = author_string + "from:@" + authorArray[i] + option;
               }
            }

            if ($scope.content == null || $scope.content == '') {
               content = author_string;
            } else {
               content = author_string + option + content;
            }

         }

         var authorAndContent = content;

         // time
         if ($scope.days != null || $scope.days == '') {
            if ($scope.days > 7) {
               alert('Please enter a number below 7!');
            } else {
               var daysNo = 17 - $scope.days;
               if (daysNo < 10) {
                  dateString = " since:" + dateString + "0" + daysNo;
               } else {
                  dateString = " since:" + dateString + daysNo;
               }
            }
            content = content + dateString;
         }

         // Transalte the address into geocode with google API
         geocoder.geocode({
            'address': $scope.address
         }, function(results, status) {
            if ($scope.address == null || $scope.address == '') {
               var search_content = {
                  content: content,
                  geocode: geocode,
                  keywords: $scope.keywords,
                  authorAndContent: authorAndContent
               }
               getTweets(search_content);
               searched_address = null;
            } else {
               searched_address = $scope.address;
               if (status === google.maps.GeocoderStatus.OK) {
                  var location = results[0].geometry.location;
                  searched_address = location;
                  if ($scope.radius == null || $scope.radius == '') {
                     geocode = location.lat() + "," + location.lng() + "," + "10km";
                  } else {
                     geocode = location.lat() + "," + location.lng() + "," + $scope.radius;
                  }
                  var search_content = {
                     content: content,
                     geocode: geocode,
                     keywords: $scope.keywords,
                     authorAndContent: authorAndContent
                  }
                  getTweets(search_content);

               } else {
                  alert('Geocode was not found: ' + status);
               }
            }
         });
      }

      // Check if searched the same data more than once, if database has data, return.
      // otherwise use socket send data to twitter API
      function getTweets(search_data) {
         var tweets = $scope.tweets = []
         Tweet.getTweets().success(function(data) {
            var flag = false;
            var geocode,
               keywordsNo;
            if (search_data.geocode === '' || search_data.geocode == null) {
               geocode = '';
            } else {
               geocode = search_data.geocode;
            }

            if (search_data.keywords === undefined || search_data.keywords === '') {
               keywordsNo = '';
            } else {
               keywordsNo = search_data.keywords;
            }

            var search_string = search_data.content + geocode + keywordsNo;
            for (var i in data) {
               if (search_string === data[i].searched_data) {
                  $scope.tweets.push(data[i]);
                  flag = true;
               }
            }
            if (!flag) {
               socket.emit('search_content', search_data);
            } else {
               Tweet.getTags().success(function(tags) {
                  for (var i = 0; i < tags.length; i++) {
                     if (search_string === tags[i].searched_data) {
                        var str = tags[i].frequent_words;
                        var words = str.split(',');
                        countFrequentWords(words);
                     }
                  };
               })
            }
         })
      };

      // Count users' frequent words
      function countFrequentWords(words) {
         $scope.frequentWords = words;
         var tweets = $scope.tweets;

         for (var i = 0; i < authorArray.length; i++) {
            var wordsArr = [];
            var screen_name = authorArray[i];
            for (var k = 0; k < words.length; k++) {
               var count = 0;
               for (var j = 0; j < tweets.length; j++) {
                  if (screen_name === tweets[j].screen_name) {
                     var text = tweets[j].tweet_text.toLowerCase();
                     if (text.indexOf(words[k]) !== -1) {
                        count++;
                     };
                  }
               }
               var wordObj = {
                  word: words[k],
                  count: count
               }
               wordsArr.push(wordObj);
            }
            var textObj = {
               userName: screen_name,
               words: wordsArr
            }
            authorTextArr.push(textObj);
         }
         $scope.authorTextArr = authorTextArr;
      }

      // Get data from server scoket by event name "word_count"
      // And create marker with circle
      socket.on('word_count', function(wordCounts) {
         if (searched_address !== null) {
            var content = '';
            var str = searched_address.lat() + "," + searched_address.lng() + "," + $scope.radius;
            var image = {
               url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
               size: new google.maps.Size(20, 32),
               origin: new google.maps.Point(0, 0),
               anchor: new google.maps.Point(0, 32)
            };

            var marker = new google.maps.Marker({
               position: {
                  lat: searched_address.lat(),
                  lng: searched_address.lng()
               },
               map: map,
               icon: image
            });
            console.log(wordCounts.words.length+"----");
            for (var i = 0; i < wordCounts.words.length; i++) {
               if (i === wordCounts.words.length - 1) {
                  content = content + wordCounts.words[i];
               } else {
                  content = content + wordCounts.words[i] + ", ";
               }
            };

            var infowindow = new google.maps.InfoWindow({
               content: '<div class="iw_title"> Talk about:' +
                  '<span class="iw_address">' + content + '</span></div>' +
                  '<div class="iw_content">' + str + '</div>'
            });

            var circle = new google.maps.Circle({
               map: map,
               radius: 16093,
               fillColor: '#AA0000'
            });

            circle.bindTo('center', marker, 'position');
            infowindow.open(marker.get('map'), marker);
         };

         countFrequentWords(wordCounts.words);
      });

      // Get data from server scoket by event name "tweet"
      socket.on('tweet', function(data) {
         $scope.tweets.push(data);
         if (data.location !== null && data.location !== '') {
            var locationObj = {
               address: data.location,
               userName: data.screen_name,
               text: data.tweet_text,
               image: data.profile_image_url
            }
            markersInfo.push(locationObj);
            geocoder.geocode({
               'address': data.location
            }, function(results, status) {

               if (status === google.maps.GeocoderStatus.OK) {
                  locations.push(results[0].geometry.location);
               } else {
                  // console.log("not found");
               }
            });
         } else {
            // console.log("location was null!");
         }
      });
   });