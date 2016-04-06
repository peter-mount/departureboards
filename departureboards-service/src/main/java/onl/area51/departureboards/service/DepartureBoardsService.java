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
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.logging.Level;
import java.util.logging.Logger;
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
    public JsonObject departureBoards( String crs, LocalTime time )
            throws IOException
    {
        if( crs == null || crs.length() != 3 ) {
            return null;
        }

        LocationRef loc = darwinReference.getLocationFromCrs( crs.toUpperCase() );
        if( loc == null ) {
            return null;
        }

        LocalTime now = time == null ? LocalTime.now( TimeUtils.LONDON ) : time;
        LocalTime st = now.minus( 1, ChronoUnit.MINUTES );
        LocalTime et = now.plus( 1, ChronoUnit.HOURS );
        Logger.getGlobal().log( Level.INFO, () -> "Time " + time + " Now " + now + " st=" + st + " et=" + et );

        Set<String> tpls = new HashSet<>();
        Set<String> tocs = new HashSet<>();

        UnaryOperator<Point> addPoint = p -> {
            if( p != null ) {
                tpls.add( p.getTpl() );
            }
            return p;
        };

        UnaryOperator<Journey> addJourney = j -> {
            if( j != null ) {
                addPoint.apply( j.getOrigin() );
                addPoint.apply( j.getDestination() );
                String t = j.getToc();
                if( t != null ) {
                    tocs.add( t );
                }
            }
            return j;
        };

        Set<Point> set = darwinLive.getDeparturesByCrs( crs );

        JsonObjectBuilder ob = Json.createObjectBuilder()
                .add( "crs", loc.getCrs() )
                .add( "location", loc.getLocation() )
                // The departures
                .add( "departures",
                      set.stream()
                      .filter( p -> p.isWithin( st, et ) && p.getType().isStop() )
                      .map( p -> {
                          tpls.add( p.getTpl() );
                          Journey j = addJourney.apply( p.getJourney() );
                          JsonObjectBuilder b = p.toJson( addPoint );

                          // Any splits
                          p.getJourney()
                                  .getAssociations()
                                  .stream()
                                  .filter( a -> "VV".equals( a.getCategory() ) )
                                  .map( a -> addJourney.apply( darwinLive.getJourney( a.getAssocRid() ) ) )
                                  .filter( Objects::nonNull )
                                  .map( Journey::getDestination )
                                  .filter( Objects::nonNull )
                                  // Filter out splits to ourselves, i.e. we are the split train
                                  .filter( d -> !j.getDestination().getTpl().equals( d.getTpl() ) )
                                  .map( d -> d.toJson( addPoint ) )
                                  .findAny()
                                  .ifPresent( b1 -> b.add( "split", b1 ) );
                          
                          return b;
                      } )
                      .collect( JsonUtils.collectJsonArray() )
                )
                // Add tiploc xref table
                .add( "locref", tpls.stream()
                      .map( darwinReference::resovleTiploc )
                      .collect( JsonUtils.collectJsonObject( LocationRef::getTiploc, LocationRef::toSmallJson ) )
                )
                .add( "opref", tocs.stream()
                      .map( darwinReference::getToc )
                      .filter( Objects::nonNull )
                      .collect( JsonUtils.collectJsonObject( Toc::getToc, Toc::getName ) )
                );

        return ob.build();
    }

}
