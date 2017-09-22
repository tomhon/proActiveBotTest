var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || '2b58001f-47d5-41d7-bab3-041eea37358c',
    appPassword: process.env.MICROSOFT_APP_PASSWORD || '7JQN9RLVmXWirhFQeHSNuFe'
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// var savedAddress;

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
    function (session, args) {
        
          savedAddress = session.message.address;
          console.log(savedAddress);
        
          var message = 'Hey there, I\'m going to interrupt our conversation and start a survey in a few seconds.';
          session.send(message);
        
          message = 'You can also make me send a message by accessing: ';
          message += 'http://localhost:' + server.address().port + '/api/CustomWebApi';
          session.send(message);
        
          setTimeout(() => {
            startProactiveDialog(savedAddress);
          }, 5000);
        }]
);


// handle the proactive initiated dialog
bot.dialog('/survey', function (session, args, next) {
  if (session.message.text === "done") {
    session.send("Great, back to the original conversation");
    session.endDialog();
  } else {
    session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
  }
});

// initiate a dialog proactively 
function startProactiveDialog(address) {
  bot.beginDialog(address, "*:/survey");
}

var savedAddress;
server.post('/api/messages', connector.listen());

// Do GET this endpoint to start a dialog proactively
server.get('/api/CustomWebApi', function (req, res, next) {
  console.log('webapi triggered');
  startProactiveDialog('c5ngbae1f06i');
  res.send('triggered');
  next();
});
