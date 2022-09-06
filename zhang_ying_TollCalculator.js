var express = require('express');
var MySQL = require('sync-mysql');

var connection = new MySQL({
  host: "helloworld.cklzhvgx6s17.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "opensesame",
  database: "tollschedule"

});

var app = express();								
app.use(express.urlencoded({extended:false}));
app.use(express.json());  

intNumber = [];

app.use(function(req, res, next) {
    express.urlencoded({extended:false})
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });

app.get('/interchangeRequest', function(req,res){

    var payment = req.query.paymentMethod1;

    var responseMessage = "";

    bodyExit = parseInt(req.query.exitInterchange1);
    bodyEnter = parseInt(req.query.enterInterchange1);
    
    console.log("Received request for toll from "+bodyEnter+ " to "+bodyExit+ " with "+payment);

    if ((payment=="Cash")&&((bodyEnter == 320)||(bodyEnter== 340)||(bodyEnter==352))) {
        console.log('Interchange ' +bodyEnter+ ' only accepts E-ZPass. Try getting on the turnpike from another interchange.');
        responseMessage= {APIMessage: new String('Interchange ' +bodyEnter+ ' only accepts E-ZPass. Try getting on the turnpike from another interchange.')}; 
        res.json(responseMessage)

    }
    if ((payment=="Cash")&&((bodyExit == 320)||(bodyExit== 340)||(bodyExit==352))) {
        console.log('Interchange ' +bodyExit+ ' only accepts E-ZPass. Try getting off the turnpike from another interchange.');
        responseMessage= {APIMessage: new String('Interchange ' +bodyExit+ ' only accepts E-ZPass. Try getting off the turnpike from another interchange.')}; 
        res.json(responseMessage)
    }

// console.log('YING!!');
    if (payment=="E-ZPass"){

        // console.log('The user chose E-ZPass');
        var toll = connection.query("SELECT toll FROM tollschedule.ezpasstollschedule WHERE interchangeEnter = " +bodyEnter+ " AND interchangeExit=" +bodyExit+";");
        var result_toll = "$"+toll[0]['toll']+"0";
        // console.log("test: "+result_toll);
    }
    if (payment=="Cash") {
        // console.log('The user chose cash.');
        var toll = connection.query("SELECT toll FROM tollschedule.cashtollschedule WHERE interchangeEnter = " +bodyEnter+ " AND interchangeExit=" +bodyExit+";");
        var result_toll = "$"+toll[0]['toll']+"0";
        // console.log("test: "+result_toll);

    }

    var enterLong = connection.query("SELECT longitude FROM tollschedule.interchangeinfo WHERE interchange = " +bodyEnter+ ";");
    var result_enterLong = enterLong[0]['longitude'];
    // console.log("ENTER INTERCHANGE LONG: "+result_enterLong);
    var enterLat = connection.query("SELECT latitude FROM tollschedule.interchangeinfo WHERE interchange = " +bodyEnter+ ";");
    var result_enterLat = enterLat[0]['latitude'];
    // console.log("ENTER INTERCHANGE LAT: "+result_enterLat);

    var exitLong = connection.query("SELECT longitude FROM tollschedule.interchangeinfo WHERE interchange = " +bodyExit+ ";");
    var result_exitLong = exitLong[0]['longitude'];
    // console.log("EXIT INTERCHANGE LONG: "+result_exitLong);
    var exitLat = connection.query("SELECT latitude FROM tollschedule.interchangeinfo WHERE interchange = " +bodyExit+ ";");
    var result_exitLat = exitLat[0]['latitude'];
    // console.log("EXIT INTERCHANGE LAT: "+result_exitLat);

    console.log('Returning Entrance Interchange: '+bodyEnter+ " Exit interchange: "+bodyExit+" Payment Method: "+payment+
                " Toll: " +result_toll + " Entrance Latitude: "+result_enterLat+ " Entrance: Longtitude: "+result_enterLong+
                " Exit Latitude: "+result_exitLat+ " Exit Longitude: "+result_exitLong );
    responseMessage = {entraceInterchange: bodyEnter,
                        exitInterhange: bodyExit, paymentMethod: payment, tollAmount: result_toll,
                        latitude1: result_enterLat,latitude1: result_enterLat,latitude2: result_exitLat,long1: result_enterLong, long2: result_exitLong};

    res.json(responseMessage)
    // console.log('responseSent');
	});

console.log("Listening on port 8080");
app.listen(8080);	
