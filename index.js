/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Web service: communicate with an external web service to get events for specified days in history (Wikipedia API)
 * - Pagination: after obtaining a list of events, read a small subset of events and wait for user prompt to read the next subset of events by maintaining session state
 * - Dialog and Session state: Handles two models, both a one-shot ask and tell model, and a multi-turn dialog model.
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 * One-shot model:
 * User:  "Alexa, ask History Buff what happened on August thirtieth."
 * Alexa: "For August thirtieth, in 2003, [...] . Wanna go deeper in history?"
 * User: "No."
 * Alexa: "Good bye!"
 *
 * Dialog model:
 * User:  "Alexa, open History Buff"
 * Alexa: "History Buff. What day do you want events for?"
 * User:  "August thirtieth."
 * Alexa: "For August thirtieth, in 2003, [...] . Wanna go deeper in history?"
 * User:  "Yes."
 * Alexa: "In 1995, Bosnian war [...] . Wanna go deeper in history?"
 * User: "No."
 * Alexa: "Good bye!"
 */


/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');
var http = require('http');
var cheerio = require('cheerio');
var index = require('index');
var request = require('request');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to download history content from Wikipedia
 */
var urlPrefix = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext=&exsectionformat=plain&redirects=&titles=';

/**
 * Variable defining number of events to be read at one time
 */
var paginationSize = 3;

/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 2;


/**
 * HistoryBuffSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HistoryBuffSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HistoryBuffSkill.prototype = Object.create(AlexaSkill.prototype);
HistoryBuffSkill.prototype.constructor = HistoryBuffSkill;

HistoryBuffSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HistoryBuffSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

HistoryBuffSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HistoryBuffSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

HistoryBuffSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

HistoryBuffSkill.prototype.intentHandlers = {

    "GetFirstEventIntent": function (intent, session, response) {
        handleDateRequest(intent, session, response);
    },

    // "GetNextEventIntent": function (intent, session, response) {
    //     handleNextEventRequest(intent, session, response);
    // },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Jewish History, you can get historical events for any day of the year.  " +
            "For example, you could say today, or August thirtieth, or you can say exit. Now, which day do you want?";
        var repromptText = "Which day do you want?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },
	
	"GetThoughtIntent": function(intent,session,response){
		handleThoughtRequest(intent, session, response);
	},
	
	"GetDateIntent": function(intent,session, response){
		handleDateRequest(intent, session, response);
	},

    "GetTextIntent": function(intent, session, response){
        handleTextRequest(intent, session, response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "This Day in History";
    var repromptText = "With Jewish History , you can get historical events for any day of the year.  For example, you could say today, or August thirtieth. Now, which day do you want?";
    var speechText = "<p>Jewish History.</p> <p>What day do you want events for?</p>";
    var cardOutput = "Jewish History. What day do you want events for?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

function handleDateRequest(intent, session, response){
    var daySlot = intent.slots.day;
    var repromptText = "With Jewish History Buff, you can get the thought of the day.  For example, you could say today, or August thirtieth. Now, which day do you want?";
    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
    ];
    var sessionAttributes = {};
    // Read the first 3 events, then set the count to 3
    sessionAttributes.index = paginationSize;
    var date;

    // If the user provides a date, then use that, otherwise use today
    // The date is in server time, not in the user's time zone. So "today" for the user may actually be tomorrow
    if (daySlot && daySlot.value) {
        date = new Date(daySlot.value);
    } else {
        date = new Date();
    }

    var mo = date.getMonth() + 1;
    var da = date.getDate();
    var yr = date.getFullYear();

    // date = translateDate(date);
    console.log(mo, da, yr);
    date = mo + '/' + da + '/' + yr;
    // var prefixContent = "<p>For " + monthNames[date.getMonth()] + " " + date.getDate() + ", </p>";
    var cardContent = "For " + date + ", ";

    var prefixContent = "<p>For " + date + ", </p>";

    var cardTitle = "Events on " + date;

    getJsonEventsFromChabad(date, function (events) {
        console.log(events);
        var speechText = "",
            i;
        sessionAttributes.text = events;
        session.attributes = sessionAttributes;
        if (events.length == 0) {
            speechText = "There is a problem connecting to Chabad.org at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            // for (i = 0; i < paginationSize; i++) {
            //     cardContent = cardContent + events[i] + " ";
            //     speechText = "<p>" + speechText + events[i] + "</p> ";
            // }
            cardContent = cardContent + events.jewishHistory;
            speechText = "<p>" + speechText + events.jewishHistory + "</p> ";
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

}

function handleThoughtRequest(intent, session, response){
    var daySlot = intent.slots.day;
    var repromptText = "With Jewish History Buff, you can get the thought of the day.  For example, you could say today, or August thirtieth. Now, which day do you want?";
    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
    ];
    var sessionAttributes = {};
    // Read the first 3 events, then set the count to 3
    sessionAttributes.index = paginationSize;
    var date;

    // If the user provides a date, then use that, otherwise use today
    // The date is in server time, not in the user's time zone. So "today" for the user may actually be tomorrow
    if (daySlot && daySlot.value) {
        date = new Date(daySlot.value);
    } else {
        var myDay = Math.floor(Math.random()*28 + 1);
        var myMonth = Math.floor(Math.random()*12 + 1);
        var myYear = Math.floor(Math.random()*2 + 2013);
        date = new Date(myYear, myMonth, myDay);
    }

	var mo = date.getMonth() + 1;
	var da = date.getDate();
	var yr = date.getFullYear();
	
	// date = translateDate(date);
	console.log(mo, da, yr);
	date = mo + '/' + da + '/' + yr;
    // var prefixContent = "<p>For " + monthNames[date.getMonth()] + " " + date.getDate() + ", </p>";
    var cardContent = "For " + date + ", ";
	
	var prefixContent = "<p>For " + date + ", </p>";

    var cardTitle = "Events on " + date;

    getJsonEventsFromChabad(date, function (events) {
        console.log(events);
        var speechText = "",
            i;
        sessionAttributes.text = events;
        session.attributes = sessionAttributes;
        if (events.length == 0) {
            speechText = "There is a problem connecting to Chabad.org at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            // for (i = 0; i < paginationSize; i++) {
            //     cardContent = cardContent + events[i] + " ";
            //     speechText = "<p>" + speechText + events[i] + "</p> ";
            // }
            cardContent = cardContent + events.jewishThought;
            speechText = "<p>" + speechText + events.jewishThought + "</p> ";
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
}

function translateDate(date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1;
	
	var yyyy = date.getFullYear();
	
	if (dd < 10) {
		dd = "0" + dd;
	} 
	if (mm < 10) {
		mm = "0" + mm;
	}
	date = dd + '/' + mm + '/' + yyyy;
	return date;
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleFirstEventRequest(intent, session, response) {
   var daySlot = intent.slots.day;
    var repromptText = "With Jewish History Buff, you can get the thought of the day.  For example, you could say today, or August thirtieth. Now, which day do you want?";
    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
    ];
    var sessionAttributes = {};
    // Read the first 3 events, then set the count to 3
    sessionAttributes.index = paginationSize;
    var date;

    // If the user provides a date, then use that, otherwise use today
    // The date is in server time, not in the user's time zone. So "today" for the user may actually be tomorrow
    if (daySlot && daySlot.value) {
        date = new Date(daySlot.value);
    } else {
        date = new Date();
    }

    var mo = date.getMonth() + 1;
    var da = date.getDate();
    var yr = date.getFullYear();
    
    // date = translateDate(date);
    console.log(mo, da, yr);
    date = mo + '/' + da + '/' + yr;
    // var prefixContent = "<p>For " + monthNames[date.getMonth()] + " " + date.getDate() + ", </p>";
    var cardContent = "For " + date + ", ";
    
    var prefixContent = "<p>For " + date + ", </p>";

    var cardTitle = "Events on " + date;

    getJsonEventsFromChabad(date, function (events) {
        console.log(events);
        var speechText = "",
            i;
        sessionAttributes.text = events;
        session.attributes = sessionAttributes;
        if (events.length == 0) {
            speechText = "There is a problem connecting to Chabad.org at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            // for (i = 0; i < paginationSize; i++) {
            //     cardContent = cardContent + events[i] + " ";
            //     speechText = "<p>" + speechText + events[i] + "</p> ";
            // }
            cardContent = cardContent + events.jewishThought;
            speechText = "<p>" + speechText + events.jewishThought + "</p> ";
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
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
// function handleNextEventRequest(intent, session, response) {
//     var cardTitle = "More events on this day in history",
//         sessionAttributes = session.attributes,
//         result = sessionAttributes.text,
//         speechText = "",
//         cardContent = "",
//         repromptText = "Do you want to know more about what happened on this date?",
//         i;
//     if (!result) {
//         speechText = "With Jewish History, you can get historical events for any day of the year.  For example, you could say today, or August thirtieth. Now, which day do you want?";
//         cardContent = speechText;
//     } else if (sessionAttributes.index >= result.length) {
//         speechText = "There are no more events for this date. Try another date by saying <break time = \"0.3s\"/> get events for august thirtieth.";
//         cardContent = "There are no more events for this date. Try another date by saying, get events for august thirtieth.";
//     } else {
//         for (i = 0; i < paginationSize; i++) {
//             if (sessionAttributes.index>= result.length) {
//                 break;
//             }
//             speechText = speechText + "<p>" + result[sessionAttributes.index] + "</p> ";
//             cardContent = cardContent + result[sessionAttributes.index] + " ";
//             sessionAttributes.index++;
//         }
//         if (sessionAttributes.index < result.length) {
//             speechText = speechText + " Wanna go deeper in history?";
//             cardContent = cardContent + " Wanna go deeper in history?";
//         }
//     }
//     var speechOutput = {
//         speech: "<speak>" + speechText + "</speak>",
//         type: AlexaSkill.speechOutputType.SSML
//     };
//     var repromptOutput = {
//         speech: repromptText,
//         type: AlexaSkill.speechOutputType.PLAIN_TEXT
//     };
//     response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
// }


/*
    I think this might work? Can someone test check?
*/
function handleTextRequest(intent, session, response){
    // console.log('hello');
    // console.log(JSON.stringify(intent.slot));
    // response.askWithCard('hi', 'repromptOutput', 'cardTitle', 'cardContent');


    getJsonVerse(intent.slots.book.value, intent.slots.chapter.value, intent.slots.verse.value, response);
}

function getJsonVerse(book, chapter, verse, response){

    // sanitze books
    var sanitizedBook = book;
    var sanitize = {
        'kings 1' : 'I_Kings',
        'kings 2' : 'II_Kings',
        'samuel 1': 'I_Samuel',
        'samuel 2': 'II_Samuel',
        'chronicles 1' : 'I_Chronicles',
        'chronicles 2' : 'II_Chronicles',
    };
    if (sanitize[sanitizedBook]){
        sanitizedBook = sanitize[sanitizedBook];
    }

    var url = "http://www.sefaria.org/api/texts/" + sanitizedBook + '.' + chapter + '.' + verse + '?context=0';
    
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body.text);
            console.log(body.text) // Print the json response
        }
    });
    function callback(text){
        var speechOutput = {
            speech: "<speak>" + book + ' chapter ' + chapter + ' verse ' + verse + ': ' + text + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };
        var repromptOutput = {
            speech: 'Please repeat the book, chapter, and verse you want to find',
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var cardTitle = "Chapter";

        cardContent = book;
        response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
    }
        // response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        // return res.text;
}

function getJsonEventsFromChabad(date, eventCallback) {
    var url = 'http://www.chabad.org/calendar/view/day.asp?tdate=' + date;

    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseChabadJson(body);
            console.log(stringResult);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseChabadJson(html) {
    var json = { date : "", jewishHistory : "", jewishThought : ""};

    var $ = cheerio.load(html);

    function getJewishHistory(json) {
      $('#JewishHistoryBody0').filter(function() {
        var data = $(this).text();

        var jh = data.split('Link:')[0];
        jh = jh.split('Links:')[0];
        jh = jh.replace(/\r/g, '').replace(/\n/g, '').replace(/\./g, '. ');

        json.jewishHistory = jh;
      });
      return json;
    }

    function getDailyThought(json) {
      $('#DailyThoughtBody0').filter(function() {
        var data = $(this).text();

        var thought = data.split('Link:')[0];
        thought = thought.split('Links:')[0];
        thought = thought.replace(/\r/g, '').replace(/\n/g, '').replace(/\./g, '. ').replace(/\t/g, '');

        json.jewishThought = thought;
        console.log(json.jewishThought);

      });
      return json;
    }

    var ret = {};
    getJewishHistory(ret);
    getDailyThought(ret);
    return ret;
}


function getJsonEventsFromWikipedia(day, date, eventCallback) {
    var url = urlPrefix + day + '_' + date;

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

function parseJson(inputText) {
    // sizeOf (/nEvents/n) is 10
    var text = inputText.substring(inputText.indexOf("\\nEvents\\n")+10, inputText.indexOf("\\n\\n\\nBirths")),
        retArr = [],
        retString = "",
        endIndex,
        startIndex = 0;

    if (text.length == 0) {
        return retArr;
    }

    while(true) {
        endIndex = text.indexOf("\\n", startIndex+delimiterSize);
        var eventText = (endIndex == -1 ? text.substring(startIndex) : text.substring(startIndex, endIndex));
        // replace dashes returned in text from Wikipedia's API
        eventText = eventText.replace(/\\u2013\s*/g, '');
        // add comma after year so Alexa pauses before continuing with the sentence
        eventText = eventText.replace(/(^\d+)/,'$1,');
        eventText = 'In ' + eventText;
        startIndex = endIndex+delimiterSize;
        retArr.push(eventText);
        if (endIndex == -1) {
            break;
        }
    }
    if (retString != "") {
        retArr.push(retString);
    }
    retArr.reverse();
    return retArr;
}

// Create the handler that responds to the Alexa Request.
index.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new HistoryBuffSkill();
    skill.execute(event, context);
};

