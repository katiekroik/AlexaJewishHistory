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

function scrape(date) {
	console.log("in scrape")
	url = 'http://www.chabad.org/calendar/view/day.asp?tdate=' + date;

	console.log(url)
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){

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
            	var json = { date : "", jewishHistory : "", jewishThought : ""};

            	json.date = date;
            	if (json.date) {
					callback(json, callbackTwo)
					return json;

            	}
            	// console.log("JH", json.jewishHistory, "JT", json.jewishThought)
            }

            return fillJson(getDailyThough, getJewishHistory)
        }



    });

}

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;