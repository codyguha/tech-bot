var facebook_handler = require('../controllers/botkit').handler
var statementVerify = require('../controllers/botkit').statementVerify
var getWords = require('../controllers/botkit').getWords
var end = require('../controllers/botkit').end
var convo = require('../controllers/conversations')

module.exports = function (app) {

  app.get('/webhook', function (req, res) {
    // This enables subscription to the webhooks
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.verify_token) {
      res.send(req.query['hub.challenge'])
    }
    else {
      res.send('Incorrect verify token')
    }
  })

  app.get('/testhook', function (req, res) {
    // This enables subscription to the webhooks
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.verify_token) {
      res.send(req.query['hub.challenge'])
    }
    else {
      res.send('Incorrect verify token')
    }
  })

  app.post('/webhook', function (req, res) {
    facebook_handler(req.body)
    res.send('ok')
  })

  app.get('/list',
    function(req, res){
      var randomorder = shuffle(list)
      res.render('list', {list: randomorder});
  });
  app.get('/statements/:id',
    function(req, res){
      res.render('statements', {id: req.params.id});
  });
  app.get('/words/:id',
    function(req, res){
      wordlist = ["Daydreamer","Full of wild ideas","Deep thinker","Good communicator","Adaptable","Imaginative","Adventurous","Impulsive",
"Agreeable","Inquisitive","Assertive","Logical","Complex","Non-conforming","Confident","Observant","Creative","Organized","Curious","Risk taker","Decisive","Self-disciplined","Flexible", "Sensitive"]
      var randomorder = shuffle(wordlist)
      res.render('words', {id: req.params.id, list: randomorder});
  });
  app.get('/activities/:id',
    function(req, res){
      activitylist =  ["withdraw or deposit money","check my account balance","transfer money between accounts","make a payment to someone I’ve paid before","make a payment to someone new","pay a bill","schedule a payment or set up direct debit","set up or active an account or service","enquire or look for info about an existing account / loan /card or service", "search or enquire about specific transactions or payments","obtain or request copy of statements","change or modify an existing product","use calculator or tools","activate a card","resolve a problem", "enquire or look for information about a new account / loan /card or service","apply for or open a new account / loan /card or service","closed an account / loan /card","made a complaint","changed personal details","reported a card lost or stolen","investigate fraud on an account","don’t recall" ,"I haven’t had any interactions with ACME in the last week"]
      var randomorder = shuffle(activitylist)
      res.render('activities', {id: req.params.id, list: randomorder});
  });

  app.get('/unlimited-funding/:id',
    function(req, res){
      activitylist =  ["Build computer games","Tinker with my tools in the garage","Hike a different national park every week","Go on a never-ending winery tour","Start my own business","Go into politics","Volunteer for charities","Stay in bed and read all day","Watch TV and eat junk food"]
      var randomorder = shuffle(activitylist)
      res.render('unlimited-funding', {id: req.params.id, list: randomorder});
  });
  app.post('/unlimited-funding',function(req,res){
    var facebook_id = req.body.fb_id
    convo.endQuestion002(facebook_id)
    res.send('OK.')
  })

  app.post('/activities',function(req,res){
    var facebook_id = req.body.fb_id
    end(facebook_id)
  })
  app.post('/statement',function(req,res){
    var facebook_id = req.body.fb_id
    var statement = req.body.statement
    statementVerify(facebook_id, statement)
  })

  app.post('/words',function(req,res){
    var facebook_id = req.body.fb_id
    // var cnslbody = JSON.stringify(req.body, null, 4);
    var words = Object.keys(req.body)
    words.shift();
    getWords(facebook_id, words)
  })

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
