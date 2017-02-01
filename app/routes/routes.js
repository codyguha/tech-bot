var facebook_handler = require('../controllers/botkit').handler
var statementVerify = require('../controllers/botkit').statementVerify
var getWords = require('../controllers/botkit').getWords

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
