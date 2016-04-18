# Heritage

Heritage was creating on Hack Over Passover, winning the Technology Cup award. It is meant to help the general public learn about the Jewish Heritage, in an easy way. Jewish history is very rich, and a lot has happened over the thousands of years since we became a nation. Thus, we created this project which uses the Amazon Alexa to give an inspirational thought pertaining to a certain day, what happened in Jewish History on a certain day, or even a verse from the Bible. 

To help us do this, we used [Chabad.org](http://www.chabad.org/) and [Sefaria](http://www.sefaria.org/) which respectively gives us the quote and history of the day and the source from the bible. We would also like to extend the project to be able to ask for a quote from a certain Rabbi on a topic or even integrate it with [Mi Yodeya](http://judaism.stackexchange.com/) to answer more philosophical questions.

## Project Setup:
- Run `npm install` to install the dependencies
- Zip the directory, with the installed node_modules and upload them to the Amazon developer [console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/History?tab=code)
- Log into Amazon developer -> apps and services -> Alexa -> Jewish History. Then test
- *We want to eventually publish the app to be available on all Alexa devices, but as we are still testing, this option will be done soon*

## Alexa Setup
- Install the app
- Open the app and go to settings
- Set up new device
- Connect to the device's Wifi
- The setup will initiate, and at the end you'll need to add the local Wifi to Alexa's settings