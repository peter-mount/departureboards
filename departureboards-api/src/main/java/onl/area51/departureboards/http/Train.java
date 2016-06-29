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
package onl.area51.departureboards.http;

import java.io.IOException;
import java.time.Duration;
import java.util.function.Function;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import org.apache.http.HttpStatus;
import onl.area51.departureboards.api.RealTimeTrain;
import onl.area51.httpd.rest.JsonEntity;
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
public class Train
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
                .registerHandler( "/api/departure/train/full/*", api.apply( false ) );
    }

}
