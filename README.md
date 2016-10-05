# Network Rail TimeTable

This is a replacement of our Java/SQL based timetable engine, rewritten entirely in C.

It provides two commands:

## ttimport

Imports one or more CIF files and loads the data into a custom database.

CIF files are the file format we receive the rail timetables from Network Rail over the SCHEDULE data feed.

## timetabled

Provides a simple webserver which responds to simple REST queries on the schedule.

# Note

This is a work in progress however 90% of the CIF is now parsed (only Associations need implementing) and currently only the Tiploc data can be queried.

However this is the majority of the work done. Import performance is way improved on the original - it can now do a full import and a week's worth of updates in under a minute. The old system took 4 to 6 HOURS!

The memory/cpu footprint should also be a lot less when running.
