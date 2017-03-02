var request = require('request');

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

  function getProfile(id, cb) {
      if (!cb) cb = Function.prototype
      request({
        method: 'GET',
        uri: `https://graph.facebook.com/v2.6/${id}`,
        qs: {
          fields: 'first_name, last_name',
          access_token: process.env.page_token
        },
        json: true
      }, function(err, res, body) {
        if (err) return cb(err)
        if (body.error) return cb(body.error)

        cb(null, body)
      });
  };


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
    }else if (incoming.payload === "Q_04") {
      question004start(bot, incoming)
    } else if (incoming.payload === "Q_05") {
      question005(bot, incoming)
    } else if (incoming.payload === "LOVE" || incoming.payload === "LIKE" || incoming.payload === "OK" || incoming.payload === "NOLIKE" || incoming.payload === "HATE") {
      controller.storage.users.get(incoming.user, function (err, user) {
        if (err) {
          console.log(err)
        }
        else if (user.status !== "finished") {
          user.satisfaction = incoming.payload
          controller.storage.users.save(user)
          sayThanks(bot, incoming)
        }
        else {
          errorResponse(bot, incoming)
        }
      })
    }
  });

function errorResponse(bot, incoming){
  bot.reply(incoming, {text: "😨 oops! You've  already clicked that."});
}

function welcomeMessage(bot, incoming){
  var start_time = Date.now();
  var id = incoming.user
  getProfile(incoming.user, function(err, user) {
    var full_name = user.first_name +" "+user.last_name
    controller.storage.users.get(id, function (err, user) {
      if (err) {
        console.log(err)
      }
      else if (!user) {
        controller.storage.users.save({id: id, full_name: full_name, start_time: start_time, status: "started"})
      }
      else {
        user.start_time = start_time
        user.status = "started"
        user.full_name = full_name
        controller.storage.users.save(user)
      }
    })
    bot.reply(incoming, {text: "Hey "+user.first_name+", thanks for coming along..."});
    setTimeout(function() {
      bot.reply(incoming, {text: "To kick things off lets keep things light."});
      setTimeout(function() {
        bot.reply(incoming, {text: "Here is your first question..."});
        setTimeout(function() {
          bot.reply(incoming, {text: "Which of the following items in the list below would you consider a favorite thing to do in your spare time? (Scroll right to see all the available responses and select one)"});
          setTimeout(function() {
            question001(bot, incoming)
          }, 1000)
        }, 1000)
      }, 1000)
    }, 1000)
  });
}

function sayThanks(bot, incoming){
  var end_time = Date.now();
  controller.storage.users.get(incoming.user, function (err, user) {
    user.end_time = end_time
    total_time = end_time - user.start_time
    var min = (total_time/1000/60) << 0
    var sec = (total_time/1000) % 60
    user.total_time = min + ':' + Math.ceil(sec);
    user.status = "finished"
    controller.storage.users.save(user)
    var frid = user.fedResponseId;
    var pid = user.pId;
    bot.reply(incoming, {
      text: "The messager part of this survey is finished – thanks!"
    });
    setTimeout(function() {
      bot.reply(incoming, {"attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":'Click DONE and you will go back to ARF where we have a few final questions you need to answer earn your survey points.',
          "buttons":[
            {
              "type":"web_url",
              "url":"https://www.samplicio.us/router/ClientCallBack.aspx?fedResponseStatus=10&fedResponseID="+frid+"&PID="+pid,
              "title":"DONE",
              "messenger_extensions": true,
              "webview_height_ratio": "full"
            }
          ]
        }
      }});
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
  var questions = shuffle([
                    {text:"I love trying out new things", payloads:["1","2","3","4","5"]},
                    {text:"I like to do a lot of research before buying new things", payloads:["0","0","0","0","0"]},
                    {text:"New technology has gotten out of control", payloads:["0","0","0","0","0"]},
                    {text:"I won’t need a new phone for at least five years", payloads:["0","0","0","0","0"]},
                    {text:"I’ve often got two or more tech devices open in front of me", payloads:["1","2","3","4","5"]},
                    {text:"People always ask me for advice when they’re deciding what new tech to buy", payloads:["0","0","0","0","0"]},
                    {text:"I know more about technology than the people covering the help phonelines", payloads:["1","2","3","4","5"]},
                    {text:"My friends and family tell me I’m addicted to my tech devices", payloads:["1","2","3","4","5"]},
                    {text:"I don’t get all the excitement people have about new technology", payloads:["0","0","0","0","0"]},
                    {text:"I’ve got so many ideas for building new phone apps", payloads:["1","2","3","4","5"]}
                  ])
  bot.startConversation(incoming, function(err, convo) {
    var score = 0
    for (i = 0; i < questions.length; ++i) {
      if (i === (questions.length-1)) {
        convo.ask({
          text: questions[i].text,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": questions[i].payloads[4],
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": questions[i].payloads[3],
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": questions[i].payloads[2],
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": questions[i].payloads[1],
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": questions[i].payloads[0],
              }
          ]
        }, function(response, convo) {
          convo.stop()
          score = score + +response.payload
          controller.storage.users.get(incoming.user, function (err, user) {
            if (err) {
              console.log(err)
            }
            else {
              user.q3_final_score = score
              controller.storage.users.save(user)
            }
          })
          question003end(bot, incoming)
        });
      } else if (i === 0) {
        convo.say('Here is our first of ten phrases')
        convo.ask({
          text: questions[i].text,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": questions[i].payloads[4],
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": questions[i].payloads[3],
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": questions[i].payloads[2],
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": questions[i].payloads[1],
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": questions[i].payloads[0],
              }
          ]
        }, function(response, convo) {
            score = score + +response.payload
            convo.next();
        });
      } else if (i === 1) {
        convo.say('You got it.');
        convo.say('Next phrase...')
        convo.ask({
          text: questions[i].text,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": questions[i].payloads[4],
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": questions[i].payloads[3],
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": questions[i].payloads[2],
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": questions[i].payloads[1],
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": questions[i].payloads[0],
              }
          ]
        }, function(response, convo) {
            score = score + +response.payload
            convo.next();
        });
      }  else if (i === 4) {
        convo.say('Keep going you are killing it!');
        convo.ask({
          text: questions[i].text,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": questions[i].payloads[4],
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": questions[i].payloads[3],
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": questions[i].payloads[2],
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": questions[i].payloads[1],
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": questions[i].payloads[0],
              }
          ]
        }, function(response, convo) {
            score = score + +response.payload
            convo.next();
        });
      } else {
        convo.ask({
          text: questions[i].text,
          quick_replies: [
              {
                  "content_type": "text",
                  "title": "Definitely me!",
                  "payload": questions[i].payloads[4],
              },
              {
                  "content_type": "text",
                  "title": "Sort of me",
                  "payload": questions[i].payloads[3],
              },
              {
                  "content_type": "text",
                  "title": "Not sure",
                  "payload": questions[i].payloads[2],
              },
              {
                  "content_type": "text",
                  "title": "Not really me",
                  "payload": questions[i].payloads[1],
              },
              {
                  "content_type": "text",
                  "title": "Not me at all!",
                  "payload": questions[i].payloads[0],
              }
          ]
        }, function(response, convo) {
            score = score + +response.payload
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
    var score = 0
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
                  "payload": "0"
                },
                {
                  "type":"postback",
                  "title": questions[i].option2,
                  "payload": "1"
                }
              ]
            }
          }
        }, function(response, convo) {
          score = score + +response.text
          convo.stop()
          controller.storage.users.get(incoming.user, function (err, user) {
            if (err) {
              console.log(err)
            }
            else {
              user.q4_final_score = score
              controller.storage.users.save(user)
            }
          })
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
                  "payload": "0"
                },
                {
                  "type":"postback",
                  "title": questions[i].option2,
                  "payload": "1"
                }
              ]
            }
          }
        }, function(response, convo) {
            score = score + +response.text
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
      setTimeout(function() {
        question006(bot, incoming)
      }, 1000)
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
  var segments = [
    "A Tech Innovator - You pride yourself in having all the latest gadgets, heck you could probably help design them (maybe you do!)",
    "A Tech Lover - I beat you feel a little panicked when your phone gets below 10% battery – or maybe you never let it get that low",
    "A Tech Dabbler - Technology is great but also have an appreciation for a book, an in-person interaction or a pen and paper",
    "Tech Resigned - Mom? Is that you? Kidding! Obviously, you use technology because here you are talking with me but you’re happy to wait and let others test out new things."
  ]
  var user_segment;
  controller.storage.users.get(incoming.user, function (err, user) {
    if (err) {
      console.log(err)
    }
    else {
      if (user.q3_final_score >= 20 && user.q4_final_score >= 6) {
        user_segment = segments[0]
      }
      else if (user.q3_final_score <= 19 && user.q4_final_score >= 6){
        user_segment = segments[1]
      }
      else if (user.q3_final_score >= 16 && user.q4_final_score <= 5){
        user_segment = segments[2]
      }
      else if (user.q3_final_score <= 15 && user.q4_final_score <= 5){
        user_segment = segments[3]
      }
    }
  })
  bot.reply(incoming, {text: "Oustanding work! Based on the answers you’ve given us we think you are:"});
  setTimeout(function() {
    bot.reply(incoming, {text: user_segment});
    setTimeout(function() {
      bot.reply(incoming, {text: "You made it to the end.  Here is your last question..."});
      setTimeout(function() {
        bot.reply(incoming, {text: "What did you think of this questionnaire?"});
        setTimeout(function() {
          question007(bot, incoming)
        }, 1000)
      }, 2000)
    }, 3000)
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
                "payload":"LOVE"
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
                "payload":"LIKE"
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
                "payload":"OK"
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
                "payload":"NOLIKE"
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
                "payload":"HATE"
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
