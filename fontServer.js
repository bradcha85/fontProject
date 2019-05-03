const express = require('express');
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

app.get('/',function(req,res){
        res.sendFile(__dirname +'/p2.html')
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







module.exports = router;




