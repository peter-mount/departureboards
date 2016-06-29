
var body = function (req, resp, p) {
    resp.write("Homepage");
};

exports.home = function (layout) {
    return function (req, resp) {
        layout.show(req, resp, {
            "title": "UK Departure Boards",
            "banner": layout.homeButtons,
            "footer": layout.footer,
            "body": function (req, resp, p) {
                layout.include(resp, 'public/home.html');
            }
        });
    };
};
