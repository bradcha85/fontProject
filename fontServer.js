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
	 
	//if문 써서 분기를 나누기
	if(req.session.user){ 
		 console.log("session exist"); 
		 res.render("../main", req.session.user);
		 }else{ 
			//res.sendFile(__dirname +'/main.html');
			res.render("../main",{
				mail: '',
				pw: '',
				authorized: true
			});
		 				
		}
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


	app.post('/login', function(req, res){
		
    console.log("login... req : " , req)
		var mail = req.body.mail || req.query.mail;
		var pw = req.body.pw || req.query.pw;
		
		console.log("parameterCheck" , mail , pw);

		if(req.session.user){
			//request에 세션 내용이 있을 경우
			console.log("session use", req.session.user["mail"]);
			//res.sendFile(__dirname +'/main.html')
			res.redirect("/");
		}else{
			//request에 세션 내용이 없을 경우
			let mysql      = require('mysql');
			let connection = mysql.createConnection({
				host     : 'localhost',
				user     : 'root',
				password : 'root',
				port     : 3306,
				database : 'my_db'
			});
			connection.connect();
			
		//	let sql = 'SELECT password FROM USERS WHERE mail = "'+mail+'"';
			let sql = 'SELECT password FROM USERS WHERE mail = ?';
			let params = mail;
			connection.query(sql, params, function(err, rows, fields) {
				if (!err){
					console.log("rows length : " , rows.length);
					if(rows.length>=1){
						
						console.log('password : ', rows[0].password);

						if (rows[0].password == pw){
					
							req.session.user ={
																	mail: mail,
																	pw: pw,
																	authorized: true
																};
							
							console.log("correct password");
							res.send({"statusCode" : "success"});
						
						}else{
							console.log("wrong password");
							res.send({"statusCode" : "wrongPassword"});
						}
				 }else{
					res.send({"statusCode" : "invalidMail"});
				 }
				}
				else{
					console.log('Error while performing Query.', err);
				}
			});

			connection.end();
		}
	});
	
	 app.get('/logout',function(req,res){
			req.session.destroy();
			res.redirect('/');
	 });

	 app.post('/my', function(req, res){
			console.log("myInfo : " ,req.session.user);
			res.send(req.session.user);
	 });

	 app.post('/signUp', function(req, res){

			console.log("signUp..")

			var mail = req.body.mail || req.query.mail;
			var pw = req.body.pw || req.query.pw;

			let mysql      = require('mysql');
			let connection = mysql.createConnection({
				host     : 'localhost',
				user     : 'root',
				password : 'root',
				port     : 3306,
				database : 'my_db'
			});
			connection.connect();
		
			//let sql = 'INSERT INTO USERS (mail, password) VALUES("'+mail+'","'+pw+'")';
			let sql = 'INSERT INTO USERS (mail, password) VALUES(?,?)';
			let params = [mail,pw];
			connection.query(sql,params,function(err, rows, fields) {
				if (!err){
					console.log(rows);

					}else{
					console.log("error")
					}
				});

			connection.end();
	});

	app.post('/mailCheck', function(req, res){

		console.log("mailCheck..")
	
		var mail = req.body.mail || req.query.mail;

		console.log(mail)

		let mysql      = require('mysql');
		let connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : 'root',
			port     : 3306,
			database : 'my_db'
		});
		connection.connect();
	
		//let sql = 'INSERT INTO USERS (mail, password) VALUES("'+mail+'","'+pw+'")';
		let sql = 'SELECT mail FROM USERS WHERE mail = ?';
		let params = mail;
		connection.query(sql, params, function(err, rows, fields) {
			if (!err){
				console.log(rows);
				console.log("row length", rows.length);
				if(rows.length<1){
					res.send({"isPossible" : "true"});
				}else{
					res.send({"isPossible" : "false"});	
				}
			}else{	
				console.log("error")
				}
			});

		connection.end();
});


	

		
		

	



module.exports = router;




