var facebook_handler = require('../controllers/botkit').handler
var broadcaster = require('../controllers/botkit').broadcast
var attitudinal = require('../controllers/botkit').attitudinal
var compromise = require('../controllers/botkit').compromise
var sayThanks = require('../controllers/botkit').sayThanks

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

  app.get('/list',
    function(req, res){
      var randomorder = shuffle(list)
      res.render('list', {list: randomorder});
  });
  app.get('/list/:id',
    function(req, res){
      var randomorder = shuffle(list)
      res.render('list', {list: randomorder, id: req.params.id});
  });
  app.get('/people/:id',
    function(req, res){
      res.render('people', {id: req.params.id});
  });

  app.get('/rank/:id',
    function(req, res){
      var randomorder = shuffle(userslist)
      res.render('rank', {list: randomorder,
        Hrank: "Most Natural",
        Lrank: "Most Artificial",
        description: "There’s a wide variety in terms of what each sugar/sweetener type is made of, how it’s made, etc. We want to know how you would classify each of these by ranking them where #1 is the most natural down to the most artificial.",
        action: "/rank1",
        submit: "submit",
        id: req.params.id
      });
  });

  app.post('/rank1',function(req,res){
    var randomorder = shuffle(userslist)
    res.render('rank', {list: randomorder,
      Hrank: "Tastes Good",
      Lrank: "Tastes Bad",
      description: "Aside from what they’re made of, taste is a big part of why we choose the sugars and sweeteners that we like!  How would you classify each of these in terms of taste?  Please rank them where #1 tastes good down to tastes bad.",
      action: "/rank2",
      submit: "submit",
      id: req.body.fb_id
    });
  })
  app.post('/rank2',function(req,res){
    var randomorder = shuffle(userslist)
    res.render('rank', {list: randomorder,
      Hrank: "Good For you",
      Lrank: "Bad For you",
      description: "Any conversation about sugars and sweeteners includes health considerations.  How would you classify each of these in terms of being healthy?   Please rank where #1 is the most good for you down to those which are not good for you.",
      action: "/rank3",
      submit: "submit",
      id: req.body.fb_id
    });
  })
  app.post('/rank3',function(req,res){
    var randomorder = shuffle(userslist)
    res.render('rank', {list: randomorder,
      Hrank: "Most Common",
      Lrank: "Most Obscure",
      description: "We know you’re aware of these types, but thinking of the market in general, how well known do you think each one is?  Please rank them where #1 is the most common down to the most obscure.",
      action: "/rank4",
      submit: "submit",
      id: req.body.fb_id
    });
  })
  app.post('/rank3',function(req,res){
    var randomorder = shuffle(userslist)
    res.render('rank', {list: randomorder,
      Hrank: "Most Common",
      Lrank: "Most Obscure",
      description: "We know you’re aware of these types, but thinking of the market in general, how well known do you think each one is?  Please rank them where #1 is the most common down to the most obscure.",
      action: "/rank4",
      submit: "submit",
      id: req.body.fb_id
    });
  })
  app.post('/rank4',function(req,res){
    var randomorder = shuffle(userslist)
    res.render('rank', {list: randomorder,
      Hrank: "Most Likely Consider",
      Lrank: "Least Likely Consider",
      description: "Thinking of how likely you would be to consider buying a product containing each of these, please rank them where #1 is the one you would most likely consider down to the one you would least likely consider.",
      action: "/rank5",
      submit: "submit-final",
      id: req.body.fb_id
    });
  })
  app.post('/rank5',function(req,res){
    var facebook_id = req.body.fb_id
    attitudinal(facebook_id)
  })
  app.get('/products/:id',
    function(req, res){
      res.render('products', {id: req.params.id});
  });
  app.get('/personality',
    function(req, res){
      res.render('personality_sugar');
  });
  app.get('/personality2',
    function(req, res){
      res.render('personality_sweetners');
  });

  var userslist
  var list = ["Sugar", "Cane Sugar", "Sucrose", "Fructose", "Lactose", "Corn Syrup", "Maltodextrin", "Dextrose", "Glucose", "Evaporated Cane Juice", "Molasses", "High Fructose Corn Syrup", "Coconut Sugar", "Palm Sugar", "Rice Malt Syrup", "Malt", "Fruit Juice Concentrate", "Honey", "Maple Syrup", "Agave","Date Syrup", "Stevia", "Monk Fruit Juice", "Luo Han Guo", "Thaumatin", "Unrefined Sugar", "Mannitol", "Xylitol", "Sorbitol", "Tagatose", "Isomaltulose", "Polydextrose", "Aspartame (i.e. Equal)", "Sucralose (i.e. Splenda)", "Acesulphame Potassium", "Saccharin (i.e. Sweet ‘N Low)"]
  app.post('/list',function(req,res){
    var facebook_id = req.body.fb_id
    // var cnslbody = JSON.stringify(req.body, null, 4);
    var keys = Object.keys(req.body)
    keys.splice(0, 1);
    var scoped_list = keys
    userslist = scoped_list
  	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ID: " + req.body.fb_id)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>FORM: " + scoped_list)
    broadcaster(facebook_id, scoped_list)
  })

  app.post('/products',function(req,res){
    var facebook_id = req.body.fb_id
    var cnslbody = JSON.stringify(req.body, null, 4);
    console.log(cnslbody)
    var list_of_products =  req.body
    compromise(facebook_id, list_of_products)
  })
  app.post('/sugarperson',function(req,res){
    var facebook_id = req.body.fb_id
    // var cnslbody = JSON.stringify(req.body, null, 4);
    // console.log(cnslbody)
    var sugarperson =  req.body.person
    res.render('people2', {sugarperson: sugarperson, id: facebook_id});
  })
  app.post('/sweetenerperson',function(req,res){
    var facebook_id = req.body.fb_id
    // var cnslbody = JSON.stringify(req.body, null, 4);
    // console.log(cnslbody)
    var sugarperson =  req.body.sugarperson
    var sweetenerperson =  req.body.sweetenerperson
    res.render('personality_sugar', {id: facebook_id, sugarperson: sugarperson, sweetenerperson: sweetenerperson, list: ["Alive", "Sporty", "Energetic", "Goal-orientated", "Assertive", "Ambitious", "Stylish", "Determined", "Serious", "Self-centered", "Quiet", "Reserved", "Modest", "Ordinary", "Tranquil", "Kind", "Friendly", "Cheerful", "Bright", "Joyful"]});
  })
  app.post('/personality1',function(req,res){
    var facebook_id = req.body.fb_id
    // var cnslbody = JSON.stringify(req.body, null, 4);
    // console.log(cnslbody)
    var sugarperson =  req.body.sugarperson
    var sweetenerperson =  req.body.sweetenerperson
    res.render('personality_sweetners', {id: facebook_id, sugarperson: sugarperson, sweetenerperson: sweetenerperson, list: ["Alive", "Sporty", "Energetic", "Goal-orientated", "Assertive", "Ambitious", "Stylish", "Determined", "Serious", "Self-centered", "Quiet", "Reserved", "Modest", "Ordinary", "Tranquil", "Kind", "Friendly", "Cheerful", "Bright", "Joyful"]});
  })
  app.post('/personality2',function(req,res){
    var facebook_id = req.body.fb_id
    sayThanks(facebook_id)
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
