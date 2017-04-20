'use strict';

var twit = require('twit');
var Tweet = require('../api/tweet/tweet.controller');
var User = require('../api/user/user.controller');
var Tag = require('../api/tag/tag.controller');

var Twit = new twit({
   consumer_key: 'DjiGFLPeD0zcb8yFGwKGSz8UL',
   consumer_secret: 'PXREptDn6FTvtkzsZSTHYeEZRbsZxbCMgNqR5qfc3JRw01ghWT',
   access_token: '724401900158881792-kXIvpWdGAgZor5ExEYnAqQT99WVQe9E',
   access_token_secret: 'mfD6cPuuubMMRer9Bke0o3MhT0KxcPlLMss2xCa5SEY1X'
});

// Connect socket in the server
module.exports = function(socket) {

   socket.sockets.on('connection', function(socket) {

      socket.on('disconnect', function() {
         socket.emit('user disconnected');
      });

      //Return every user's recent tweets
      socket.on('user_tweets', function(client_data) {
         var text_string = '';
         var timeline = { screen_name: client_data.screen_name, count: 10 };
         var recentObj = { q: 'from:@' + client_data.screen_name + ' since:2016-05-23', count: 10 };

         // Twitter API GET 'statuses/user_timeline'
         Twit.get('statuses/user_timeline', timeline, function(err, data, res) {
            for (var index in data) {
               var tweet = data[index];
               var string = tweet.created_at;
               var date = string.substring(11, 16) + " @ " + string.substring(3, 11) + string.substring(26, 30);

               socket.emit('returned_tweets', {
                  tweet_id: tweet.id_str,
                  tweet_text: tweet.text,
                  created_at: date,
                  user_id: tweet.user.id_str,
                  screen_name: tweet.user.screen_name,
                  name: tweet.user.name,
                  profile_image_url: tweet.user.profile_image_url,
                  statuses_count: tweet.user.statuses_count,
                  description: tweet.user.description,
                  location: tweet.user.location,
                  retweeted_status: tweet.retweeted_status
               });
            }

            // Twitter api search user recent tweets
            Twit.get('search/tweets', recentObj, getRecentTweets);

            function getRecentTweets(err, data, res) {
               if (err) console.log("something wrong!!" + err);
               for (var index in data.statuses) {
                  var tweet = data.statuses[index];
                  text_string += tweet.text;
               }
               // Count recent frequent words
               var wordCounts = countFrequentWords(text_string, 10).split(',');
               for (var i in wordCounts) {
                  socket.emit('user_word_count', {
                     word: wordCounts[i],
                  });
               };
            }
         })
      });

      //main search
      socket.on('search_content', function(search_data) {

         var max_id = null;
         var counter = 0;
         var wordsString = '';
         var geocode;
         var keywordsNo;
         var search_content = {
            q: search_data.content,
            count: 10,
            geocode: search_data.geocode,
            max_id: max_id,
            lang: 'en'
         };

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

         // Use twitter API to get tweets
         Twit.get('search/tweets', search_content, searchTweets);

         // Callback function return tweets data
         function searchTweets(err, data, res) {
            if (err) { console.log("something wrong!!" + err); }

            for (var index in data.statuses) {
               var tweet = data.statuses[index];
               var string = tweet.created_at;
               var date = string.substring(11, 16) + " @ " + string.substring(3, 11) + string.substring(26, 30);
               max_id = tweet.id;
               wordsString += tweet.text;

               // create tweet object into mysql databse
               var tweetObj = {
                  tweet_id: tweet.id,
                  id_str: tweet.id_str,
                  tweet_text: tweet.text,
                  created_at: date,
                  user_id: tweet.user.id,
                  screen_name: tweet.user.screen_name,
                  name: tweet.user.name,
                  profile_image_url: tweet.user.profile_image_url,
                  location: tweet.user.location,
                  searched_data: search_data.content + geocode + keywordsNo
               }

               // create user object into mysql databse
               var userObj = {
                  user_id: tweet.user.id,
                  id_str: tweet.user.id_str,
                  screen_name: tweet.user.screen_name,
                  name: tweet.user.name,
                  profile_image_url: tweet.user.profile_image_url,
                  location: tweet.user.location,
                  description: tweet.user.description,
                  statuses_count: tweet.user.statuses_count
               }

               // Use api/controller to call function create() to create objects
               if (search_data.authorAndContent !== null && search_data.authorAndContent !== '') {
                  Tweet.create(tweetObj);
                  User.create(userObj);
               };

               // Emit every tweet to client in time
               socket.emit('tweet', {
                  tweet_id: tweet.id,
                  id_str: tweet.id_str,
                  tweet_text: tweet.text,
                  created_at: date,
                  user_id: tweet.user.id_str,
                  screen_name: tweet.user.screen_name,
                  name: tweet.user.name,
                  profile_image_url: tweet.user.profile_image_url,
                  retweeted_status: tweet.retweeted_status,
                  location: tweet.user.location
               });
            }

            // Use max_id to continue search
            if (data.search_metadata.next_results != undefined) {
               var max_string = data.search_metadata.next_results;
               max_id = max_string.substring(8, 26);
            }

            if (counter++ <= 2) {
               var search_content = {
                  q: search_data.content,
                  count: 10,
                  geocode: search_data.geocode,
                  max_id: max_id,
                  lang: 'en'
               }
               Twit.get('search/tweets', search_content, searchTweets);
            } else {
               if (search_data.keywords != null) {

                  // Count users' frequent words and send to client
                  var wordCounts = countFrequentWords(wordsString, search_data.keywords).split(',');
                  var words_string = '';

                  // Create search tag in mysql databse
                  for (var i in wordCounts) {
                     if (i == wordCounts.length - 1) {
                        words_string = words_string + wordCounts[i];
                     } else {
                        words_string = words_string + wordCounts[i] + ",";
                     }
                  }
                  var tagObj = {
                     searched_data: search_data.content + geocode + keywordsNo,
                     frequent_words: words_string,
                     words_no: search_data.keywords
                  }

                  if (search_data.authorAndContent !== null && search_data.authorAndContent !== '') {
                     Tag.create(tagObj);
                  }

                  socket.emit('word_count', {
                     words: wordCounts
                  })
               } else if (search_data.authorAndContent === null || search_data.authorAndContent === '') {
                  var wordCounts = countFrequentWords(wordsString, 70).split(',');
                  var talkAbout = [];
                  for (var i = 0; i < wordCounts.length; i++) {
                     if (wordCounts[i].length > 4) {
                        talkAbout.push(wordCounts[i]);
                     }
                  };

                  socket.emit('word_count', {
                     words: talkAbout
                  })
               }
            }
         }

      });
   })

   // Count frequent words number function
   function countFrequentWords(string, number) {
      var cleanString = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
         words = cleanString.toLowerCase().split(' '),
         frequencies = {},
         word, frequency, i;

      for (i = 0; i < words.length; i++) {
         word = words[i];
         frequencies[word] = frequencies[word] || 0;
         frequencies[word]++;
      }

      words = Object.keys(frequencies);

      return words.sort(function(a, b) {
         return frequencies[b] - frequencies[a];
      }).slice(0, number).toString();
   }
}