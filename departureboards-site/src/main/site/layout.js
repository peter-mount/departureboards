var fs = require('fs');

exports.show = function (req, resp, p) {
    console.info("req start " + req.url);
    try {
        resp.writeHead(200, {
            'Content-Type': 'text/html'
        });
        resp.write("<html><head><title>");
        if (p.title)
            resp.write(p.title);
        else
            resp.write("Unknown");
        resp.write("</title>");
        resp.write('<link rel="stylesheet" href="/css/mobile.css"/><link rel="stylesheet" href="/css/ldb.css"/>');
        resp.write('<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>');
        resp.write('<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>');
        resp.write('<script src="/js/jquery-cookie.js"></script>');
        resp.write('<script src="/js/mobile.js"></script>');
        resp.write('</head>');
        resp.write('<body><div id="outer"><div id="outer-banner"><div id="inner-banner">');
        if (p.banner)
            p.banner(req, resp, p);
        if (p.header)
            p.header(req, resp, p);
        resp.write('</div></div>');
        resp.write('<div id="outer-body"><div id="inner-body">');
        if (p.body)
            p.body(req, resp, p);
        resp.write('</div></div>');
        resp.write('<div id="outer-footer"><div id="inner-footer">');
        if (p.footer)
            p.footer(req, resp, p);
        resp.write('</div></div>');
        // cookie?
        resp.write('<div id="loading"></div>');
        resp.write('</div></body></html>');
        resp.end();
    } catch (err) {
        console.error(err);
        try {
            resp.end();
        } catch (err2) {
            console.error(err2);
        }
    }
    console.info("req end");
};

exports.footer = function (req, resp) {
    resp.write("&copy;2011-" + (new Date().getYear() - 100));
    resp.write(" Peter Mount, All Rights Reserved.<br/>Contains data provided by <br/>");
    resp.write('<a href="http://www.networkrail.co.uk/">Network Rail</a>, ');
    resp.write('<a href="http://www.networkrail.co.uk/">National Rail Enquiries</a>, ');
    resp.write('<a href="http://www.tfl.gov.uk/">Transport for London<a>');
    resp.write(" and other public sector information licensed under the Open Government Licence.");
};

exports.commonButtons = function (req, resp) {
    resp.write('<a class="ldbbutton" href="/about">About</a><a class="ldbbutton" href="/contact">Contact Us</a>');
};

exports.homeButtons = function (req, resp) {
    resp.write('<a class="ldbbutton" href="/">Choose station</a>');
    exports.commonButtons(req, resp);
    resp.write('<div class="ldbLoc"><h1>Realtime Departure Boards</h1></div>');
};

exports.include = function (resp, path) {
    try {
        resp.write(fs.readFileSync(path).toString());
    } catch (err) {
        console.log(err);
    }
};