var moment = require('moment');

module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    var id = message.user
    if (message.ref) {
      var ref = message.ref
      var ref_values = ref.split(",")
      var fedResId = ref_values[0].substring(ref_values[0].indexOf("=") + 1)
      var pId = ref_values[1].substring(ref_values[1].indexOf("=") + 1)
      controller.storage.users.get(id, function (err, user) {
        if (err) {
          console.log(err)
        } else if (!user) {
          controller.storage.users.save({id: id, fedResponseId: fedResId, pId: pId})
        }
        welcomeMessage(bot, message)
        // referralMsg(bot, message, fedResId, pId)
      })
    } else {
      welcomeMessage(bot, message)
    }
  })

  controller.on('facebook_referral', function(bot, message) {
    var id = message.user
    var ref = message.referral.ref
    var ref_values = ref.split(",")
    var fedResId = ref_values[0].substring(ref_values[0].indexOf("=") + 1)
    var pId = ref_values[1].substring(ref_values[1].indexOf("=") + 1)
    controller.storage.users.get(id, function (err, user) {
      if (err) {
        console.log(err)
      } else if (!user) {
        controller.storage.users.save({id: id, fedResponseId: fedResId, pId: pId})
      }
      welcomeMessage(bot, message)
      // referralMsg(bot, message, fedResId, pId)
    })
  });

  controller.hears(['NPS'], 'message_received', function (bot, message) {
    npsSurveyStart(bot, message)
  });

  controller.hears(['Restart'], 'message_received', function(bot, incoming) {
    welcomeMessage(bot, incoming);
  });

  controller.hears(['what can I do here?'], 'message_received', function(bot, message) {
      bot.reply(message, "You can share with me your views and opinions about technology!");
  });

  controller.hears(['help'], 'message_received', function(bot, incoming) {
    bot.reply(incoming, {"attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":'Contact support@angusreidforum.com for help or suggestions',
        "buttons":[
          {
            "type":"web_url",
            "url":"https://gentle-earth-80429.herokuapp.com/email/" + incoming.user,
            "title":"📧 Email now!",
            "messenger_extensions": true,
            "webview_height_ratio": "compact"
          }
        ]
      }
    }});
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
      question005(bot, incoming)
    } else if (incoming.payload === "Q_07") {
      sayThanks(bot, incoming)
    }
  });

function referralMsg(bot, incoming, frid, pid){
  bot.reply(incoming, {text: "oooooo a referral from somewhere :)"});
  setTimeout(function() {
    bot.reply(incoming, {text: "your FRID is: " + frid});
    setTimeout(function() {
      bot.reply(incoming, {text: "your PID is: " + pid});
      setTimeout(function() {
        bot.reply(incoming, {text: "and finally, here is that magic link with the values appended: http://www.samplicio.us/router/ClientCallBack.aspx?fedResponseStatus=10&fedResponseID="+frid+"&PID="+pid});
      }, 2000)
    }, 2000)
  }, 2000)
}

function welcomeMessage(bot, incoming){
  var timeInMs = Date.now();
  var id = incoming.user
  controller.storage.users.get(id, function (err, user) {
    if (err) {
      console.log(err)
    }
    else if (!user) {
      controller.storage.users.save({id: id, start_time: timeInMs})
    }
    else {
      user.start_time = timeInMs
      controller.storage.users.save(user)
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

function sayThanks(bot, incoming){
  var end_time = Date.now();
  controller.storage.users.get(incoming.user, function (err, user) {
    user.end_time = end_time
    total_time = end_time - user.start_time
    var min = (total_time/1000/60) << 0
    var sec = (total_time/1000) % 60;
    user.total_time = min + ':' + sec
    controller.storage.users.save(user)
    var frid = user.fedResponseId;
    var pid = user.pId;
    bot.reply(incoming, {
      text: "Thanks for taking the time to participate in this questionaire.  We appreciate your input."
    });
    setTimeout(function() {
      bot.reply(incoming, {
        text: "Follow this link http://www.samplicio.us/router/ClientCallBack.aspx?fedResponseStatus=10&fedResponseID="+frid+"&PID="+pid+" to claim your prize! 🎁"
      });
    }, 1000)
  });
}

function question001(bot, incoming) {
  var carousel_items = shuffle([
    {
    "title": "Spend time outdoors",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/outdoors.jpg"
    },{
    "title": "Watch movies or TV at home",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/movies_TV.jpg"
    },{
    "title": "Go out to dinner or bars",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/dinner_bar.jpg"
    },{
    "title": "Play video games",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/video_games.jpg"
    },{
    "title": "Play Sports",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/play_sports.jpg"
    },{
    "title": "Read a good book",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/reading_book.jpg"
    },{
    "title": "Cook",
    "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/cook.jpg"
  }])
  var menu_items = []
  for (i = 0; i <= carousel_items.length; ++i) {
    if (i === carousel_items.length){
      menu_items.push({
        "title": "Other Stuff",
        "image_url": "https://gentle-earth-80429.herokuapp.com/images/Question1/other_stuff.png",
        "buttons":[
          {
            "type":"postback",
            "title": "Select",
            "payload": "Q_02"
          }
        ]
      });
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
  bot.reply(incoming, {text: "NICE! One question down, 6 more to go.  🙌"});
  setTimeout(function() {
    bot.reply(incoming, {text: "Whats next?"});
    setTimeout(function() {
      bot.reply(incoming, {text: "Oh wait thats my job. LOL"});
      setTimeout(function() {
        bot.reply(incoming, {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://gentle-earth-80429.herokuapp.com/images/supporting_emojis/laughing.png"
              }
            }
          });
        setTimeout(function() {
          bot.reply(incoming, {text: "Here is your next question."});
          setTimeout(function() {
            question002List(bot, incoming)
          }, 1000)
        }, 2000)
      }, 1000)
    }, 5000)
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
  bot.reply(incoming, {text: "You're doing awesome. We've already landed at question 3 of 6."});
  setTimeout(function() {
    bot.reply(incoming, {text: 'Next up we are going to try out some "get to know you phrases."'});
    setTimeout(function() {
      bot.reply(incoming, {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"I'll say a phrase and you tell me if its a fair description of your personality.",
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
  var questions = shuffle([ "I love trying out new things",
                    "I like to do a lot of research before buying new things",
                    "New technology has gotten out of control",
                    "I won’t need a new phone for at least five years",
                    "I’ve often got two or more tech devices open in front of me",
                    "People always ask me for advice when they’re deciding what new tech to buy",
                    "I know more about technology than the people covering the help phonelines",
                    "My friends and family tell me I’m addicted to my tech devices",
                    "I don’t get all the excitement people have about new technology",
                    "I’ve got so many ideas for building new phone apps" ])
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
      } else if (i === 0) {
        convo.say('Here is our first of ten phrases')
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
      } else if (i === 1) {
        convo.say('You got it.');
        convo.say('Next phrase...')
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
      }  else if (i === 4) {
        convo.say('Keep going you are killing it!');
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
    bot.reply(incoming, {text: "Great work! You knocked out all 10 like nobody's business."});
    setTimeout(function() {
      bot.reply(incoming, {
          "attachment":{
            "type":"image",
            "payload":{
              "url": "https://gentle-earth-80429.herokuapp.com/images/supporting_emojis/hangloose.png"
            }
          }
        });
      setTimeout(function() {
        bot.reply(incoming, {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text":" Lets keep going.",
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
  var questions = shuffle([ {text: "I would rather read a...", option1: "Paperback Book", option2: "eBook"},
                    {text: "I would rather keep a diary...", option1: "In a notebook", option2: "On a computer"},
                    {text: "I would rather watch...", option1: "TV", option2: "YouTube or Vimeo"},
                    {text: "I would rather read...", option1: "A paper newspaper", option2: "A digital newspaper"},
                    {text: "I would rather create a poster with...", option1: "Paper and scissors", option2: "Software"},
                    {text: "I would rather play a...", option1: "Board game", option2: "Computer game"},
                    {text: "I would rather write a letter to a friend with...", option1: "A Pen and Paper", option2: "An Email"},
                    {text: "I would rather contact a friend with a...", option1: "Telephone call", option2: "Text message"},
                    {text: "I would rather...", option1: "Go to the bank", option2: "Do my banking online"},
                  ])
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

function question005(bot, message){
  var questions = shuffle([ {device_title:"Smart Watch", device_img: "https://gentle-earth-80429.herokuapp.com/images/Question5/smart_watch.jpg"},
                    {device_title:"Virtual Reality Headset", device_img: "https://gentle-earth-80429.herokuapp.com/images/Question5/vr_headset.jpg"},
                    {device_title:"Landline Telephone", device_img: "https://gentle-earth-80429.herokuapp.com/images/Question5/telephone_landline.jpg"},
                    {device_title:"DVD Player", device_img: "https://gentle-earth-80429.herokuapp.com/images/Question5/dvd_player.jpg"},
                    {device_title:"Record Player", device_img: "https://gentle-earth-80429.herokuapp.com/images/Question5/record_player.jpg"},
                  ])
  function stepper(bot, message, i){
    if (i === 4) {
      question006start(bot, message)
    } else {
      i++
      question005question(bot, message, i)
    }
  }
  function question005question(bot, message, i){
    var doYouOwnit = function(err, convo) {
      convo.say({"attachment":{
        "type":"image",
        "payload":{
          "url": questions[i].device_img
        }
      }});
      convo.ask({
          "text": questions[i].device_title,
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
  question005question(bot, message, 0);
}


function question006start(bot, incoming) {
  bot.reply(incoming, {text: "Nice job on the gadgets.  We are now at the second to last question."});
  setTimeout(function() {
    bot.reply(incoming, {text: "This ones about software and programming language.  I'm going to mention a name.  All you need to do is tell me if you use it or not."});
    setTimeout(function() {
      bot.reply(incoming, {text: "Here we go..."});
      question006(bot, incoming)
    }, 4000)
  }, 1000)
}

function question006(bot, incoming) {
  var questions = shuffle([ "Photoshop",
                    "Garage band",
                    "Snap Chat",
                    "Excel",
                    "Twitter",
                    "Google Go",
                    "HTML",
                    "Java"
                  ])
  bot.startConversation(incoming, function(err, convo) {
    for (i = 0; i < questions.length; ++i) {
      if (i === (questions.length-1)) {
        convo.ask({
          text: questions[i],
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
          convo.stop()
          question006end(bot, incoming)
        });
      } else {
        convo.ask({
          text: questions[i],
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
      }
    }
  });
}

function question006end(bot, incoming) {
  bot.reply(incoming, {text: "Oustanding work!"});
  setTimeout(function() {
    bot.reply(incoming, {text: "You made it to end.  Here is your last question..."});
    setTimeout(function() {
      bot.reply(incoming, {text: "What did you think of this questionnaire?"});
      setTimeout(function() {
        question007(bot, incoming)
      }, 2000)
    }, 1000)
  }, 1000)
}

function question007(bot, incoming){
  bot.reply(incoming, {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements": [
          {
            "title":"Loved it",
            "image_url":"https://gentle-earth-80429.herokuapp.com/images/Question7/love.png",
            "buttons":[
              {
                "type":"postback",
                "title":"Loved it",
                "payload":"Q_07"
              }
            ]
          },
          {
            "title":"Liked it",
            "image_url":"https://gentle-earth-80429.herokuapp.com/images/Question7/like.png",
            "buttons":[
              {
                "type":"postback",
                "title":"Liked it",
                "payload":"Q_07"
              }
            ]
          },
          {
            "title":"It was OK",
            "image_url":"https://gentle-earth-80429.herokuapp.com/images/Question7/ok.png",
            "buttons":[
              {
                "type":"postback",
                "title":"It was OK",
                "payload":"Q_07"
              }
            ]
          },
          {
            "title":"Didn't like it",
            "image_url":"https://gentle-earth-80429.herokuapp.com/images/Question7/nolike.png",
            "buttons":[
              {
                "type":"postback",
                "title":"Didn't like it",
                "payload":"Q_07"
              }
            ]
          },
          {
            "title":"Hated it",
            "image_url":"https://gentle-earth-80429.herokuapp.com/images/Question7/hate.png",
            "buttons":[
              {
                "type":"postback",
                "title":"Hated it",
                "payload":"Q_07"
              }
            ]
          }
        ]
      }
    }
  })
}

}
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
