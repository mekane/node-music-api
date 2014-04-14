//Required Packages
var restify = require('restify'),
    mongojs = require('mongojs');

//Configurations
var mongoHost = 'mongodb://localhost:',
    mongoPort = 27017,
    mongoDb   = "/music",
    mongoPath = mongoHost+mongoPort+mongoDb;
var serverPort = 3000;

// Connect to the db and init the collections
var db = mongojs(mongoPath, ['artists','albums'] );

//Set up Server
var server = restify.createServer({
    name: 'MyMusic',
});
server.use( restify.bodyParser( {mapParams: false }) );
server.use( restify.queryParser({mapParams: false }) );

//Utility
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function findAll( name, res ){
    if ( name && db[name] ){
        db[name].find({}, function(err, items){
            if (err){
                res.json(err);
            }
            else {
                res.json(items);
            }
        });
    }
    else {
        console.error("findAll: Bad database "+name);
    }
}

/* ---------- REST API Actions ------------------------------------------
 * 
 * ARTISTS:
 *
 *  /artists
 *    get: List all artists
 *    put: Replace all artists (not used)
 *    post: Add a new artist
 *    del: Remove all artists (not used)
 *
 *  /artists/?query
 *    get: List artists by properties in query params
 *    put: Update artists by query params (not used)
 *
 *  /artists/:id
 *    get: Get details for a single artist 
 *    put: Replace details for a single artist
 *    post: Create a new artist with this id (not used)
 *    del: Delete the artist
 * 
 *
 * ALBUMS
 *  /albums
 *    get: List all albums
 *    post: Add a new album
 *
 *  /albums/:id
 *    get: Get details for a single album
 *    put: Update details for a single album
 *    del: Delete the album
 *
 *   
 *
 *
 * ----------------------------------------------------------------------*/

server.get('/music/artists', function( req, res, next ){
    if ( isEmpty(req.query) ){ 
        findAll('artists', res);
    }
    else {
        db.artists.find( req.query, function( err, results ){
            res.json( err ? err : results );
        });
    }
    return next();
});

server.post('/music/artists', function( req, res, next ){
    if ( req.body ){
        if ( typeof(req.body) === 'string' ){
            req.body = JSON.parse(req.body);
        }

        db.artists.save( req.body, function(err){
            if ( err ){
                res.send( 500, err );
            }
            else {
                res.send(200); //TODO: return ID?
            }
        });
    }
    else {
        res.send( 500, "No POST Data" );
    }

    return next();
});


/* ---------- Artists/:id ---------- */
server.get('/music/artists/:id', function( req, res, next ){
    var artistId = req.params['id'];

    if ( artistId ){
        db.artists.findOne({id:artistId}, function(err, artist){
            res.json( err ? err : artist );
        });
    }
    else {
        res.json([]);
    }

    return next();
});

server.put('/music/artists/:id', function( req, res, next ){
     
    return next();
});

server.del('/music/artists/:id', function( req, res, next ){
    //TODO db.artists.remove({id:'id'});
    return next();
});


/* Test Route - for debugging */
function printParams( req, res, next ){
    console.log( '' );
    console.log( 'query: ',req.query );
    console.log( 'params: ',req.params );
    console.log( 'empty query: '+isEmpty(req.query));

    res.json( req.params );
    return next();
}
server.get('/test', printParams );
server.get('/test/:id', printParams );


//Start server
server.listen(serverPort, function(){
    console.log('Server listening on port '+serverPort);
});
