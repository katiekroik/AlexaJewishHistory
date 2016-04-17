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

scrape("3/27/2016")

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
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            $('#JewishHistoryBody0').filter(function() {
            	var data = $(this);
                console.log("DATA", data);

           // In examining the DOM we notice that the title rests within the first child element of the header tag. 
           // Utilizing jQuery we can easily navigate and get the text by writing the following code:
           		var c = data.first().children()
           		console.log("CHILDREN", c)
           		c.forEach(function(child) {
           			console.log(child.text);
           		})
                // title = data.children().first().text();

           // Once we have our title, we'll store it to the our json object.

                // json.title = title;
                // console.log(title);
            });


        }
    })

}

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;