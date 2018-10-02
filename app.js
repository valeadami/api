var express = require("express");
var bodyParser = require("body-parser");
const querystring = require('querystring');
const https = require('http');
var session = require('express-session');
var parseurl = require('parseurl');
var app = express();
let sess='';
/*let avaSession='';
let cont=0;
let strSessions=new Array();*/
/*** STUDIO SESSIONI */
//inizializzo la sessione
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false, maxAge: 30000,name:'JSESSIONID'}
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }
 
  // get the url pathname
  var pathname = parseurl(req).pathname;
 
  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
  req.session.pippo='pippo';
  req.session.mysession='';
  
  next();
})
 
app.get('/foo', function (req, res, next) {
  
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})
 
app.get('/bar', function (req, res, next) {
  //if (req.session.pippo)
 console.log('Cookies: ' + req.session.cookie.name);
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times e ti chiami '+req.session.id);
})
/*
app.post('/bar', function (req, res, next) {
  req.session.mysession=req.session.id;
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times e la tua sessione = '+req.session.mysession); 
})*/


//routing e api 
// route handler for GET requests 
///random/10/100, ma anche /random/foo/bar, quindi verifica che siano numeri...

//app.get("/random/:min/:max", function(req, res) {
/*  PER FARE POST SU AVA*/

postData = querystring.stringify({
  'searchText': 'ciao',
  'user':'',
  'pwd':'',
  'ava':'FarmaInfoBot'
  
});
 const options = {
  hostname: '86.107.98.69',
  port: 8080, 
  path: '/AVA/rest/searchService/search_2?searchText=', 
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json', 
   // 'Content-Length': Buffer.byteLength(postData),
    'Cookie':'JSESSIONID=' // +avaSession 
  }
};

/**LAVORO QUI PER STUDIO SESSIONI  */
app.get("/", function (req, res){
  res.status(200).end("Sono nella root...tolto +avaSession in headers");

});

 app.get("/random/:min/:max", function(req, res) {
   var min = parseInt(req.params.min);
    var max = parseInt(req.params.max);
    /*var min=parseInt(req.query.min);
    var max=parseInt(req.query.max);*/
  if (isNaN(min) || isNaN(max)) {
    res.status(400);
    res.json({ error: "Bad request." });
    return;
  }
  var result = Math.round((Math.random() * (max - min)) + min);
    res.json({ result: result });
  });  
   //random/1/10
  //app.post("/random/:min/:max", function(req, res) {
    app.post("/random/", function(req, res) {
      //devo adattare il codice per dialogflow
      console.log(JSON.stringify(req.body));
     /*var min = parseInt(req.params.min);
      var max = parseInt(req.params.max);*/
      //prova mia:
      //querystring funziona, a condizione che da postman vada messo &min=1&max=12
/* UN ATTIMO LO COMMENTO 
      var min=parseInt(req.query.min);
      var max=parseInt(req.query.max);
*/
      //da form da postman non funziona
    //  var min=parseInt(req.body.min); req.body.result.parameters.
      // var max=parseInt(req.body.max);
      /*  adattare il codice per DG!!!!!*/
      var min=parseInt(req.body.queryResult.parameters.min);
      var max=parseInt(req.body.queryResult.parameters.max);
    if (isNaN(min) || isNaN(max)) {
      res.status(400);
      res.json({ error: "Bad request." });
      return;
    }

    var result = Math.round((Math.random() * (max - min)) + min);
    //preparo la risposta per DG
    res.setHeader('Content-Type', 'application/json');
     // res.json({ result: result });
     res.json({
            fulfillmentText: "il numero e' " + result,
            payload: null
     })
    });  
//funzione callAVA
app.post("/callAVA", function (req,res){
  
  sess=req.session.id;
  console.log("valore id della sessione " + sess);
  res.json({ 'fulfillmentText': sess }); 
  /*let strRicerca='';
  let out='';
  var str= req.body.searchText; //req.body.queryResult.parameters.searchText; //req.body.searchText;
  if (str) {
    strRicerca=querystring.escape(str);
    options.path+=strRicerca+'&user=&pwd=&ava=FarmaInfoBot';
  
callAVA( strRicerca).then((strOutput)=> {
       
  return res.json({ 'fulfillmentText': strOutput }); 
 
}).catch((error) => {
 
 return res.json({ 'fulfillmentText': 'errore: ' + error.message});

});
 }*/
});
/* *************inizio CALL AVA * */


function callAVA(stringaRicerca) {
  return new Promise((resolve, reject) => {
    let data = '';
    let strOutput='';
    
    const req = https.request(options, (res) => {
    console.log("DENTRO CALL AVA " + sess);   
    console.log('________valore di options.cookie INIZIO ' + options.headers.Cookie);
    console.log(`STATUS DELLA RISPOSTA: ${res.statusCode}`);
    console.log(`HEADERS DELLA RISPOSTA: ${JSON.stringify(res.headers)}`);
    console.log('..............RES HEADER ' + res.headers["set-cookie"] );
    /*if (res.headers["set-cookie"]){

      var x = res.headers["set-cookie"].toString();
      var arr=x.split(';')
      //arr[0] contiene il valore della sessione
      options.headers.Cookie=arr[0];
       strSessions.push(options.headers.Cookie);
      cont++;
      console.log('------------->VALORE DEL COOKIE<------' +options.headers.Cookie);
    } else {
      var y=strSessions.pop();
      options.headers.Cookie=y;
    }
    */
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
     console.log(`BODY: ${chunk}`);
     data += chunk;
    //sposto qua
     let c=JSON.parse(data);
            strOutput=c.output[0].output; 
            //pulisco tag HTML       
            strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
           
            
           /* gestione sessioni NUOVA */
           //CONTROLLO SE AVASESSION E' VUOTA, SE NO CONCATENA SEMPRE le sessioni
          /* if (avaSession ==='' ){
                  console.log('se avaSession è vuota ...');
                //avaSession=strSessions[cont];
                avaSession=c.sessionID;
                
                //cont++;
                //options.headers.Cookie+=avaSession;
                  options.headers.Cookie+=avaSession;
                  console.log('VALORE DEL COOKIE ' + options.headers.Cookie);
                console.log('------------->VALORE DEL COOKIE<------' +options.headers.Cookie);
                  }else {
                
                  console.log('NN HO INSERITO IL COOKIE'); 
                
            }
      */
    
            resolve(strOutput); 
           
          
    });
    res.on('end', () => {
      console.log('No more data in response.');
      
           
            options.path='/AVA/rest/searchService/search_2?searchText=';
            
            console.log('valore di options.path FINE ' +  options.path);

    });
  });
  
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    strOutput="si è verificato errore " + e.message;
   // return strOutput;
  });
  
  // write data to request body
  
  req.write(postData);
  req.end();
  
});
} 
/*****FINE CALL AVA */


app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port 3000");
  });

  function getSessionIfExists()
  {


  }
/*
//DA USARE CON CURL DA LINEA DI COMANDO AD ESEMPIO CURL -X POST http://localhost:3000 
app.get("/", function(req, res) {
  res.send("you just sent a GET request, friend");
});
app.post("/", function(req, res) {
  res.send("a POST request? nice");
});
app.put("/", function(req, res) {
  res.send("i don’t see a lot of PUT requests anymore");
});
app.delete("/", function(req, res) {
  res.send("oh my, a DELETE??");
});
app.listen(3000, function() {
  console.log("App is listening on port 3000");
});*/