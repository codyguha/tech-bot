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
                  if (facebook_message.postback.referral) {
                    message = {
                      optin: facebook_message.optin,
                      user: facebook_message.sender.id,
                      channel: facebook_message.sender.id,
                      timestamp: facebook_message.timestamp,
                      ref: facebook_message.postback.referral.ref
                    }
                  } else {
                    message = {
                      optin: facebook_message.optin,
                      user: facebook_message.sender.id,
                      channel: facebook_message.sender.id,
                      timestamp: facebook_message.timestamp
                    }
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
        } else if (facebook_message.referral) {
                          var message = {
                              user: facebook_message.sender.id,
                              channel: facebook_message.sender.id,
                              timestamp: facebook_message.timestamp,
                              referral: facebook_message.referral,
                          };
          controller.trigger('facebook_referral', [bot, message]);
        } else {
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

var end = function (id){
  bot.say({text: "Thanks for your time.", channel: id});
}

var endQuestion002 = function(id) {
  bot.say({
  text: "That's a wonderous set of selections.  When you win the lottery dont forget about me.",
  channel: id});
  setTimeout(function() {
    bot.say({
      "channel": id,
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"No, seriously... besties for life right?  🤓",
        "buttons":[
          {
            "type":"postback",
            "title": "Next Question",
            "payload": "Q_03"
          }
        ]
      }
    }});
  }, 1000)
};

exports.endQuestion002 = endQuestion002
exports.handler = handler
