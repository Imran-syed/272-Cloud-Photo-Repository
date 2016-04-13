var appRouter1 = function(app) {

 app.get("/riakdb", function(req, res) {
    res.send("Inside Riak DB calls ");
});


}
 
module.exports = appRouter1;