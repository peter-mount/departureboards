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
package onl.area51.departureboards.service;

import java.io.IOException;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import onl.area51.departureboards.api.DepartureBoards;
import onl.area51.departureboards.api.LocationRef;
import onl.area51.departureboards.api.Toc;
import uk.trainwatch.util.JsonUtils;
import uk.trainwatch.util.TimeUtils;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class DepartureBoardsService
        implements DepartureBoards
{

    @Inject
    private DarwinReference darwinReference;

    @Inject
    private DarwinLive darwinLive;

    @Override
    public JsonObject departureBoards( String crs )
            throws IOException
    {
        if( crs == null || crs.length() != 3 ) {
            return null;
        }

        LocationRef loc = darwinReference.getLocationFromCrs( crs.toUpperCase() );
        if( loc == null ) {
            return null;
        }

        LocalTime now = LocalTime.now( TimeUtils.LONDON );
        LocalTime st = now.minus( 1, ChronoUnit.MINUTES );
        LocalTime et = now.plus( 1, ChronoUnit.HOURS );

        // Calling points for each tiploc at this station
        Set<Point> set = darwinLive.getDeparturesByCrs( crs );

        JsonObjectBuilder ob = Json.createObjectBuilder()
                .add( "crs", loc.getCrs() )
                .add( "location", loc.getLocation() )
                // The departures
                .add( "departures",
                      set.stream()
                      .filter( p -> p.isWithin( st, et ) )
                      .map( p -> p.toJson()
                              // Only stopping calling points
                              .add( "calling",
                                    p.getCallingPoints()
                                    .stream()
                                    .filter( cp -> cp.getType().isStop() )
                                    .map( Point::toCPJson )
                                    .collect( JsonUtils.collectJsonArray() ) ) )
                      .collect( JsonUtils.collectJsonArray() )
                )
                // Add tiploc xref table
                .add( "locref",
                      set.stream()
                      .filter( p -> p.isWithin( st, et ) )
                      // Expand to point, origin, destination, lastReport etc
                      .flatMap( p -> Stream.concat( Stream.of( p,
                                                               // lastReport also here
                                                               p.getJourney().getOrigin(),
                                                               p.getJourney().getDestination() ),
                                                    // Also calling points
                                                    p.getCallingPoints().stream()
                      ) )
                      // Incase origin, dest, lastreport are null
                      .filter( Objects::nonNull )
                      // Now form a unique stream of tiplocs
                      .map( Point::getTpl )
                      .sorted()
                      .distinct()
                      // Map to TrainLocation (default to tpl if new/unknown)
                      .map( darwinReference::resovleTiploc )
                      // Form the JsonObject
                      .collect( JsonUtils.collectJsonObject( LocationRef::getTiploc, LocationRef::toSmallJson ) )
                )
                .add( "opref",
                      set.stream()
                      .filter( p -> p.getType().isStop() && p.isWithin( st, et ) )
                      .map( p -> p.getJourney().getToc() )
                      .filter( Objects::nonNull )
                      .sorted()
                      .distinct()
                      .map( darwinReference::getToc )
                      .filter( Objects::nonNull )
                      .collect( JsonUtils.collectJsonObject( Toc::getToc, Toc::getName ) )
                );

        return ob.build();
    }

    @Override
    public void loadReference()
            throws IOException
    {
        darwinReference.loadReference();
    }

    @Override
    public void loadTimeTable()
            throws IOException
    {
        darwinLive.loadTimeTable();
    }
}
