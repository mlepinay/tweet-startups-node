var Twit = require('twit');
var http = require('http');
var unshorten = require('unshorten');
var express = require('express');
var router = express.Router();

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var maxActionPerDay = 20
var keywords = 'tech,technology,startup,developer,programmer,marketing,sales,founder'
var keywordsURL = 'meetup.com,eventbrite.com,facebook.com/events,yelp.co.uk/events'
var london = [ '-0.251999', '51.47454', '0.018539', '51.557436' ]
var stream = T.stream('statuses/filter', { track: keywords, location: london })
var isStreamRunning = true;

var isGeoInLondon = function (geo) {
    if (geo[0] >= london[1] && geo[0] <= london[3] &&
        geo[1] >= london[0] && geo[1] <= london[2]) {
            return true;
    }
    return false;
}

var getLinksFromText = function (text) {
    var retVal = text.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/g);
    
    return retVal;
}

var unshortenUrl = function (shortUrl) {
    unshorten(shortUrl, function(url) {
        console.log('Got: '+ shortUrl);
        console.log(url + ' is where it’s at!');
    });
}

router.get('/start', function(req, res, next) {
    if (!isStreamRunning) {
        stream.start();
        isStreamRunning = true;
    }
    
    var counter = 0;
    
    //Open Twitter stream 
    stream.on('tweet', function (tweet) {

        //console.log(tweet);

        var date = new Date();
        var day = 'FR' + date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
        
        var links = getLinksFromText(tweet.text);
        
        if (links !== null && links.length > 0) {
            console.log('Links found:');
            for (var index = 0; index < links.length; index++) {
                var link = links[index];
                
                unshortenUrl(link);
            }
            console.log('\n');
        }
        // process.stdout.write("New tweet: " + counter + "\r");
        // if (tweet.geo !== null && tweet.geo.coordinates !== null) {            
        //     console.log("\nGeo:\n");
        //     if (isGeoInLondon(tweet.geo.coordinates)) {
        //         console.log("London:");
                // console.log("\n");        
                // console.log(tweet);
                // console.log("\n");        
        //     }
        // }
        
        counter++;

    // 	redis.get(day, function(err, reply) {
    //     
    //     	//Max X action per day
    // 		if (reply < maxActionPerDay) {
    // 
    //             random = Math.random()
    // 			//Ramdomly favorite or retweet
    // 			if (random<.25) {
    // 				T.post('favorites/create', { id: tweet.id_str }, function(err, data, response) {
    // 					redis.incr(day);
    // 				})
    // 			} else if (random>=.25 && random <.5) {
    // 				T.post('statuses/retweet/:id', { id: tweet.id_str }, function (err, data, response) {
    // 				  	redis.incr(day);
    // 				})
    // 			} else if (random>=.5 && random <.75) {
    //                 listId = 223516223;
    //                 T.post('lists/members/create', { list_id: listId, user_id: tweet.user.id }, function(err, data, response) {
    //                     redis.incr(day);
    //                 })
    //             } else {
    //                 T.post('statuses/update', { status: '@john_iw2 discover Château Diamant!' }, function(err, data, response) {
    //                     redis.incr(day);
    //                 })
    //             }
    // 		}
        // });  	
    });
    
    res.render('scraper', { status: 'ON', verb: 'started', reverseAction: 'stop' });
});

router.get('/stop', function(req, res, next) {
    if (isStreamRunning) {
        stream.stop();
        isStreamRunning = false;    
    }
    res.render('scraper', { status: 'OFF', verb: 'stopped', reverseAction: 'start' });
});

// var items = [
//     " amateur de vin ? Découvrez l'expérience Château Diamant http://chateaudiamant.com/?utm_source=twitter&utm_medium=op1&utm_campaign=Twitter #wine",
//     " amoureux du vin ? Pré-commander une bouteille de Château Diamant http://chateaudiamant.com/?utm_source=twitter&utm_medium=op2&utm_campaign=Twitter #winelover",
//     " êtes-vous curieux ? http://chateaudiamant.com/?utm_source=twitter&utm_medium=op3&utm_campaign=Twitter #vin #wine",
//     " vous êtes joueur et vous aimez le vin ? http://chateaudiamant.com/?utm_source=twitter&utm_medium=op4&utm_campaign=Twitter #vin #wine",
//     " enfin de découvrir une expérience unique autour du vin ? http://chateaudiamant.com/?utm_source=twitter&utm_medium=op5&utm_campaign=Twitter #vin #wine",
//     " une bouteille de Château Diamant gratuite ça vous dit ? http://chateaudiamant.com/?utm_source=twitter&utm_medium=op6&utm_campaign=Twitter #vin #wine",
//     " nouvelle marque de vin : Château Diamant. Envie d'en savoir plus ? http://goo.gl/9dBH1f #vin #wine",
//     " besoin d'une bouteille de vin ? http://chateaudiamant.com/?utm_source=twitter&utm_medium=op7&utm_campaign=Twitter #vin #wine"
// ];
// var item = items[Math.floor(Math.random()*items.length)];
// 
// item = " test http://chateaudiamant.com/?utm_source=twitter&utm_medium=automation&utm_campaign=Twitter #vin #wine"
// 
// T.post('statuses/update', { status: '@john_iw2' + item }, function(err, data, response) {
//     //redis.incr(day);
// })

module.exports = router;