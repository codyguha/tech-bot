
module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    bot.reply(message, {
      text: "Would you like to take a not so quick survey about sugar?",
      quick_replies: [
          {
              "content_type": "text",
              "title": "Yes",
              "payload": "start",
          },
          {
              "content_type": "text",
              "title": "No",
              "payload": "start",
          }
      ]
    });
  })

  // user said hello
  controller.hears(['hi', 'hello', 'Hi'], 'message_received', function (bot, message) {
    welcomeMessage(bot, message)
  });
  controller.hears(['Yes'], 'message_received', function (bot, message) {
    bot.reply(message, {"attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"We know there are heaps of different sugars and sweeteners on the market right now so first we would like to know which ones you’ve heard of. Please click on all the products below that you are aware of:",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://lit-thicket-26597.herokuapp.com/list/"+ message.user,
            "title":"Show List",
            "messenger_extensions": true,
            "webview_height_ratio": "tall"
          }
        ]
      }
    }})
  });
  controller.hears(['Q2'], 'message_received', function (bot, message) {
    bot.reply(message, {"attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"There’s a wide variety in terms of what each sugar/sweetener type is made of, how it’s made, etc.  We want to know how you would classify each of these by ranking them where #1 is the most natural down to the most artificial.",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://lit-thicket-26597.herokuapp.com/rank",
            "title":"Rank Sugars",
            "messenger_extensions": true,
            "webview_height_ratio": "tall"
          }
        ]
      }
    }})
  });

  controller.hears(['what can I do here?'], 'message_received', function(bot, message) {
      bot.reply(message, "In the future i will be able to determine your sugar IQ!");
  });

  controller.hears(['help'], 'message_received', function(bot, message) {
      bot.reply(message, "type 'hi'");
  });

  controller.on('message_received', function(bot, incoming) {
      if (incoming.payload){
        if (incoming.payload === "question009") {
          controller.storage.users.get(incoming.user, function(err, user_data) {
            user_data.preference = incoming.text
            controller.storage.users.save(user_data);
          });
          bot.startConversation(incoming, function(err, convo) {
            convo.ask({
              text: "why is that?"
            }, function(response, convo) {
              controller.storage.users.get(incoming.user, function(err, user_data) {
                user_data.reason = response.text
                controller.storage.users.save(user_data);
              });
              convo.stop();
              productPreference(bot, incoming)
            });
          });
        }else if(incoming.payload === "compromise") {
          controller.storage.users.get(incoming.user, function(err, user_data) {
            if (user_data.preference === "I prefer natural") {
              var user_choice = "natural sugars"
              var not_user_choice = "artificial sweeteners"
              compromiseConvo(bot, incoming, user_choice, not_user_choice)
            } else if (user_data.preference === "I prefer artificial"){
              user_choice = "artificial sweeteners"
              not_user_choice = "natural sugars"
              compromiseConvo(bot, incoming, user_choice, not_user_choice)
            }
          });
        }else if(incoming.payload === "timeofday"){
          lastQuestion(bot, incoming)
        }else if (incoming.payload === "question002") {
          controller.storage.users.get(incoming.user, function(err, user_data) {
            var list = user_data.list
            bot.startConversation(incoming, function(err, convo) {
              for (i = 1; i < list.length; ++i) {
                if (i === (list.length-1)) {
                  console.log(list[i]);
                  convo.ask({
                    text: "and finally... " + list[i] + "?",
                    quick_replies: [
                        {
                            "content_type": "text",
                            "title": "Only type I consume",
                            "payload": "question003",
                        },
                        {
                            "content_type": "text",
                            "title": "Preferred type",
                            "payload": "question003",
                        },
                        {
                            "content_type": "text",
                            "title": "Consume,prefer other",
                            "payload": "question003",
                        },
                        {
                            "content_type": "text",
                            "title": "I’ve tried it",
                            "payload": "question003",
                        },
                        {
                            "content_type": "text",
                            "title": "Don't know much",
                            "payload": "question003",
                        }
                    ]
                  }, function(response, convo) {
                    convo.stop()
                    askNextQuestion(bot, incoming);
                  });
                } else {
                  console.log(list[i]);
                  convo.ask({
                    text: "and what about... " + list[i] + "?",
                    quick_replies: [
                        {
                            "content_type": "text",
                            "title": "Only type I consume",
                            "payload": "333",
                        },
                        {
                            "content_type": "text",
                            "title": "Preferred type",
                            "payload": "333",
                        },
                        {
                            "content_type": "text",
                            "title": "Consume,prefer other",
                            "payload": "333",
                        },
                        {
                            "content_type": "text",
                            "title": "I’ve tried it",
                            "payload": "333",
                        },
                        {
                            "content_type": "text",
                            "title": "Don't know much",
                            "payload": "333",
                        }
                    ]
                  }, function(response, convo) {
                    convo.next();
                  });
                }
              }
            });
          });
        } else if(incoming.payload === "question008"){
          var questions = [ "I pay close attention to the type(s) of sugar or sweetener in the products I buy",
                            "I would rather consume a lower/zero calorie sugar substitute",
                            "I would feel guilty feeding artificial sweeteners to my family",
                            "I buy whatever is available, regardless of sugar type",
                            "Some artificial sweeteners are better for me than others",
                            "I lean more towards sugar than sweeteners",
                            "Some natural sugars are better for me than others",
                            "I would like to see more choice of sweeteners across the products I buy",
                            "I am more of a sweetener person than a sugar person" ]
          bot.startConversation(incoming, function(err, convo) {
              for (i = 1; i < questions.length; ++i) {
                if (i === (questions.length-1)) {
                  convo.ask({
                    text: questions[i],
                    quick_replies: [
                        {
                            "content_type": "text",
                            "title": "Strongly Agree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Somewhat Agree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Neither",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Somewhat Disagree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Strongly Disagree",
                            "payload": "888",
                        }
                    ]
                  }, function(response, convo) {
                    convo.stop()
                    naturalOrArtificial(bot, incoming)
                  });
                } else {
                  convo.ask({
                    text: questions[i],
                    quick_replies: [
                        {
                            "content_type": "text",
                            "title": "Strongly agree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Somewhat agree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Neither",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Somewhat disagree",
                            "payload": "888",
                        },
                        {
                            "content_type": "text",
                            "title": "Strongly disagree",
                            "payload": "888",
                        }
                    ]
                  }, function(response, convo) {
                    convo.next();
                  });
                }
              }
          });
        }
      } else {
        var object = JSON.stringify(incoming, null, 4);
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + object)
      }

  });
var score = 0;
function welcomeMessage(bot, incoming){
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
  score = 0
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
    for (i = 1; i < questions.length; ++i) {
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
          var object = JSON.stringify(response, null, 4);
          console.log("L-RESPONSE:>>>>>>>>>>>>> " + object)
          score += +response.payload
          console.log("SCORE:>>>>>>>>>>>>> " + score)
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
          if (response.payload === undefined) {
            convo.next();
          } else {
            console.log("RESPONSE:>>>>>>>>>>>>> " + response.payload)
            var int = +response.payload
            score += int
            console.log("INT:>>>>>>>>>>>>> " + int)
            console.log("SCORE:>>>>>>>>>>>>> " + score)
            convo.next();
          }
        });
      }
    }
  });
}

function giveResults(bot, incoming, score) {
  var segment;
  if (score === 50){
    segment = "Most Tech Saavy"
  } else if (score >= 35 && score < 50){
    segment = "Very Tech Saavy"
  } else if (score >= 25 && score < 35){
    segment = "Somewhat Tech Saavy"
  } else if (score < 25){
    segment = "Not Very Tech Saavy"
  }
  bot.reply(incoming, {text: "Nice! Your score was "+score+"/50.  You are ranked as: "+segment+"."});
}

function naturalOrArtificial(bot, incoming){
  bot.say({
    channel: incoming.user,
    text: "Given the choice, do you have a preference between natural sugars or artificial sweeteners?",
    quick_replies: [
        {
            "content_type": "text",
            "title": "I prefer natural",
            "payload": "question009",
        },
        {
            "content_type": "text",
            "title": "I prefer artificial",
            "payload": "question009",
        },
        {
            "content_type": "text",
            "title": "No preference",
            "payload": "question009",
        }
    ]
  });
}

function productPreference(bot, incoming){
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Thanks for your input – the sugar vs. sweetener issue can be quite a hot topic.  Switching gears a bit from sugar vs. sweetener, we’d like to know which of the following products you would consider purchasing and which you would not.",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://lit-thicket-26597.herokuapp.com/products/" + incoming.user,
          "title":"Show Me The Products",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}

function compromiseConvo(bot, incoming, user_choice, not_user_choice) {
  var questions = [ "There is a brand that I like which contains " + not_user_choice,
                    "The " + user_choice + " option is significantly more expensive",
                    "I would have to go out of my way in terms of convenience to seek out a "+user_choice+" alternative to what is on offer",
                    "I am with other people (friends, colleagues, etc.) who are consuming products with " +not_user_choice
                     ]
  bot.startConversation(incoming, function(err, convo) {
      for (i = 1; i < questions.length; ++i) {
        if (i === (questions.length-1)) {
          convo.ask({
            text: questions[i],
            quick_replies: [
                {
                    "content_type": "text",
                    "title": "Very unlikely",
                    "payload": "compromise2",
                },
                {
                    "content_type": "text",
                    "title": "Somewhat unlikely",
                    "payload": "compromise2",
                },
                {
                    "content_type": "text",
                    "title": "Somewhat likely",
                    "payload": "compromise2",
                },
                {
                    "content_type": "text",
                    "title": "Very likely",
                    "payload": "compromise2",
                }
            ]
          }, function(response, convo) {
            convo.stop()
            compromise3(bot, incoming, user_choice, not_user_choice)
          });
        } else {
          convo.ask({
            text: questions[i],
            quick_replies: [
                {
                    "content_type": "text",
                    "title": "Very unlikely",
                    "payload": "888",
                },
                {
                    "content_type": "text",
                    "title": "Somewhat unlikely",
                    "payload": "888",
                },
                {
                    "content_type": "text",
                    "title": "Somewhat likely",
                    "payload": "888",
                },
                {
                    "content_type": "text",
                    "title": "Very likely",
                    "payload": "888",
                }
            ]
          }, function(response, convo) {
            convo.next();
          });
        }
      }
  });
}

function compromise3(bot, incoming, user_choice, not_user_choice){
  bot.startConversation(incoming, function(err, convo) {
    convo.ask({
      text: "We appreciate that you prefer "+user_choice+", but let’s imagine that you had to consider "+not_user_choice+".  When would you be mostly likely to consider a product with "+not_user_choice+"?",
      quick_replies: [
          {
              "content_type": "text",
              "title": "Morning",
              "payload": "999",
          },
          {
              "content_type": "text",
              "title": "Midday",
              "payload": "999",
          },
          {
              "content_type": "text",
              "title": "Afternoon",
              "payload": "999",
          },
          {
              "content_type": "text",
              "title": "Evening",
              "payload": "999",
          },
          {
              "content_type": "text",
              "title": "Late night",
              "payload": "999",
          },
          {
              "content_type": "text",
              "title": "I would never",
              "payload": "999",
          }
      ]
    }, function(response, convo) {
      convo.next()
      convo.ask({
        text: "Is there a particular meal occasion when you would be more likely to consider a product with "+not_user_choice+"?",
        quick_replies: [
            {
                "content_type": "text",
                "title": "Breakfast",
                "payload": "timeofday",
            },
            {
                "content_type": "text",
                "title": "Mid-morning snack",
                "payload": "timeofday",
            },
            {
                "content_type": "text",
                "title": "Lunch",
                "payload": "timeofday",
            },
            {
                "content_type": "text",
                "title": "Afternoon snack",
                "payload": "timeofday",
            },
            {
                "content_type": "text",
                "title": "Dinner",
                "payload": "timeofday",
            },
            {
                "content_type": "text",
                "title": "I would never",
                "payload": "timeofday",
            }
        ]
      }, function(response, convo) {
        lastQuestion(bot, incoming)
        convo.next();
      });
    });
  });
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
  bot.reply(incoming, {
      text: `We all know how first impressions work – we tend to make certain assumptions about someone the first time we see them.  You may change your impression of someone over time but we’d like to tap into what you think at first sight.`,
  });
  setTimeout(function() {
    lastQuestion3(bot, incoming);
  }, 2000)
}
function lastQuestion3(bot, incoming) {
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"We would like you to imagine that natural sugar and artificial sweetener are people, and choose which of these people they would be based on your first impression.  You may only choose one person for each.",
      "buttons":[
        {
          "type":"web_url",
          "url":"https://lit-thicket-26597.herokuapp.com/people/"+ incoming.user,
          "title":"Show Me The People",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}

// controller.hears(['I prefer natural', 'I prefer artificial', 'No preference'], 'message_received', function(bot, incoming) {
//   convo.ask({
//     text: "why?"
//   }, function(response, convo) {
//     console.log('whoa')// whoa, I got the postback payload as a response to my convo.ask!
//     convo.next();
//   });
// });
  // user says anything else
  // controller.hears('(.*)', 'message_received', function (bot, message) {
  //   bot.reply(message, 'you said ' + message.match[1])
  // });
}
