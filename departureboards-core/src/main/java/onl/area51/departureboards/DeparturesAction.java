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
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import javax.json.JsonObject;
import onl.area51.departureboards.api.DepartureBoards;
import onl.area51.departureboards.api.JsonEntity;
import onl.area51.departureboards.api.StationSearch;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;
import org.apache.http.HttpStatus;
import uk.trainwatch.util.TimeUtils;

/**
 * Handles the departure board JSON service.
 * <p>
 * This accepts two URI's:
 * <ul>
 * <li>/api/departure/board/{CRS} returns the display boards for the current time.</li>
 * <li>/api/departure/board/{CRS}/{TIME} returns the display boards for the specified time.</li>
 * </ul>
 * <p>
 * where:
 * <ul>
 * <li>CRS is a station CRS/3Alpha code.</li>
 * <li>TIME is an optional time in the format HH:MM. If blank then this is the current time of day.</li>
 * </ul>
 *
 * @author peter
 */
@Dependent
public class DeparturesAction
{

    void deploy( @Observes ActionRegistry builder, StationSearch stationSearch, DepartureBoards departureBoards )
            throws IOException
    {
        Duration MAX_AGE = Duration.ofMinutes( 1 );

        // /api/departure/board/{crs}
        // /api/departure/board/{crs}/{time}
        builder.registerHandler( "/api/departure/board/*",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 // CRS fail if not valid, we need location of the validated crs
                                 .add( CommonActions.extractCrsAction( 4, false ) )
                                 .ifAttributePresentSetAttribute( "crs", "location", r -> stationSearch.lookupCrs( r.getAttribute( "crs" ) ) )
                                 // Time to return, default to now if not present
                                 .add( CommonActions.extractTime( 5, "time", TimeUtils::getLondonTime ) )
                                 // If location is present then get the departureboards
                                 .ifAttributePresentSetAttribute( "location", "boards", r -> departureBoards.departureBoards( r.getAttribute( "crs" ),
                                                                                                                              r.getAttribute( "time" ) ) )
                                 // Return as Json
                                 .ifAttributePresent( "boards", r -> r.expiresIn( MAX_AGE ).maxAge( MAX_AGE ) )
                                 .ifAttributePresentSendOk( "boards", JsonEntity::createFromAttribute )
                                 .ifAttributeAbsentSendError( "boards", HttpStatus.SC_NOT_FOUND )
                                 .end()
                                 .build()
        );
    }

}
