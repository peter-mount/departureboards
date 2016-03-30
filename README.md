# DepartureBoards.mobi

A web application to display the departure boards for any UK train station.

This is the next version of the http://departureboards.mobi site which was originally part of the opendata project.

This version has a few minor changes, other than being virtually a complete rewrite:
* It's completely standalone, being formed of a docker image containing a single Java application
* It holds the complete UK Train status for the current day in memory, virtually no DB use.
* Queries to display station departure boards are now virtually instant as its now in ram.
* On startup it uses the Darwin timetable and reference xml files which are updated daily (usually)
* Whilst running it accepts (via RabbitMQ) a copy of the Darwin pushPort feed to keep it's state in sync.

This is still a work in progress, not everything is working yet and not everything has been ported from the original prototype thats in opendata.
