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

app.use(express.static('fontUpload'));
app.use('/image', express.static('image'));
app.use('/fontUpload', express.static('fontUpload'));
app.use('/fontRender', express.static('fontRender'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
let rName;

let storage = multer.diskStorage({ 
	destination: function(req, file ,callback){ 
		console.log("destination.." , file.fieldname);
		if(file.fieldname == "fontUpload") callback(null, "fontUpload/");
		else if(file.fieldname == "fontRender") callback(null, "fontRender/");
	}, 
	filename: function(req, file, callback){ 
		
			if(file.fieldname == "fontUpload"){
				callback(null, file.originalname);
				rName = "random_"+generateFontName()+'.'+file.originalname.split("\.")[1];
				callback(null, rName);
				console.log("랜덤파일이름(in multer) : " , rName);
			} 
			else if(file.fieldname == "fontRender") callback(null, file.originalname);
		} 

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

		let mysql      = require('mysql');
		let connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : 'root',
			port     : 3306,
			database : 'my_db'
		});
		connection.connect();
 
		let sql = 'SELECT * FROM FONTS';
		let resultArray = new Array();
		connection.query(sql,function(err, rows, fields) {
			if (!err){
				console.log("폰트 ROW :" , rows[0]);
				for(var i = 0; i<rows.length; i++){
					let fontSpec = { "fontName" : rows[i].FONT_NAME ,
												   "fontPrice" : rows[i].FONT_PRICE
													}
					resultArray.push(fontSpec);
					
				}
				}else{
				console.log("error")
				console.log(err);
				}
				console.log("배열안 객체확인 ", JSON.stringify(resultArray[1]));
				res.render('../adminPage' , {content : resultArray});
			});
		connection.end();
	

	
 });

let uploadField = upload.fields([{ name: 'fontRender', maxCount: 8 }, { name: 'fontUpload', maxCount: 8 }])
//app.post('/fontUpload', upload.single("fontUpload"), function(req, res, next) { 
app.post('/fontUpload', uploadField, function(req, res, next) { 

	let uploadType = req.body.uploadType;
	console.log("uploadType" , uploadType);

	if(uploadType == "fontRender"){
		console.log("타입 : fontRender")
		let file = req.files['fontRender'][0];
		let result = { originalName : file.originalname, 
										size : file.size, 
								 } 
		res.send(result); 
	 }else if(uploadType == "fontUpload"){
		console.log("req정보" , req)
		let file = req.files['fontUpload'][0];
		let fontName = req.body.fontName;
		let fontPrice = req.body.fontPrice;
		let originalFilename = file.originalname;
		let randomFilename = rName;
		
		console.log("파일정보" , fontName,fontPrice, originalFilename, randomFilename);

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
		let sql = 'INSERT INTO FONTS(font_name, font_price, font_filename, font_rfilename) VALUES(?,?,?,?)';
		let params = [fontName,fontPrice,originalFilename,randomFilename];
		connection.query(sql,params,function(err, rows, fields) {
			if (!err){
				console.log(rows);
				}else{
				console.log("error")
				console.log(err);
				}
			});
		connection.end();

		let result = { originalName : file.originalname, 
			size : file.size, 
	 	} 
		res.send(result);
	 }


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
				host     : '127.0.0.1',
				user     : 'root',
				password : 'root1212',
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


	

		
function generateFontName(){
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			
			for( var i=0; i < 8; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
			
			return text;
		}		

	



module.exports = router;




