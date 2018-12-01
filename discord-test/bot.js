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
bot.users = {};

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//sends a simple message to the specified user
bot.ping = function(userID) {
    logger.info('sending message to user with id ' + userID);
    this.sendMessage({
        to: userID,
        message: 'Pong!'
    });
}

//pings every registered user
bot.ping_all = function() {
    for (var key in this.users) {
        var user = this.users[key];
        logger.info(key + ' maps to ' + user.username);
        this.ping(user.id);
    }
};

//constructor for user objects
var User = function(username, id) {
    this.username = username;
    this.id = id;
    this.langs = new Set();
};

//NOTE: looks like the bot has all this info by default
//      and my terminology just happened to match up
//      with theirs, so... this is propably unneccesary
//tells the bot to intialise a record on this user
bot.register = function(username, id) {
    if (this.users[id] === undefined) {
        logger.info('registering user ' + username 
                    + ' with id ' + id); 
        userObj = new User(username, id);
        logger.info(userObj)
        this.users[id] = userObj;
    } else {
        user = this.users[id];
        logger.info('user ' + user.username + ' already registered');
    }
};

//adds a language to the set of those known by the specified user
bot.add_lang = function(userID, lang) {
    user = this.users[userID];
    logger.info(user.username + ' now speaks ' + lang);
    
    //intialise the user's set of languages if it doesn't exist yet
    if (user.langs === undefined) {
        user.langs = new Set();
    }

    user.langs.add(lang);
}

//sets the users current language
bot.set_lang = function(userID, lang) {
    user = this.users[userID];
    logger.info(user.username + ' default language set to ' + lang);

    
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
                if (args[0] == 'all') {
                    bot.ping_all();
                } else {
                    bot.ping(userID);
                }
                break;
            
            case 'register':
                bot.register(user, userID);
						break;

            case 'lang':
                switch(args[0]) {
                    case 'add':
                        //take add out of the set of args
                        args = args.splice(1);
                        for (var i in args) {
                            bot.add_lang(userID, args[i]);
                        }
                        break;
                }
                break;
            
            case 'say':
            case '':
                bot.say(userID, message);
                break;
            // Just add any case commands if you want to..
         }
     }
});
