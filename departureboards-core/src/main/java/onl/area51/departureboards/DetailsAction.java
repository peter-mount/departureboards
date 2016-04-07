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
import java.util.function.Function;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.departureboards.api.JsonEntity;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpException;
import org.apache.http.HttpStatus;
import onl.area51.departureboards.api.RealTimeTrain;
import org.apache.http.protocol.HttpRequestHandler;

/**
 * Handles the train details.
 * <ul>
 * <li>/api/departure/train/short/{rid} Returns Json for an active train with stops only.</li>
 * <li>/api/departure/train/full/{rid} Returns Json for an active train with all points.</li>
 * <li>/train/{rid} Returns the departureboards detail page which shows the short content</li>
 * </ul>
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

        Function<Boolean, HttpRequestHandler> api = stopsOnly -> HttpRequestHandlerBuilder.create()
                .log()
                .method( "GET" )
                .setAttribute( "rid", r -> r.getPath( 5 ) )
                .ifAttributePresentSetAttribute( "rid", "journey", r -> realtimeTrain.getJourney( r.getAttribute( "rid" ), stopsOnly ) )
                .ifAttributePresent( "journey", r -> r.expiresIn( MAX_AGE ).maxAge( MAX_AGE ).accessControlAllowOriginAny() )
                .ifAttributePresentSendOk( "journey", JsonEntity::createFromAttribute )
                .ifAttributeAbsentSendError( "journey", HttpStatus.SC_NOT_FOUND )
                .end()
                .build();

        builder.registerHandler( "/api/departure/train/short/*", api.apply( true ) )
                .registerHandler( "/api/departure/train/full/*", api.apply( false ) )
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
                                           + "ldb=new Train('";
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
                .write( request.<String>getAttribute( "rid" ) )
                .write( JS_END )
                .end();
    }

    private static void header( Request request )
            throws HttpException,
                   IOException
    {
        request.getResponse()
                .div()
                .write( "Train details" )
                .write( request.<String>getAttribute( "rid" ) )
                .end();
    }
}
