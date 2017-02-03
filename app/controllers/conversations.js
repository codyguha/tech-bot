
module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    welcomeMessage(bot, message)
  })

  // user said hello
  controller.hears(['hi', 'hello', 'Hi'], 'message_received', function (bot, message) {
    welcomeMessage(bot, message)
  });
  controller.hears(['NPS'], 'message_received', function (bot, message) {
    npsSurveyStart(bot, message)
  });
  controller.hears(['Yes', 'No'], 'message_received', function (bot, incoming) {
    controller.storage.users.get(incoming.user, function (err, user) {
      bot.reply(incoming, "Excellent!  So far I have you pinned as a "+user.saavy+" "+user.segment+".");
      setTimeout(function() {
        lastQuestion(bot, incoming)
      }, 1000)
    })
  });
  controller.hears(['True', 'False'], 'message_received', function(bot, incoming) {
    bot.reply(incoming, {text: "We’re not sure either, but from what we hear…"});
    setTimeout(function() {
      bot.reply(incoming, {text: "According to the financial reports of the three largest credit card companies in the world, there were over 1,635 million cards in circulation in 2013: Visa had 800 million, MasterCard had 731 million, and American Express had 104 million."});
      setTimeout(function() {
        bot.reply(incoming, {text: "If you placed all those cards side by side, you could span 86,981 miles: the equivalent of three and a half trips around the world."});
        setTimeout(function() {
          bot.reply(incoming, {text: "We look forward to talking to you again in our next activity."});
        }, 1000)
      }, 3000)
    }, 1000)
  });
  controller.hears(['Restart'], 'message_received', function(bot, incoming) {
    welcomeMessage(bot, incoming);
  });

  controller.hears(['what can I do here?'], 'message_received', function(bot, message) {
      bot.reply(message, "You can share with me your views and opinions about technology!");
  });

  controller.hears(['help'], 'message_received', function(bot, message) {
      bot.reply(message, "type 'hi'");
  });
  controller.hears(['Continue ➡'], 'message_received', function(bot, incoming) {
    bot.reply(incoming, {text: "Ok let's kick off part one."});
    setTimeout(function() {
      bot.reply(incoming, {text: "In this section we are going to present you with a handful of statements.  Your job is to choose a selection form our 'agree' or 'disagree' responses."});
      setTimeout(function() {
        bot.reply(incoming, {text: "Here is our first statement"});
        setTimeout(function() {
        startSurvey(bot, incoming)
        }, 2000)
      }, 2000)
    }, 1000)
  });

  controller.on('message_received', function(bot, incoming) {

  });

function welcomeMessage(bot, incoming){
  var id = incoming.user
  controller.storage.users.get(id, function (err, user) {
    if (err) {
      console.log(err)
    }
    else if (!user) {
      controller.storage.users.save({id: id})
    }
  })
  bot.reply(incoming, {text: "Welcome!"});
  setTimeout(function() {
    bot.reply(incoming, {text: "In this short survey, we are seeking to understand your approach towards technology and related products. As with all of our studies, your responses will remain entirely confidential and will be reported on an aggregate basis only. None of your personal data will be shared or used for marketing purposes."});
    setTimeout(function() {
      bot.reply(incoming, {text: "Sound good?", quick_replies: [{"content_type": "text","title": "Continue ➡","payload": "Continue ➡"}]});
    }, 5000)
  }, 1000)
}

function startSurvey(bot, incoming){
  var score = 0
  var questions = [ "My friends and family often ask me for advice when purchasing technology",
                    "I rarely buy off the shelf Consumer Electronic products, I like to assemble my Consumer Electronics products and customize the functionality",
                    "I am a risk taker",
                    "I’m the kind of person who knows what I want and how to achieve it ",
                    "I seek out the Consumer Electronics products with the most advanced features",
                    "I am the first among my friends and family to experience something new",
                    "I like having technology that is different, cutting-edge, and sets me apart from the crowd",
                    "I’m often multi-tasking with more than one device (tablet, computer or phone)",
                    "I want devices that say a lot about who I am",
                    "I feel confident in my views and choices" ]
  bot.startConversation(incoming, function(err, convo) {
    for (i = 0; i < questions.length; ++i) {
      if (i === (questions.length-1)) {
        convo.ask({
          text: questions[i],
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Strongly Agree",
                  "payload": "5",
              },
              {
                  "content_type": "text",
                  "title": "Somewhat Agree",
                  "payload": "4",
              },
              {
                  "content_type": "text",
                  "title": "Neither",
                  "payload": "3",
              },
              {
                  "content_type": "text",
                  "title": "Somewhat Disagree",
                  "payload": "2",
              },
              {
                  "content_type": "text",
                  "title": "Strongly Disagree",
                  "payload": "1",
              }
          ]
        }, function(response, convo) {
          score += +response.payload
          convo.stop()
          giveResults(bot, incoming, score)
        });
      } else {
        convo.ask({
          text: questions[i],
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Strongly Agree",
                  "payload": "5",
              },
              {
                  "content_type": "text",
                  "title": "Somewhat Agree",
                  "payload": "4",
              },
              {
                  "content_type": "text",
                  "title": "Neither",
                  "payload": "3",
              },
              {
                  "content_type": "text",
                  "title": "Somewhat Disagree",
                  "payload": "2",
              },
              {
                  "content_type": "text",
                  "title": "Strongly Disagree",
                  "payload": "1",
              }
          ]
        }, function(response, convo) {
          if (response.payload){
            score += +response.payload
            convo.next();
          }else {
            convo.stop()
          }

        });
      }
    }
  });
}

function giveResults(bot, incoming, user_score) {
  var saavy;
  if (user_score === 50){
    saavy = "Extremely Tech Saavy"
  } else if (user_score >= 35 && user_score < 50){
    saavy = "Very Tech Saavy"
  } else if (user_score >= 25 && user_score < 35){
    saavy = "Somewhat Tech Saavy"
  } else if (user_score < 25){
    saavy = "Not Very Tech Saavy"
  }
  controller.storage.users.get(incoming.user, function (err, user) {
    user.score = user_score
    user.saavy = saavy
    controller.storage.users.save(user)
  })
  bot.reply(incoming, {text: "Nice! Your score was "+user_score+"/50.  I'm going to rank you as: '"+saavy+"'."});
  setTimeout(function() {
    segmentation(bot, incoming)
  }, 1000)
}

function segmentation(bot, incoming){
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Now I want to understand you a little bit further... I am going to present you with 5 statements. Choose the statement that best describes you",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://gentle-earth-80429.herokuapp.com/statements/" + incoming.user,
          "title":"Show Me The Statements",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}

function lastQuestion(bot, incoming) {
  bot.reply(incoming, {
      text: `You’re almost done!`,
  });
  setTimeout(function() {
    lastQuestion2(bot, incoming);
  }, 1000)
}
function lastQuestion2(bot, incoming) {
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Finally, I want to understand you even further. Choose three words from a list to capture what you’re all about.",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://gentle-earth-80429.herokuapp.com/words/"+ incoming.user,
          "title":"Show Me The Words",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}

function npsSurveyStart(bot, incoming) {
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
        text: `Based on your experience with ACME, how likely would you be to recommend ACME to a friend, family member or colleague?`,
        quick_replies: [
            {
                "content_type": "text",
                "title": "😍 Extremely likely",
                "payload": "10",
            },
            {
                "content_type": "text",
                "title": "<<",
                "payload": "9",
            },
            {
                "content_type": "text",
                "title": "😃 Likely",
                "payload": "8",
            },
            {
                "content_type": "text",
                "title": "<",
                "payload": "7",
            },
            {
                "content_type": "text",
                "title": "Neutral",
                "payload": "6",
            },
            {
                "content_type": "text",
                "title": ">",
                "payload": "5",
            },
            {
                "content_type": "text",
                "title": "😒 Not likely",
                "payload": "4",
            },
            {
                "content_type": "text",
                "title": ">>",
                "payload": "3",
            },
            {
                "content_type": "text",
                "title": "😠 Not likely at all",
                "payload": "2",
            },
            {
                "content_type": "text",
                "title": "I do not use banks",
                "payload": "1",
            }
        ]
    }, function(response, convo) {
      convo.stop()
      if (+response.payload <= 7){
        unhappyProbe(bot, incoming)
      } else if (+response.payload === 10 ){
        happyProbe(bot, incoming)
      } else if (+response.payload < 10 && +response.payload >= 8 ){
        semihappyProbe(bot, incoming)
      } else {
      }
    });
  });
}

function unhappyProbe(bot, incoming){
  bot.reply(incoming, {
      text: `Sorry to hear that you are not happy with ACME!`,
  });
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
      text: "In a few words, can you tell us what is not working for you?",
    }, function(response, convo) {
      bot.reply(incoming, {
          text: `Thanks for that!`,
      });
      convo.stop()
      unhappyProbe2(bot, incoming)
    });
  });
}
function unhappyProbe2(bot, incoming){
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
      text: "Is there one think that ACME can change to make you happier?",
    }, function(response, convo) {
      bot.reply(incoming, {
          text: `Thanks!`,
      });
      convo.stop()
      activity(bot, incoming)
    });
  });
}
function happyProbe(bot, incoming){
  bot.reply(incoming, {
      text: `That’s great that you are happy with ACME!`,
  });
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
      text: "We like a pat on the back, can you tell us why?",
    }, function(response, convo) {
      bot.reply(incoming, {
          text: `Thanks for that!`,
      });
      convo.stop()
      activity(bot, incoming)
    });
  });
}
function semihappyProbe(bot, incoming){
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
      text: "Is there one thing that ACME can change to make you happier?",
    }, function(response, convo) {
      bot.reply(incoming, {
          text: `Thanks!`,
      });
      convo.stop()
      activity(bot, incoming)
    });
  });
}
function activity(bot, incoming){
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Finally, Which of the following interactions have you had with ACME in the last week?",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://gentle-earth-80429.herokuapp.com/activities/"+ incoming.user,
          "title":"What I did last week",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}
}
