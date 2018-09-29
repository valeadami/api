var express = require("express");
var bodyParser = require("body-parser");

var app = express();
//app.set('port', (process.env.PORT || 3000))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//routing e api 
// route handler for GET requests 
///random/10/100, ma anche /random/foo/bar, quindi verifica che siano numeri...
console.log('inizio...');
//app.get("/random/:min/:max", function(req, res) {

app.get("/", function (req, res){
  res.status(200).end("Sono nella root");

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
  res.json({
    fulfillmentText: "sono nella callAVA",
    payload: null
})

});
app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port 3000");
  });

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