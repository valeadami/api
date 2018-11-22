//12/11/2018: aggiornato con gestione HTTPS
//https://panloquacity2dialogflow.herokuapp.com/callAVA?ava=FarmaInfoBot
var express = require("express");
var bodyParser = require("body-parser");
const querystring = require('querystring');
var path = require("path");
const https = require('https'); // da http: a https: modifica del 12/11/2018...
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var parseurl = require('parseurl');
var fs = require("fs");
var {WebhookClient} = require('dialogflow-fulfillment');


var app = express();
let sess='';
var bot='';
/*const WELCOME_INTENT = 'input.welcome';
const AVA_INTENT = 'SendToPanloquacity'; //MandaFuori*/

//inizializzo la sessione
app.use(session({
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false, maxAge: 180000,name:'JSESSIONID'}
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));


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
  sess=req.session.id;
  req.session.myid=sess;
  
  
  next();
})
/*funzioni per gestire DG agente */
/*function CloseConversation (agent) {
  agent.add(`qui chiudo la conversazione `);
  console.log('qui chiudo la conversazione');
  
}*/
function welcome (agent) {
  agent.add(`Welcome to Express.JS webhook! `);
  console.log('sono nel welcome');
}

function fallback (agent) {
  agent.add(`I didn't understand from server`);
  agent.add(`I'm sorry, can you try again?`);
}
/*http://86.107.98.69:8080/AVA/avatar.jsp?ava=AlpiGiulieDemo 
http://86.107.98.69:8080/AVA/avatar.jsp?ava=FarmaInfoBot
http://86.107.98.69:8080/AVA/avatar.jsp?ava=Olivia
*/
function WebhookProcessing(req, res) {
  const agent = new WebhookClient({request: req, response: res});
  //recupero la sessionId della conversazione
  agent.sessionId=req.body.session.split('/').pop();
//assegno all'agente il parametro di ricerca da invare sotto forma di searchText a Panloquacity
  agent.parameters['searchText']=req.body.queryResult.parameters.searchText;
  console.info(`agent set ` + agent.sessionId +` parameters ` + agent.parameters.searchText);

  //recupero quale agente viene interrogato
   bot=req.query.ava;
  console.log('Il bot  interrogato : '+bot);

  
  let intentMap = new Map();
  //modifica del 29/10/2018 commentato i due intent su richiesta R.
  //intentMap.set('Default Welcome Intent', welcome);
  //intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Welcome', callAVA); //la funzione callAva sostiutisce la funzione welcome 
  intentMap.set('AnyText', callAVA); // AnyText sostituisce 'qualunquetesto'
  intentMap.set('Stop', callAVA); //modifica del 22/11/2018 per gestire la fine della conversazione
  //intentMap.set('CloseConversation', callAVA);
  
  agent.handleRequest(intentMap);
}


app.get('/', function(req, res, next) {
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html')
    res.write("sono nella root ");
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p> id sessione ' + req.session.id  +' expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})
app.get('/foo', function (req, res, next) {
  
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})
 
app.get('/bar', function (req, res, next) {
  //if (req.session.pippo)
 console.log('Cookies: ' + req.session.cookie.name);
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times e ti chiami '+req.session.id);
})
app.get('/writefs', function (req, res, next) {
     sess=req.session.id;
     /*fs.appendFile('sessions/'+ sess,'0HV+3S+MjoJyXvaYA0PUFySz.undefined', function (err) {
      if (err) throw err;
      console.log('Saved!');
      res.send("salvato file di nome " + sess);
    });*/

    scriviSessione('sessions/',sess, '0HV+3S+MjoJyXvaYA0PUFySz.undefined');
    res.send("salvato file di nome " + sess);
    //if (risultato) console.log('ok');
})
app.get('/readfs', function (req, res, next) {
  if (sess){

 
    var c=leggiSessione('sessions/', sess);

    res.send("letto "+c);
  }else{
    console.log('manca la sessione');

}

 });

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
   //modifica del 12/11/2018 : cambiato porta per supportare HTTPS
   
  hostname: '86.107.98.69', 
  /*port: 8080,*/
  port: 8443,
  rejectUnauthorized: false, // aggiunto qui 12/11/2018 
  path: '/AVA/rest/searchService/search_2?searchText=', 
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json', 
   // 'Content-Length': Buffer.byteLength(postData),
    'Cookie':'' // +avaSession 
  }
};

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

  //console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  //console.log('DIALOGFLOW Request body: ' + JSON.stringify(req.body));
  //
  WebhookProcessing(req, res); //usa handleAgent

 
  /*****************OLD ************** */
  /*console.log(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
  //console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('DIALOGFLOW Request body: ' + JSON.stringify(req.body));
  //projects/testcallava/agent/sessions/dac5d6c5-c63f-b62d-7472-3f7673dc00e9
  
  let sessionId = req.body.session.split('/').pop();
  console.log('valore di sessionID DG '+sessionId);
  

  
  let strRicerca='';
  let out='';
  var str= req.body.queryResult.parameters.searchText; //req.body.queryResult.parameters.searchText; //req.body.searchText;
  if (str) {
    strRicerca=querystring.escape(str);
    options.path+=strRicerca+'&user=&pwd=&ava=FarmaInfoBot';
  
callAVA( strRicerca, sessionId).then((strOutput)=> {
       
  return res.json({ 'fulfillmentText': strOutput}); 
 
}).catch((error) => {
 
 return res.json({ 'fulfillmentText': 'errore: ' + error.message});

});
 }

*/
});

/**** FUNZIONI A SUPPORTO */

function scriviSessione(path, strSessione, strValore) {
  
  fs.appendFile(path + strSessione,strValore, function (err) {
    if (err) {
      
      throw err;
    
    } else {
    console.log('DENTRO SCRIVI SESSIONE: SALVATO FILE '+ path + strSessione);
    
    }
     
  });
 
} 

function leggiSessione(path, strSessione){
  var contents='';
  try {
    fs.accessSync(__dirname+ '/sessions/'+ strSessione);
    contents = fs.readFileSync(__dirname+'/sessions/'+ strSessione, 'utf8');
    console.log('DENTRO LEGGI SESSIIONE ' +contents);
  

  }catch (err) {
    if (err.code==='ENOENT')
    console.log('DENTRO LEGGI SESSIONE :il file non esiste...')
   
  }
  return contents;

} 
  
  // OLD SIGNATURE
//function callAVA(stringaRicerca, sess) {

//NEW SIGNATURE + AGENT
  function callAVA(agent) { 
  return new Promise((resolve, reject) => {

  let strRicerca='';
  let out='';
  let sessionId = agent.sessionId /*.split('/').pop()*/;
  console.log('dentro call ava il mio session id '+sessionId);
  var str= agent.parameters.searchText; //req.body.queryResult.parameters.searchText; //req.body.searchText;
  if (str) {
    strRicerca=querystring.escape(str);
    options.path+=strRicerca+'&user=&pwd=&ava='+bot;
  }

   let data = '';
    let strOutput='';
    //var ss=leggiSessione(__dirname +'/sessions/', sess);
    var ss=leggiSessione(__dirname +'/sessions/', sessionId);
    if (ss===''){
      options.headers.Cookie='JSESSIONID=';
      console.log('DENTRO CALL AVA: SESSIONE VUOTA');
    }else {
      options.headers.Cookie='JSESSIONID='+ss;
      console.log('DENTRO CALL AVA:  HO LA SESSIONE + JSESSIONID');
    }
  

    const req = https.request(options, (res) => {
    //console.log("DENTRO CALL AVA " + sess);   
    console.log('________valore di options.cookie INIZIO ' + options.headers.Cookie);
    console.log(`STATUS DELLA RISPOSTA: ${res.statusCode}`);
    console.log(`HEADERS DELLA RISPOSTA: ${JSON.stringify(res.headers)}`);
    console.log('..............RES HEADER ' + res.headers["set-cookie"] );
   
    if (res.headers["set-cookie"]){

      var x = res.headers["set-cookie"].toString();
      var arr=x.split(';')
      var y=arr[0].split('=');
      
     // scriviSessione(__dirname+'/sessions/',sess, y[1]); 
     
     scriviSessione(__dirname+'/sessions/',sessionId, y[1]); 
    } 
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
     console.log(`BODY: ${chunk}`);
     data += chunk;
   
     let c=JSON.parse(data);
            strOutput=c.output[0].output; 
           
            strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
        
            //resolve(strOutput); <--- OLD 
            agent.add(strOutput); //NEW 
            resolve(agent);
            
          
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
