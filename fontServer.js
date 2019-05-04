const express = require('express');
const session = require('express-session'); 
const router = express.Router();
const app = express();
//const cheerio = require('cheerio');
const request = require('request');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const client = require('cheerio-httpcli'); 
const fs = require('fs');
const multer = require("multer");




app.set('view engine', 'ejs'); 
app.set('views', __dirname +'/views');

app.use(express.static('upload'));
app.use('/image', express.static('image'));
app.use('/upload', express.static('upload'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

let storage = multer.diskStorage({ 
	destination: function(req, file ,callback){ 
		callback(null, "upload/") 
		
	}, 
	filename: function(req, file, callback){ 
			callback(null, file.originalname) } 

});



let upload = multer({ dest: "upload/", storage:storage });



app.listen(3000,function(){
    console.log('server on')
});

app.use(session({

	secret: '98765411', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력

	resave: false,                //세션 아이디를 접속할때마다 새롭게 발급하지 않음

	saveUninitialized: true       //세션 아이디를 실제 사용하기전에는 발급하지 않음

}));

app.get('/',function(req,res){
	 
	//if문을 써서 분기를 나누자.. 세션이 있으면 유저정보와 함께 ejs로 렌더링하고 
	// 없으면 html로 렌더링
	if (req.session.user){ 
		console.log("session"); 
		res.render("../main", req.session.user);
	};
        res.sendFile(__dirname +'/main.html');
	 });
	 
app.get('/admin',function(req,res){
        res.sendFile(__dirname +'/adminPage.html')
     });


app.post('/fontUpload', upload.single("fontUpload"), function(req, res, next) { 
	let file = req.file 
	console.log(file);
	console.log("parameter check : " + req.body.cType);
	let originalName = file.originalname;
	console.log(file.originalname.split("\.")[1]);
	

	let result = { originalName : file.originalname, 
				   size : file.size, 
				 } 

	res.send(result); 

    
	});

	

	app.post('/session', function(req, res){

		var paramID = req.body.mail || req.query.mail;
		var pw = req.body.pw || req.query.pw;
		
		console.log(paramID);
		console.log(pw);

		if(req.session.user){
			//request에 세션 내용이 있을 경우
			console.log("session use", req.session.user["mail"]);
			
			//res.sendFile(__dirname +'/main.html')
			res.redirect("/");
		}else{
			//request에 세션 내용이 없을 경우
			req.session.user =
			{
					mail: paramID,
					pw: pw,
					authorized: true
			};
			res.render("../main",req.session.user);
		

		}
	
	//	res.send('count: '+req.session.count);
	
	});

	
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  port     : 3306,
  database : 'my_db'
});

connection.connect();

connection.query('SELECT * from Persons', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.', err);
});

connection.end();







module.exports = router;




