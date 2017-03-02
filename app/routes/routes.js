var facebook_handler = require('../controllers/botkit').handler
var end = require('../controllers/botkit').endQuestion002


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

  app.post('/webhook', function (req, res) {
    facebook_handler(req.body)
    res.send('ok')
  })

  app.get('/email/:id',
    function(req, res){
      res.render('email', {id: req.params.id});
  });

  app.get('/unlimited-funding/:id',
    function(req, res){
      activitylist =  ["Build computer games","Tinker with my tools in the garage","Hike a different national park every week","Go on a never-ending winery tour","Start my own business","Go into politics","Volunteer for charities","Stay in bed and read all day","Watch TV and eat junk food"]
      var randomorder = shuffle(activitylist)
      res.render('unlimited-funding', {id: req.params.id, list: randomorder});
  });
  app.post('/unlimited-funding',function(req,res){
    var facebook_id = req.body.fb_id
    end(facebook_id)
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
