var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//sends a simple message to the specified user
bot.ping = function(userID) {
    logger.info('sending message to user with id ' + userID);
    bot.sendMessage({
        to: userID,
        message: 'Pong!'
    });
}

//pings every registered user
bot.ping_all = function() {
    for (var key in users) {
        var user = users[key];
        logger.info(key + '[' + typeof key + '] maps to ' + user);
        bot.ping(user.id);
    }
};

//constructor for user objects
var User = function(username, id) {
    this.username = username;
    this.id = id;
    this.langs = new Set();
};

//tells the bot to intialise a record on this user
bot.users = {};
bot.register = function(username, id) {
    userObj = new User(username, id);
    logger.info(userObj)
    bot.users[id] = userObj;
};

//adds a language to the set of those known by the specified user
bot.add_lang = function(userID, lang) {
    user = bot.users[userID];
    logger.info(user.username + ' now speaks ' + lang);
    user.langs.add(lang);
}

bot.say = function(userID, msg) {

}

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.ping(userID);
                break;
            
            case 'register':
                logger.info('registering user ' + user 
                            + ' [' + typeof user + ']');
                logger.info(user + ' has id ' + userID 
                            + ' [' + typeof userID + ']');
                logger.info(user);
                bot.register(user, userID);
						break;

            case 'pingall':
                bot.ping_all();
                break;

            case 'addlang':
                for (var i in args) {
                    bot.add_lang(userID, args[i]);
                }
            
            case 'say':
            case '':
                bot.say(userID, message);
                break;
            // Just add any case commands if you want to..
         }
     }
});
