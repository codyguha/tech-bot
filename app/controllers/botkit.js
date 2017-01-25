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

var broadcast = function (id, list) {
  var user_data = {id: id, list: list};
  controller.storage.users.save(user_data);
  bot.say({
      text: `I bet you didn’t know there were so many types of sweeteners did you! Now tell us about which of these statements best describes how you feel about the ones you are aware of.`,
      channel: id
  });
  setTimeout(function() {
    bot.say({
        text: "Starting with... "+list[0],
        channel: id,
        quick_replies: [
            {
                "content_type": "text",
                "title": "Only type I consume",
                "payload": "question002",
            },
            {
                "content_type": "text",
                "title": "Preferred type",
                "payload": "question002",
            },
            {
                "content_type": "text",
                "title": "Consume,prefer other",
                "payload": "question002",
            },
            {
                "content_type": "text",
                "title": "I’ve tried it",
                "payload": "question002",
            },
            {
                "content_type": "text",
                "title": "Don't know much",
                "payload": "question002",
            }
        ]
    });
  }, 2000)

}

var attitudinal = function (id) {
  bot.say({
      text: `How strongly do you agree with the following statements about sugars and sweeteners?`,
      channel: id
  });
  setTimeout(function() {
    attitudinal2(id);
  }, 2000)
}
var attitudinal2 = function (id) {
  bot.say({
      text: `I think that natural sugars are better for me than artificial sweeteners`,
      channel: id,
      quick_replies: [
          {
              "content_type": "text",
              "title": "Strongly agree",
              "payload": "question008",
          },
          {
              "content_type": "text",
              "title": "Somewhat agree",
              "payload": "question008",
          },
          {
              "content_type": "text",
              "title": "Neither",
              "payload": "question008",
          },
          {
              "content_type": "text",
              "title": "Somewhat disagree",
              "payload": "question008",
          },
          {
              "content_type": "text",
              "title": "Strongly disagree",
              "payload": "question008",
          }
      ]
  });
}
var compromise = function (id , list) {
  var user_choice
  var not_user_choice
  controller.storage.users.get(id, function(err, user_data) {
    user_data.products = list
    controller.storage.users.save(user_data);
    if (user_data.preference === "I prefer natural") {
      user_choice = "natural sugars"
      not_user_choice = "artificial sweeteners"
      compchoice(id, user_choice, not_user_choice)
    } else if (user_data.preference === "I prefer artificial"){
      user_choice = "artificial sweeteners"
      not_user_choice = "natural sugars"
      compchoice(id, user_choice, not_user_choice)
    } else {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>NEITHER !!!!")
    }
  });


}
var compchoice = function (id , user_choice, not_user_choice){
  bot.say({
      text: `We know that you prefer to consume ` + user_choice + `, but life gets hectic and there are certain times and situations where it may be more difficult to stick to your preference.`,
      channel: id
  });
  setTimeout(function() {
    compromise2(id, not_user_choice);
  }, 2000)
}
var compromise2 = function (id, not_user_choice) {
  bot.say({
      text: `Imagine yourself in some of these situations – whether it’s under a time crunch, certain locations, the people you are with, etc. -- and think of when you would compromise and consume ` + not_user_choice + `.`,
      channel: id,
      quick_replies: [
          {
              "content_type": "text",
              "title": "Not Now",
              "payload": "compromise",
          },
          {
              "content_type": "text",
              "title": "Get Started",
              "payload": "compromise",
          }
      ]
  });
}
var sayThanks = function (id) {
  bot.say({
      text: `That’s all the questions we have for you today.  Thank you so much for your time – your feedback is much appreciated!  Keep your eye out in the coming months for a Shareback of what we learned from you today.`,
      channel: id
  });
  request.post('https://still-earth-50244.herokuapp.com/finished-sug', {form:{id: id}})
}

exports.sayThanks = sayThanks
exports.handler = handler
exports.broadcast = broadcast
exports.attitudinal = attitudinal
exports.compromise = compromise
