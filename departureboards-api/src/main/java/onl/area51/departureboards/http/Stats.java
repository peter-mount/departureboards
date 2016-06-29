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
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import javax.json.Json;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.departureboards.service.DarwinLive;
import onl.area51.departureboards.service.DarwinReference;
import onl.area51.httpd.rest.JsonEntity;

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
public class Stats
{

    private static final Duration MAX_AGE = Duration.ofMinutes( 1 );

    void deploy( @Observes ActionRegistry builder, DarwinLive darwinLive, DarwinReference darwinReference )
            throws IOException
    {
        builder.registerHandler( "/api/departure",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .add( r -> r.expiresIn( MAX_AGE )
                                         .maxAge( MAX_AGE )
                                         .accessControlAllowOriginAny()
                                 )
                                 .sendOk( JsonEntity.encodeObject(
                                         () -> Json.createObjectBuilder()
                                         .add( "live", darwinLive.getStats() )
                                         .add( "reference", darwinReference.getStats() )
                                 ) )
                                 .end()
                                 .build() );
    }

}
