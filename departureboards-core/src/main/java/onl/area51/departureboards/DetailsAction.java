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
import java.time.Duration;
import java.time.LocalTime;
import java.util.Objects;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import javax.json.JsonObject;
import onl.area51.departureboards.api.JsonEntity;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpException;
import org.apache.http.HttpStatus;
import uk.trainwatch.util.TimeUtils;
import onl.area51.departureboards.api.RealTimeTrain;

/**
 * Handles the detail page for a specific train via /train/{RID}
 *
 * @author peter
 */
@Dependent
public class DetailsAction
{

    void deploy( @Observes ActionRegistry builder, RealTimeTrain realtimeTrain )
            throws IOException
    {
        Duration MAX_AGE = Duration.ofMinutes( 1 );

        builder.registerHandler( "/api/departure/train/*",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .setAttribute( "rid", r -> r.getPath( 4 ) )
                                 .ifAttributePresentSetAttribute( "rid", "journey", r -> realtimeTrain.getJourney( r.getAttribute( "rid" ) ) )
                                 .ifAttributePresent( "journey", r -> r.expiresIn( MAX_AGE ).maxAge( MAX_AGE ) )
                                 .ifAttributePresentSendOk( "journey", JsonEntity::createFromAttribute )
                                 .ifAttributeAbsentSendError( "journey", HttpStatus.SC_NOT_FOUND )
                                 .end()
                                 .build()
        )
                .registerHandler( "/train/*",
                                  HttpRequestHandlerBuilder.create()
                                  .log()
                                  .method( "GET" )
                                  .setAttribute( "rid", r -> r.getPath( 2 ) )
                                  .ifAttributePresentSetAttribute( "rid", "ridValid", r -> realtimeTrain.isRidValid( r.getAttribute( "rid" ) ) )
                                  .ifAttributeTrue( "ridValid", r -> r.expiresIn( MAX_AGE ).maxAge( MAX_AGE ) )
                                  .ifAttributeTrueSetAttribute( "ridValid", "pageTitle", r -> r.getAttribute( "rid" ) )
                                  .ifAttributeTrue( "ridValid",
                                                    LayoutBuilder.builder()
                                                    .setTitle( "Departure Boards" )
                                                    .setBanner( Banner.STATION )
                                                    .setHeader( DetailsAction::header )
                                                    .setFooter( StandardTiles.FOOTER )
                                                    .setBody( DetailsAction::display )
                                                    .build()
                                  )
                                  .ifAttributeAbsentSendError( "location", HttpStatus.SC_NOT_FOUND )
                                  .end()
                                  .build()
                );
    }

    private static final String JS_START = "var ldb,ui;"
                                           + "$(document).ready(function (){"
                                           + "setTimeout(function (){"
                                           + "ui=new UI();"
                                           + "ldb=new LDB('";
    private static final String JS_END = "');},250);});";

    private static void display( Request request )
            throws HttpException,
                   IOException
    {
        request.getResponse()
                .div().id( "board" ).end()
                .div().id( "message" ).end()
                .script()
                .write( JS_START )
                .write( request.<String>getAttribute( "crs" ) )
                .write( "','" )
                // Time is optional
                .write( Objects.toString( request.<LocalTime>getAttribute( "time" ) ) )
                .write( JS_END )
                .end();
    }

    private static void header( Request request )
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
