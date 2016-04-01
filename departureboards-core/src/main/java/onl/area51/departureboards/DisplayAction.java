/*
 * Copyright 2016 peter.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package onl.area51.departureboards;

import java.io.IOException;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.json.JsonObject;
import onl.area51.departureboards.api.DepartureBoards;
import onl.area51.departureboards.api.JsonEntity;
import onl.area51.departureboards.api.StationSearch;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.action.Actions;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpException;
import org.apache.http.HttpStatus;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class DisplayAction
{

    @Inject
    private DepartureBoards departureBoards;

    @Inject
    private StationSearch stationSearch;

    void deploy( @Observes ActionRegistry builder )
            throws IOException
    {
        builder.registerHandler( "/mldb/*",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .add( this::checkCrs )
                                 .ifAttributePresent( "location",
                                                      LayoutBuilder.builder()
                                                      .setTitle( "Departure Boards" )
                                                      .setBanner( Banner.STATION )
                                                      .setHeader( this::header )
                                                      .setFooter( StandardTiles.FOOTER )
                                                      .setBody( this::display )
                                                      .build()
                                 )
                                 .errorIfAttributeAbsent( "location", HttpStatus.SC_NOT_FOUND )
                                 .build()
        )
                .registerHandler( "/vldb/*",
                                  HttpRequestHandlerBuilder.create()
                                  .log()
                                  .method( "GET" )
                                  .add( this::search )
                                  .end()
                                  .build()
                );
    }

    private String getCrs( Request request )
            throws HttpException,
                   IOException
    {
        String path = request.getURI().getPath();
        int i = path.indexOf( '/', 1 );
        return i > -1 ? path.substring( i + 1 ) : null;
    }

    private void checkCrs( Request request )
            throws HttpException,
                   IOException
    {
        String crs = getCrs( request );
        JsonObject location = stationSearch.lookupCrs( crs );
        if( location != null ) {
            request.setAttribute( "crs", location.getString( "crs" ) )
                    .setAttribute( "location", location )
                    .setAttribute( "pageTitle", location.getString( "crs" ) + " " + location.getString( "location" ) );
        }
    }

    /**
     * Handle the initial display
     *
     * @param request
     *
     * @throws HttpException
     * @throws IOException
     */
    private void search( Request request )
            throws HttpException,
                   IOException
    {
        String crs = getCrs( request );

        JsonObject boards = departureBoards.departureBoards( crs );
        if( boards == null || boards.isEmpty() ) {
            Actions.notFoundAction().apply( request );
        }
        else {
            request.setEntity( new JsonEntity( boards ) );
        }
    }

    private static final String JS_START = "var ldb,ui;"
            + "$(document).ready(function (){"
            + "setTimeout(function (){"
            + "ui=new UI();"
            + "ldb=new LDB('";
    private static final String JS_END = "');},250);});";

    private void display( Request request )
            throws HttpException,
                   IOException
    {
        String crs = request.getAttribute( "crs" );

        request.getResponse()
                .div().id( "board" ).end()
                .div().id( "message" ).end()
                .script()
                .write( JS_START )
                .write( crs )
                .write( JS_END )
                .end();
    }

    private void header( Request request )
            throws HttpException,
                   IOException
    {
        JsonObject loc = request.getAttribute( "location" );

        request.getResponse()
                .begin( "img" )
                .id( "settings" )
                .attr( "src", "/images/search.png" )
                .end()
                .div()
                ._class( "ldbWrapper" )
                .div()
                ._class( "ldbTable" )
                .div()
                ._class( "ldbLoc" )
                .div()
                ._class( "ldbCont" )
                .write( loc.getString( "location" ) )
                // TUBE/DLR here
                .end()
                .end()
                //
                .div()
                ._class( "ldbHead" )
                .div()._class( "ldbCol ldbForecast" ).write( "Expected" ).end()
                .div()._class( "ldbCol ldbSched" ).write( "Departs" ).end()
                .div()._class( "ldbCol ldbPlat" ).write( "Plat." ).end()
                .div()._class( "ldbCont" ).write( "Destination" ).end()
                .end()
                //
                .end()
                .end();

        request.getResponse()
                .div()
                .id( "settingsPanel" )
                .div()
                ._class( "settingsInner" )
                .h2().write( "Options" ).end()
                .write( "The following o[ptions are available" )
                .table()
                //
                .tr().th()._class( "center" ).attr( "colspan", 2 ).write( "Services" ).end().end()
                .tr()
                .th().write( "Show services terminating here" ).end()
                .td().input().id( "settingTerm" ).attr( "name", "ldbTerm" ).attr( "default", false ).attr( "type", "checkbox" ).end().end()
                .end()
                //
                .tr().th()._class( "center" ).attr( "colspan", 2 ).write( "Calling points" ).end().end()
                .tr()
                .th().write( "Show running services" ).end()
                .td().input().id( "settingCall" ).attr( "name", "ldbCall" ).attr( "default", true ).attr( "type", "checkbox" ).end().end()
                .end()
                .tr()
                .th().write( "Show terminated services" ).end()
                .td().input().id( "settingTermCall" ).attr( "name", "ldbTermCall" ).attr( "default", true ).attr( "type", "checkbox" ).end().end()
                .end()
                .tr()
                .th().write( "Show cancelled services" ).end()
                .td().input().id( "settingCanCall" ).attr( "name", "ldbCanCall" ).attr( "default", true ).attr( "type", "checkbox" ).end().end()
                .end()
                .end()
                //
                .div()
                .a().id( "settingsCancel" )._class( "ldbbutton" ).write( "Cancel" ).end()
                .a().id( "settingsSave" )._class( "ldbbutton" ).write( "Save" ).end()
                .end()
                //
                .end()
                .end();
    }
}
