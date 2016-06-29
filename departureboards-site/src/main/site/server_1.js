var http = require('http');
var fs = require('fs');
var url = require('url');

var layout = require('./layout');

//var home = require('./home');

//var mldb = "/mldb/";
//var mldblen = mldb.length();

http.createServer((request,response) => {
    // Parse the request containing file name
    var pathname = url.parse(request.url).pathname;
    
    // Print the name of the file for which request is made.
    console.log("Request for " + pathname + " received.");

    if( pathname === "/")
        layout.show(request,response,{
            title:"UK Departure Boards",
            body: function(req,resp,p) {
                resp.write("Home");
            },
            footer:layout.footer
        });
        home.show(request,response);
//    else if( pathname.startswith(mldb) && pathname.length()>mldblen)
//        displayBoard(pathname.substring(mldblen));
    else {
        // Read the requested file content from file system
        fs.readFile("/html"+pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                // HTTP Status: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, {'Content-Type': 'text/html'});
            }else{	
                //Page found	  
                // HTTP Status: 200 : OK
                // Content Type: text/plain
                response.writeHead(200, {'Content-Type': 'text/html'});	

                // Write the content of the file to response body
                response.write(data.toString());		
            }
            // Send the response body 
            response.end();
        });   
    }
}).listen(80);

console.log('Server running');
