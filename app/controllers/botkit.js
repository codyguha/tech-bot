var request = require('request');

var Botkit = require('botkit'),
  mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI}),
  controller = Botkit.facebookbot({
    debug: true,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
    storage: mongoStorage,
  });

var bot = controller.spawn({})

// SETUP
require('./facebook_setup')(controller)

// Conversation logic
require('./conversations')(controller)
var question003 = require('./conversations').question003

// this function processes the POST request to the webhook
var handler = function (obj) {
  controller.debug('Message received from FB')
  var message
  if (obj.entry) {
    for (var e = 0; e < obj.entry.length; e++) {
      for (var m = 0; m < obj.entry[e].messaging.length; m++) {
        var facebook_message = obj.entry[e].messaging[m]

        console.log(facebook_message)

        // normal message
        if (facebook_message.message) {
          if (facebook_message.message.quick_reply){
            message = {
              text: facebook_message.message.text,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
              seq: facebook_message.message.seq,
              mid: facebook_message.message.mid,
              attachments: facebook_message.message.attachments,
              payload: facebook_message.message.quick_reply.payload
            }

            // save if user comes from m.me adress or Facebook search
            // create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

            controller.receiveMessage(bot, message)
          } else {
            message = {
              text: facebook_message.message.text,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
              seq: facebook_message.message.seq,
              mid: facebook_message.message.mid,
              attachments: facebook_message.message.attachments,
            }

            // save if user comes from m.me adress or Facebook search
            // create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

            controller.receiveMessage(bot, message)
          }

        }
        // When a user clicks on "Send to Messenger"
        else if (facebook_message.optin ||
                (facebook_message.postback && facebook_message.postback.payload === 'optin')) {
          message = {
            optin: facebook_message.optin,
            user: facebook_message.sender.id,
            channel: facebook_message.sender.id,
            timestamp: facebook_message.timestamp
          }

            // save if user comes from "Send to Messenger"
          create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

          controller.trigger('facebook_optin', [bot, message])
        }
        // clicks on a postback action in an attachment
        else if (facebook_message.postback) {
          // trigger BOTH a facebook_postback event
          // and a normal message received event.
          // this allows developers to receive postbacks as part of a conversation.
          message = {
            payload: facebook_message.postback.payload,
            user: facebook_message.sender.id,
            channel: facebook_message.sender.id,
            timestamp: facebook_message.timestamp
          }

          controller.trigger('facebook_postback', [bot, message])

          message = {
            text: facebook_message.postback.payload,
            user: facebook_message.sender.id,
            channel: facebook_message.sender.id,
            timestamp: facebook_message.timestamp
          }

          controller.receiveMessage(bot, message)
        }
        // message delivered callback
        else if (facebook_message.delivery) {
          message = {
            optin: facebook_message.delivery,
            user: facebook_message.sender.id,
            channel: facebook_message.sender.id,
            timestamp: facebook_message.timestamp
          }

          controller.trigger('message_delivered', [bot, message])
        }
        else {
          controller.log('Got an unexpected message from Facebook: ', facebook_message)
        }
      }
    }
  }
}

var create_user_if_new = function (id, ts) {
  controller.storage.users.get(id, function (err, user) {
    if (err) {
      console.log(err)
    }
    else if (!user) {
      controller.storage.users.save({id: id, created_at: ts})
    }
  })
}

controller.on('tick', function(bot, event) { });

var statementVerify = function (id, s){
  var segment;
  if (s === "1"){
    segment = "Innovator"
  } else if  (s === "2"){
    segment = "Early Adopter"
  } else if (s === "3"){
    segment = "Early Majority"
  } else if (s === "4"){
    segment = "Late Majority"
  } else {
    segment = "Laggard"
  }
  controller.storage.users.get(id, function (err, user) {
    user.segment = segment
    controller.storage.users.save(user)
  })
  bot.say({
      text: "Thanks for that... I have put you in the "+segment+" segment. :) Is that ok?",
      channel: id,
      quick_replies: [
          {
              "content_type": "text",
              "title": "Yes",
              "payload": segment,
          },
          {
              "content_type": "text",
              "title": "No",
              "payload": segment,
          }
      ]
  });
}

var getWords = function (id, words){
  controller.storage.users.get(id, function (err, user) {
    bot.say({text: "Alright! We are done. Thanks for your time today… You are being saved to the database as a "+words[0]+", "+words[1]+", "+words[2]+", "+user.saavy+" "+user.segment+".",
     channel: id});
  })
  setTimeout(function() {
    bot.say({text: "We hope you enjoyed the activity. Here’s a fun question for you… True or false?", channel: id});
    setTimeout(function() {
      bot.say({
          text: "There are enough credit cards in circulation to span the earth over 3.5 times.",
          channel: id,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "True",
                  "payload": "credit",
              },
              {
                  "content_type": "text",
                  "title": "False",
                  "payload": "credit",
              }
          ]
      });
    }, 3000)
  }, 3000)
}
var end = function (id){
  bot.say({text: "Thanks for your time.", channel: id});
}
function startQuestion002(id) {
    bot.say({text: "Ok good work on that first exercise.  Lets continue shall we...", channel: id});
    setTimeout(function() {
      bot.say({text: "In this next exercise we will use the same interaction of showing you options in a separate browser window.", channel: id});
      setTimeout(function() {
        bot.say({text: "Here is your question.",channel: id});
        setTimeout(function() {
          question002(id)
        }, 1000)
      }, 1000)
    }, 1000)
}

function question002(id) {
  bot.reply({
    "channel": id,
    "attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Imagine you had unlimited funding and never had to work. Which TWO of these would you do?",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://gentle-earth-80429.herokuapp.com/unlimited-funding/"+ incoming.user,
          "title":"Show me the options",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        },
        {
          "type":"postback",
          "title":"Next Question",
          "payload":"Question003"
        },
        {
          "type":"postback",
          "title":"Jump to End",
          "payload":"EndSurvey"
        }
      ]
    }
  }});
}
function startQuestion003(id) {
    bot.say({text: "This part is a bit long but you can do it!  Do these statements sound like you?", channel: id});
    setTimeout(function() {
      question003(id)
    }, 1000)
}

function question003(id) {
    bot.say({text: "I love trying out new things", channel: id,
      quick_replies: [
          {
              "content_type": "text",
              "title": "Definitely me!",
              "payload": "Q003",
          },
          {
              "content_type": "text",
              "title": "Sort of me",
              "payload": "Q003",
          },
          {
              "content_type": "text",
              "title": "Not sure",
              "payload": "Q003",
          },
          {
              "content_type": "text",
              "title": "Not really me",
              "payload": "Q003",
          },
          {
              "content_type": "text",
              "title": "Not me at all!",
              "payload": "Q003",
          }
      ]
    });
}
exports.startQuestion002 = startQuestion002
exports.end = end
exports.handler = handler
exports.statementVerify = statementVerify
exports.getWords = getWords
