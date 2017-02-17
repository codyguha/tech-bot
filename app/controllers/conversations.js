
module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    welcomeMessage(bot, message)
  })
  controller.hears(['Q5'], 'message_received', function (bot, message) {
    testQ5(bot, message, 0)
  });
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
  // controller.hears(['Continue ➡'], 'message_received', function(bot, incoming) {
  //   bot.reply(incoming, {text: "Ok let's kick off part one."});
  //   setTimeout(function() {
  //     bot.reply(incoming, {text: "In this section we are going to present you with a handful of statements.  Your job is to choose a selection form our 'agree' or 'disagree' responses."});
  //     setTimeout(function() {
  //       bot.reply(incoming, {text: "Here is our first statement"});
  //       setTimeout(function() {
  //       startSurvey(bot, incoming)
  //       }, 2000)
  //     }, 5000)
  //   }, 1000)
  // });

  controller.on('message_received', function(bot, incoming) {

  });

  controller.on('facebook_postback', function(bot, incoming) {
    if (incoming.payload === "Q_02") {
      question002(bot, incoming)
    } else if (incoming.payload === "Q_03") {
      question003start(bot, incoming)
    } else if (incoming.payload === "Q_03start") {
      question003(bot, incoming)
    } else if (incoming.payload === "Q_04") {
      question004start(bot, incoming)
    } else if (incoming.payload === "Q_05") {
      question005start(bot, incoming)
    }
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
  bot.reply(incoming, {text: "Awesome, thanks for coming along..."});
  setTimeout(function() {
    bot.reply(incoming, {text: "To kick things off lets keep things light."});
    setTimeout(function() {
      bot.reply(incoming, {text: "Here is your first question...."});
      setTimeout(function() {
        bot.reply(incoming, {text: "Which of the following items in the list below would you consider a favorite thing to do in your spare time? (Pick 1)"});
        setTimeout(function() {
          question001(bot, incoming)
        }, 1000)
      }, 1000)
    }, 1000)
  }, 1000)
}

function question001(bot, incoming) {
  var carousel_items = [
    {
    "title": "Spend time outdoors",
    "image_url": "http://imagizer.imageshack.us/600x398f/924/t86bdh.jpg"
    },{
    "title": "Watch movies or TV at home",
    "image_url": "http://imagizer.imageshack.us/600x399f/924/8hYvD2.jpg"
    },{
    "title": "Go out to dinner or bars",
    "image_url": "http://imagizer.imageshack.us/600x400f/924/V7TYMT.jpg"
    },{
    "title": "Play video games",
    "image_url": "http://imagizer.imageshack.us/600x337f/924/yrh5gF.jpg"
    },{
    "title": "Play Sports",
    "image_url": "http://imagizer.imageshack.us/512x384f/922/PN9m2J.jpg"
    },{
    "title": "Read a good book",
    "image_url": "http://imagizer.imageshack.us/600x337f/924/UzBc8d.jpg"
    },{
    "title": "Cook",
    "image_url": "http://imagizer.imageshack.us/600x316f/924/eoGJW8.jpg"
    },{
    "title": "Other Stuff",
    "image_url": "http://imagizer.imageshack.us/600x315f/921/ksKOP9.png"
    }]
  var menu_items = []
  for (i = 0; i <= carousel_items.length; ++i) {
    if (i === carousel_items.length){
      bot.reply(incoming, {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements": menu_items
          }
        }
      })
    } else {
      var menu_item = {
        "title": carousel_items[i].title,
        "image_url": carousel_items[i].image_url,
        "buttons":[
          {
            "type":"postback",
            "title": "Select",
            "payload": "Q_02"
          }
        ]
      }
      menu_items.push(menu_item);
    }
  }
}

function question002(bot, incoming) {
  bot.reply(incoming, {text: "YES! Question one and done.  🙌 "});
  setTimeout(function() {
    bot.reply(incoming, {text: "Let's continue shall we..."});
    setTimeout(function() {
      bot.reply(incoming, {text: "Whats next?"});
      setTimeout(function() {
        bot.reply(incoming, {text: "Oh wait thats my job. LOL 😂"});
        setTimeout(function() {
          bot.reply(incoming, {text: "Here is your next question."});
          setTimeout(function() {
            question002List(bot, incoming)
          }, 1000)
        }, 1000)
      }, 5000)
    }, 1000)
  }, 1000)
}

function question002List(bot, incoming){
  bot.reply(incoming, {"attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":'Imagine you had unlimited funding and never had to work. 🏝  😎  Which TWO of these listed items would you do?  HINT: click the "Show me" button to see the list.',
      "buttons":[
        {
          "type":"web_url",
          "url":"https://gentle-earth-80429.herokuapp.com/unlimited-funding/" + incoming.user,
          "title":"Show Me The List",
          "messenger_extensions": true,
          "webview_height_ratio": "tall"
        }
      ]
    }
  }});
}

function question003start(bot, incoming) {
  bot.reply(incoming, {text: "OK OK OK OK... lets stay focused."});
  setTimeout(function() {
    bot.reply(incoming, {text: "I'm still eager to learn about you though.  Let's play with some get to know you phrases... "});
    setTimeout(function() {
      bot.reply(incoming, {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"I'll say a phrase and you tell me if its a fair description .  Sound fun?",
            "buttons":[
              {
                "type":"postback",
                "title": "Sure let's do it",
                "payload": "Q_03start"
              }
            ]
          }
        }
      });
    }, 1000)
  }, 1000)
}

function question003(bot, incoming) {
  var questions = [ "I love trying out new things",
                    "I like to do a lot of research before buying new things",
                    "New technology has gotten out of control",
                    "I won’t need a new phone for at least five years",
                    "I’ve often got two or more tech devices open in front of me",
                    "People always ask me for advice when they’re deciding what new tech to buy",
                    "I know more about technology than the people covering the help phonelines",
                    "My friends and family tell me I’m addicted to my tech devices",
                    "I don’t get all the excitement people have about new technology",
                    "I’ve got so many ideas for building new phone apps" ]
  bot.startConversation(incoming, function(err, convo) {
    for (i = 0; i < questions.length; ++i) {
      if (i === (questions.length-1)) {
        convo.ask({
          text: questions[i],
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": "PAYLOAD_",
              }
          ]
        }, function(response, convo) {
          convo.stop()
          question003end(bot, incoming)
        });
      } else {
        convo.ask({
          text: questions[i],
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": "PAYLOAD_",
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": "PAYLOAD_",
              }
          ]
        }, function(response, convo) {
            convo.next();
        });
      }
    }
  });
}

function question003end(bot, incoming) {
  bot.reply(incoming, {text: "Annnd we are done."});
  setTimeout(function() {
    bot.reply(incoming, {text: "Great work! You knocked of 10 in a row like it was no big deal."});
    setTimeout(function() {
      bot.reply(incoming, {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":" lets keep pushing forward.",
            "buttons":[
              {
                "type":"postback",
                "title": "Continue",
                "payload": "Q_04"
              }
            ]
          }
        }
      });
    }, 1000)
  }, 1000)
}

function question004start(bot, incoming) {
  bot.reply(incoming, {text: "Next up is a series of THIS or THAT style questions."});
  setTimeout(function() {
    bot.reply(incoming, {text: "Your job is to pick the option that aligns best with your personal taste and interests."});
    setTimeout(function() {
      bot.reply(incoming, {text: "Let's do it... I'm all ears. 👂"});
      question004(bot, incoming)
    }, 1000)
  }, 1000)
}

function question004(bot, incoming) {
  var questions = [ {text: "I would rather read a...", option1: "Paperback Book", option2: "eBook"},
                    {text: "I would rather keep a diary...", option1: "In a notebook", option2: "On a computer"},
                    {text: "I would rather...", option1: "Watch TV", option2: "Watch YouTube or Vimeo"},
                    {text: "I would rather read...", option1: "A paper newspaper", option2: "A digital newspaper"},
                    {text: "I would rather create a poster...", option1: "With paper and scissors", option2: "Digitally"},
                    {text: "I would rather play a...", option1: "Board game", option2: "Computer game"},
                    {text: "I would rather...", option1: "Write a letter to a friend", option2: "Send an email to a friend"},
                    {text: "I would rather...", option1: "Telephone a friend", option2: "Send a text message to a friend"},
                    {text: "I would rather...", option1: "Go to the bank", option2: "Do my banking online"},
                  ]
  bot.startConversation(incoming, function(err, convo) {
    for (i = 0; i < questions.length; ++i) {
      if (i === (questions.length-1)) {
        convo.ask({
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text": questions[i].text,
              "buttons":[
                {
                  "type":"postback",
                  "title": questions[i].option1,
                  "payload": "PAYLOAD_"
                },
                {
                  "type":"postback",
                  "title": questions[i].option2,
                  "payload": "PAYLOAD_"
                }
              ]
            }
          }
        }, function(response, convo) {
          convo.stop()
          question004end(bot, incoming)
        });
      } else {
        convo.ask({
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text": questions[i].text,
              "buttons":[
                {
                  "type":"postback",
                  "title": questions[i].option1,
                  "payload": "PAYLOAD_"
                },
                {
                  "type":"postback",
                  "title": questions[i].option2,
                  "payload": "PAYLOAD_"
                }
              ]
            }
          }
        }, function(response, convo) {
            convo.next();
        });
      }
    }
  });
}

function question004end(bot, incoming) {
  bot.reply(incoming, {text: "Alrighty, up next I'm going to run you through a list of different technology gadgets."});
  setTimeout(function() {
    bot.reply(incoming, {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":'This activity is based on me presenting you with an example of a specific gadget and you telling me whether you "own it", "want it", "use it", or "dont use it".',
          "buttons":[
            {
              "type":"postback",
              "title": "Let's do it",
              "payload": "Q_05"
            }
          ]
        }
      }
    });
  }, 1000)
}

function stepper(bot, message, i){
  var index = i++
  if (index <= 9) {
    testQ5(bot, message, index)
  } else {
    console.log("DONE!")
    bot.reply(message, {text: "DONE!!!!!!!"});
  }
}

function testQ5(bot, message, i){
  var questions = [ {device_title:"Smart Watch", device_img: "http://imagizer.imageshack.us/1240x826f/922/httanx.jpg"},
                    {device_title:"Virtual Reality Headset", device_img: "http://imagizer.imageshack.us/1190x595f/923/S1Y30r.png"},
                    {device_title:"Smart TV - connected to the internet", device_img: "http://imagizer.imageshack.us/1500x1008f/922/dXxnrw.jpg"},
                    {device_title:"Landline Telephone", device_img: "http://imagizer.imageshack.us/1500x1200f/923/17xZOd.jpg"},
                    {device_title:"DVD Player", device_img: "http://imagizer.imageshack.us/400x400f/922/3cQrHt.jpg"},
                    {device_title:"Record Player", device_img: "http://imagizer.imageshack.us/1200x750f/923/yMyvY0.jpg"},
                    {device_title:"Fitness device for your wrist", device_img: "http://imagizer.imageshack.us/1130x753f/923/Wf3H23.jpg"},
                    {device_title:"Smart home device", device_img: "http://imagizer.imageshack.us/673x399f/922/Bqdn4R.jpg"},
                    {device_title:"Drone", device_img: "http://imagizer.imageshack.us/920x557f/923/w8eWhH.jpg"},
                    {device_title:"Voice Controlled Personal Assistant", device_img: "http://imagizer.imageshack.us/930x465f/924/Nvjg4y.jpg"}
                  ]
  var doYouOwnit = function(err, convo) {
    convo.say(questions[i].device_title);
    convo.ask({
        "attachment":{
          "type":"image",
          "payload":{
            "url": questions[i].device_img
          }
        },
        "quick_replies": [
            {
                "content_type": "text",
                "title": "Own it!",
                "payload": "PAYLOAD_"
            },
            {
                "content_type": "text",
                "title": "Don't own it",
                "payload": "PAYLOAD_"
            }
        ]
      }, function(response, convo) {
      ownOrNot(response, convo);
      convo.next();
    });
  };
  var ownOrNot = function(response, convo) {
    if (response.text === "Own it!"){
      convo.ask({
        text: "... and what about your usage?",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "Use it",
                "payload": "PAYLOAD_"
            },
            {
                "content_type": "text",
                "title": "Don't use it",
                "payload": "PAYLOAD_"
            }
        ]
      }, function(response, convo) {
        stepper(bot, message, i)
        convo.next();
      });
    } else {
      convo.ask({
        text: "Ok, you dont own it... but do you want to own it?",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "Yes I want it!",
                "payload": "PAYLOAD_"
            },
            {
                "content_type": "text",
                "title": "No I don't want it",
                "payload": "PAYLOAD_"
            }
        ]
      }, function(response, convo) {
        stepper(bot, message, i)
        convo.next();
      });
    }
  };

  bot.startConversation(message, doYouOwnit);
}

controller.hears(['pizzatime'], 'message_received', function(bot,message) {
  var questions = [ {device_title:"Smart Watch", device_img: "http://imagizer.imageshack.us/1240x826f/922/httanx.jpg"},
                    {device_title:"Smart Watch2", device_img: "http://imagizer.imageshack.us/1240x826f/922/httanx.jpg"},
                    {device_title:"Smart Watch3", device_img: "http://imagizer.imageshack.us/1240x826f/922/httanx.jpg"}
                  ]

    var doYouOwnit = function(err, convo) {
      convo.say(questions[0].device_title);
      convo.ask({
          "attachment":{
            "type":"image",
            "payload":{
              "url": questions[0].device_img
            }
          },
          "quick_replies": [
              {
                  "content_type": "text",
                  "title": "Own it!",
                  "payload": "PAYLOAD_"
              },
              {
                  "content_type": "text",
                  "title": "Don't own it",
                  "payload": "PAYLOAD_"
              }
          ]
        }, function(response, convo) {
        ownOrNot(response, convo);
        convo.next();
      });
    };
    var ownOrNot = function(response, convo) {
      if (response.text === "Own it!"){
        convo.ask({
          text: "... and what about your usage?",
          "quick_replies": [
              {
                  "content_type": "text",
                  "title": "Use it",
                  "payload": "PAYLOAD_"
              },
              {
                  "content_type": "text",
                  "title": "Don't use it",
                  "payload": "PAYLOAD_"
              }
          ]
        }, function(response, convo) {
          convo.next();
        });
      } else {
        convo.ask({
          text: "Ok, you dont own it... but do you want to own it?",
          "quick_replies": [
              {
                  "content_type": "text",
                  "title": "Yes I want it!",
                  "payload": "PAYLOAD_"
              },
              {
                  "content_type": "text",
                  "title": "No I don't want it",
                  "payload": "PAYLOAD_"
              }
          ]
        }, function(response, convo) {
          convo.next();
        });
      }
    };

    bot.startConversation(message, doYouOwnit);
});

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
                "title": "😒 Not likely",
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
                "title": "<<--",
                "payload": "9",
            },
            {
                "content_type": "text",
                "title": "😃 Likely",
                "payload": "8",
            },
            {
                "content_type": "text",
                "title": "<--",
                "payload": "7",
            },
            {
                "content_type": "text",
                "title": "Neutral",
                "payload": "6",
            },
            {
                "content_type": "text",
                "title": "-->",
                "payload": "5",
            },
            {
                "content_type": "text",
                "title": "😒 Not likely",
                "payload": "4",
            },
            {
                "content_type": "text",
                "title": "-->>",
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
