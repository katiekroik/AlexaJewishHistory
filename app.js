var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var http = require('http');

app.get('/scrape', function(req, res){

	console.log(req.body);
	console.log(res.query);
  //All the web scraping magic will happen here

  // scrape(3/27/2016)
});

// function getJsonEventsFromChabad(date, eventCallback) {
//     var url = 'http://www.chabad.org/calendar/view/day.asp?tdate=' + date;

//     http.get(url, function(res) {
//         var body = '';

//         res.on('data', function (chunk) {
//             body += chunk;
//         });

//         res.on('end', function () {
//             var stringResult = parseChabadJson(body);
//             eventCallback(stringResult);
//         });
//     }).on('error', function (e) {
//         console.log("Got error: ", e);
//     });
// }

// function parseChabadJson(html) {
//     var json = { date : "", jewishHistory : "", jewishThought : ""};

//     var $ = cheerio.load(html);

//     function getJewishHistory(json) {
//       $('#JewishHistoryBody0').filter(function() {
//           var data = $(this);

//           var c = data.first().children();

//           var jh = "";
//           for (var i = 0; i < c.length; i++) {
//               // console.log(c[i].children[0].data)
//               jh += c[i].children[0].data + " "; 
//           }

//           json.jewishHistory = jh;
//       });
//       return json;
//     }

//     function getDailyThought(json) {
//       $('#DailyThoughtBody0').filter(function() {
//           var data = $(this);

//           var c = data.first().children();

//           var thought = "";
//           for (var i = 0; i < c.length; i++) {
//               // console.log(c[i].children[0].data)
//               thought += c[i].children[0].data + " "; 
//           }

//           json.jewishThought = thought;
//       });
//       return json;
//     }
//     var ret = {};
//     ret = getJewishHistory(ret);
//     ret = getDailyThought(ret);
//     return ret;
// }


app.listen('8081');

console.log('Magic happens on port 8081');

// getJsonEventsFromChabad("3/27/2016", function (json) {
//   console.log(json);
//     var speechText = "",
//         i;
//     sessionAttributes.text = events;
//     session.attributes = sessionAttributes;
//     if (events.length == 0) {
//         speechText = "There is a problem connecting to Wikipedia at this time. Please try again later.";
//         cardContent = speechText;
//         response.tell(speechText);
//     } else {
//         for (i = 0; i < paginationSize; i++) {
//             cardContent = cardContent + events[i] + " ";
//             speechText = "<p>" + speechText + events[i] + "</p> ";
//         }
//         speechText = speechText + " <p>Wanna go deeper in history?</p>";
//         var speechOutput = {
//             speech: "<speak>" + prefixContent + speechText + "</speak>",
//             type: AlexaSkill.speechOutputType.SSML
//         };
//         var repromptOutput = {
//             speech: repromptText,
//             type: AlexaSkill.speechOutputType.PLAIN_TEXT
//         };
//         response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
//     }

// });

// var getJSON = function(url, callback) {
//     var xhr = new XMLHttpRequest();
//     xhr.open("get", url, true);
//     xhr.responseType = "json";
//     xhr.onload = function() {
//       var status = xhr.status;
//       if (status == 200) {
//         callback(null, xhr.response);
//       } else {
//         callback(status);
//       }
//     };
//     xhr.send();
// };

// getJSON("http://www.sefaria.org/api/texts" + 'genesis' + '.' + '1' + '.' + '1' + '?context=0',
// function(err, data) {
//   if (err != null) {
//     console.log("Something went wrong: " + err);
//   } else {
//     console.log("Your query count: " + data.query.count);
//   }
// });

var url = "http://www.sefaria.org/api/texts/" + 'genesis' + '.' + '1' + '.' + '1' + '?context=0';
//     http.get(url, function(res, data){
//       // console.log(res);

//       var body = '';

//       res.on('data', function(chunk) {
//         body += chunk;
//         // console.log(body);
//       });

//       res.on('end', function() {
//         // var res = JSON.parse(body);
//         console.log("res", body);
//       });
//     });


// var url = "http://www.sefaria.org/api/texts" + 'genesis' + '.' + '1' + '.' + '1' + '?context=0';

request({
    url: url,
    json: true
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body.text) // Print the json response
    }
})

exports = module.exports = app;
