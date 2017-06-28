var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var config = require('./config');
var user = require('./models/user');
var apiRoutes = express.Router(); 


var portNo = process.env.PORT || 8000;

mongoose.connect('mongodb://localhost:27017/instaDB');

app.set('superSecret',config.secret);
var jsonParser = bodyParser.json();
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(morgan('dev'));


app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + portNo + '/api');
});

app.listen(portNo);
console.log('Magic happens at http://localhost:' + portNo);

app.post('/setup',urlencodedParser,function(req,res){
	//console.log(req.body);
	//creating user and saving it to DB
		bcrypt.genSalt(10, function(err, salt) {
    		bcrypt.hash(req.body.password, salt, function(err, hash) {
        		// Store hash in your password DB. 

        				var sahitya = new user({
								name : req.body.name,
								password : hash,
								admin : req.body.admin
							});
							
							console.log(sahitya);

        					sahitya.save(function(err){

									if(err) throw err;
									console.log('User data saved successfully');
									res.json({success: true,message:'User created successfully and saved to Database'});
								});	

    			});
		});

	

});

app.get('/server_check',function(req,res){

	res.json({

			message : 'Welcome to Insta Server'
	});

});

app.get('/users',function(req, res){
	console.log(res);
	var data;

	user.find({},function(err, users){
		res.json(users);
		});
});

app.post('/authenticate',urlencodedParser,function(req, res){


	console.log(req.body);
	//res.json(req.body);
	user.findOne({ name : req.body.name } , function(err, user){
		if(err) throw err;
		console.log(user);

		if(!user){

		res.json({success : false, message : 'Authentication is failed, User not foud'});		

		}else{
				bcrypt.compare(req.body.password, user.password, function(err, respo) {
    						// res === false 
    						if(respo == true){
										var token = jwt.sign(user, app.get('superSecret'), {
          										expiresIn : 60*60*24
        									});
										res.json({
          									success: true,
          									message: 'Enjoy your token!',
          									token: token
        								});

    						}else{

    									res.json({success : false , message : 'Authentication failed, Wrong password'});
								}
				});
		} 
	});
});

// app.post('/putStatus', urlencodedParser, function(req, res){

// 	console.log(req.body);
// }


app.use(function(req, res, next){

			  var token = req.body.token || req.query.token || req.headers['x-access-token'];



			  	console.log(token);

			  	  // decode token
  				if (token) {
    					// verifies secret and checks exp
    					jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      			if (err) {
        				return res.json({ success: false, message: 'Failed to authenticate token.' });    
      				} else {
        				// if everything is good, save to request for use in other routes
        				req.decoded = decoded;    
        				next();
      				}
    			});

  				} else {

    				// if there is no token
    				// return an error
    				return res.status(403).send({ 
        			success: false, 
        			message: 'No token provided.' 
    		});

  }

});

