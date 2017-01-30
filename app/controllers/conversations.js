
module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    welcomeMessage(bot, message)
  })

  // user said hello
  controller.hears(['hi', 'hello', 'Hi'], 'message_received', function (bot, message) {
    welcomeMessage(bot, message)
  });
  controller.hears(['Yes', 'No'], 'message_received', function (bot, incoming) {
    controller.storage.users.get(incoming.user, function (err, user) {
      bot.reply(incoming, "Excellent!  So far I have you pinned as a "+user.saavy+" "+user.segment+".");
      setTimeout(function() {
        lastQuestion(bot, incoming)
      }, 1000)
    })
  });

  controller.hears(['what can I do here?'], 'message_received', function(bot, message) {
      bot.reply(message, "In the future i will be able to determine your sugar IQ!");
  });

  controller.hears(['help'], 'message_received', function(bot, message) {
      bot.reply(message, "type 'hi'");
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
      bot.reply(incoming, {text: "Please choose to agree or disagree with the following statements."});
      setTimeout(function() {
        startSurvey(bot, incoming)
      }, 1000)
    }, 6000)
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
            score += +response.payload
            convo.next();
          console.log("SCORE>>>>>>>: " + score)
          console.log("POINTS>>>>>>>: " + response.payload)
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
    console.log(user)
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


}
