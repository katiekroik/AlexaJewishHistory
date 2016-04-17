var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){

	console.log(req.body);
	console.log(res.query);
  //All the web scraping magic will happen here

  // scrape(3/27/2016)
});

console.log(scrape("3/27/2016"))

getJsonEventsFromChabad(monthNames[date.getMonth()], date.getDate(), function (events) {
    var speechText = "",
        i;
    sessionAttributes.text = events;
    session.attributes = sessionAttributes;
    if (events.length == 0) {
        speechText = "There is a problem connecting to Wikipedia at this time. Please try again later.";
        cardContent = speechText;
        response.tell(speechText);
    } else {
        for (i = 0; i < paginationSize; i++) {
            cardContent = cardContent + events[i] + " ";
            speechText = "<p>" + speechText + events[i] + "</p> ";
        }
        speechText = speechText + " <p>Wanna go deeper in history?</p>";
        var speechOutput = {
            speech: "<speak>" + prefixContent + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
    }
});

function getJsonEventsFromChabad(date, eventCallback) {
    var url = 'http://www.chabad.org/calendar/view/day.asp?tdate=' + date;

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJson(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseChabadJson(inputText) {
    // sizeOf (/nEvents/n) is 10

    var json = { date : "", jewishHistory : "", jewishThought : ""};

    var $ = cheerio.load(inputText);

    function getJewishHistory(json) {
        $('#JewishHistoryBody0').filter(function() {
            var data = $(this);

            var c = data.first().children()

            var jh = "";
            for (var i = 0; i < c.length; i++) {
                // console.log(c[i].children[0].data)
                jh += c[i].children[0].data + " "; 
            }

            json.jewishHistory = jh;
            // console.log("Done with Jewish History");
        });
    }

    function getDailyThough(json, callback) {
        $('#DailyThoughtBody0').filter(function() {
            var data = $(this);

            var c = data.first().children()

            var thought = "";
            for (var i = 0; i < c.length; i++) {
                // console.log(c[i].children[0].data)
                thought += c[i].children[0].data + " "; 
            }

            json.jewishThought = thought;

            callback(json)
        });

    }

    function fillJson(callback, callbackTwo) {

        json.date = date;
        if (json.date) {
            callback(json, callbackTwo) 
            if (json.jewishHistory && json.jewishThought) {
                // console.log(json)
                return json;
            }
        }               
    }

    return json;
}


// function getJson(date, callback) {
// 	var json = { date : "", jewishHistory : "", jewishThought : ""};
// 	callback(date, json)
// }

function scrape(date) {
	console.log("in scrape")
	url = 'http://www.chabad.org/calendar/view/day.asp?tdate=' + date;

	console.log(url)
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

	var json = { date : "", jewishHistory : "", jewishThought : ""};

    return request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){

            var $ = cheerio.load(html);

            function getJewishHistory(json) {
            	$('#JewishHistoryBody0').filter(function() {
	            	var data = $(this);

	           		var c = data.first().children()

	           		var jh = "";
	           		for (var i = 0; i < c.length; i++) {
	           			// console.log(c[i].children[0].data)
	           			jh += c[i].children[0].data + " "; 
	           		}

	                json.jewishHistory = jh;
	                // console.log("Done with Jewish History");
	            });
            }

            function getDailyThough(json, callback) {
            	$('#DailyThoughtBody0').filter(function() {
	            	var data = $(this);

	           		var c = data.first().children()

	           		var thought = "";
	           		for (var i = 0; i < c.length; i++) {
	           			// console.log(c[i].children[0].data)
	           			thought += c[i].children[0].data + " "; 
	           		}

	                json.jewishThought = thought;

	                callback(json)
	            });

            }

            function fillJson(callback, callbackTwo) {

            	json.date = date;
            	if (json.date) {
					callback(json, callbackTwo)	
					if (json.jewishHistory && json.jewishThought) {
						// console.log(json)
						return json;
					}
            	}            	
            }

            return fillJson(getDailyThough, getJewishHistory)
        }

    });

}

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;