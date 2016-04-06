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

import java.time.Duration;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.departureboards.api.StationSearch;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.departureboards.api.JsonEntity;
import org.apache.http.HttpStatus;

/**
 * Exposes the {@link StationSearch} API to JQuery on the home page which allows the user to search for a station.
 *
 * @author peter
 */
@Dependent
public class SearchAction
{

    void deploy( @Observes ActionRegistry builder, StationSearch stationSearch )
    {
        Duration MAX_AGE = Duration.ofDays( 1 );
        
        builder.registerHandler( "/api/departure/search",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .setAttributeFromParameter( "term" )
                                 .ifAttributePresentSetAttribute( "term", "result", ( r, term ) -> stationSearch.search( (String) term ) )
                                 .ifAttributePresent( "result", r -> r.expiresIn( MAX_AGE ).maxAge( MAX_AGE ) )
                                 .ifAttributePresentSendOk( "result", JsonEntity::createFromAttribute )
                                 .ifAttributeAbsentSendError( "result", HttpStatus.SC_NOT_FOUND )
                                 .end()
                                 .build()
        );
    }

}
