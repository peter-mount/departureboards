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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import onl.area51.departureboards.api.DepartureBoards;
import uk.trainwatch.nre.darwin.reference.DarwinReferenceManager;
import uk.trainwatch.nrod.location.TrainLocation;
import uk.trainwatch.util.Functions;
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

    private static final Logger LOG = Logger.getGlobal();

    private final Map<String, Journey> journeys = new ConcurrentHashMap<>();
    private final Map<String, Set<Point>> stations = new ConcurrentHashMap<>();

    @Inject
    private DarwinReferenceManager darwinReferenceManager;

    @Override
    public JsonObject departureBoards( String crs )
            throws IOException
    {
        if( crs == null || crs.length() != 3 ) {
            return null;
        }

        // A CRS can map to multiple locations (tiplocs)
        List<TrainLocation> locs = darwinReferenceManager.getLocationRefsFromCrs( crs.toUpperCase() );
        if( locs == null || locs.isEmpty() ) {
            return null;
        }

        // Use first location for the main fields
        TrainLocation loc = locs.get( 0 );

        LocalTime now = LocalTime.now( TimeUtils.LONDON );
        LocalTime st = now.minus( 1, ChronoUnit.MINUTES );
        LocalTime et = now.plus( 1, ChronoUnit.HOURS );

        // Calling points for each tiploc at this station
        Set<Point> set = locs.stream()
                .map( l -> stations.get( l.getTiploc() ) )
                .filter( Objects::nonNull )
                .flatMap( Collection::stream )
                .collect( Collectors.toCollection( () -> new TreeSet<>( ( a, b ) -> a.getTime().compareTo( b.getTime() ) ) ) );

        JsonObjectBuilder ob = Json.createObjectBuilder()
                .add( "crs", loc.getCrs() )
                .add( "location", loc.getLocation() )
                .add( "nr", loc.isMainline() )
                // The departures
                .add( "departures",
                      set.stream()
                      .filter( p -> p.isWithin( st, et ) )
                      .map( p -> {
                          return p.toJson()
                                  // Only stopping calling points
                                  .add( "calling",
                                        p.getCallingPoints()
                                        .stream()
                                        .filter( cp -> cp.getType().isStop() )
                                        .map( Point::toCPJson )
                                        .collect( JsonUtils.collectJsonArray() ) );
                      } )
                      .collect( JsonUtils.collectJsonArray() )
                )
                // Add tiploc xref table
                .add( "locref",
                      set.stream()
                      // Limit to just stops and within range
                      .filter( p -> p.getType().isStop() && p.isWithin( st, et ) )
                      // Expand to point, origin, destination, lastReport etc
                      .flatMap( p -> Stream.concat( Stream.of( p,
                                                               // lastReport also here
                                                               p.getJourney().getOrigin(),
                                                               p.getJourney().getDestination() ),
                                                    // Also calling points in range
                                                    p.getCallingPoints()
                                                    .stream()
                                                    .filter( cp -> cp.isWithin( st, et ) )
                      ) )
                      // Incase origin, dest, lastreport are null
                      .filter( Objects::nonNull )
                      // Now form a unique stream of tiplocs
                      .map( Point::getTpl )
                      .sorted()
                      .distinct()
                      // Map to TrainLocation (default to tpl if new/unknown)
                      .map( Functions.applyWithDefault( darwinReferenceManager::getLocationRefFromTiploc, tpl -> new TrainLocation( tpl, "", tpl ) ) )
                      // Form the JsonObject
                      .collect( JsonUtils.collectJsonObject( TrainLocation::getTiploc,
                                                             l -> Json.createObjectBuilder()
                                                             .add( "crs", l.getCrs() )
                                                             .add( "loc", l.getLocation() )
                      ) )
                );

        return ob.build();
    }

    @Override
    public void loadTimeTable( Path path )
            throws IOException
    {
        LOG.log( Level.INFO, () -> "Loading timetable " + path );
        try( InputStream is = Files.newInputStream( path, StandardOpenOption.READ ) ) {
            String p = path.getName( path.getNameCount() - 1 ).toString();
            if( p.endsWith( ".gz" ) ) {
                try( GZIPInputStream gis = new GZIPInputStream( is ) ) {
                    load( gis );
                }
            }
            else {
                load( is );
            }
        }
        catch( XMLStreamException ex ) {
            LOG.log( Level.SEVERE, ex, () -> "Failed to load " + path );
            throw new IOException( ex );
        }
    }

    private static final String TTNS = "http://www.thalesgroup.com/rtti/XmlTimetable/v8";

    private void load( InputStream is )
            throws IOException,
                   XMLStreamException
    {
        Journey journey = null;
        int seq = 0;
        int jcount = 0;
        int scount = 0;

        LocalTime now = LocalTime.now( TimeUtils.LONDON );

        XMLInputFactory inputFactory = XMLInputFactory.newInstance();
        XMLStreamReader r = inputFactory.createXMLStreamReader( is );
        while( r.hasNext() ) {
            switch( r.next() ) {
                case XMLStreamReader.START_ELEMENT:
                    switch( r.getName().getLocalPart() ) {
                        case "PportTimetable":
                            LOG.log( Level.INFO, () -> "Processing timetable " + r.getAttributeValue( TTNS, "timetableId" ) );
                            break;

                        case "Journey":
                            journey = new Journey( r );
                            jcount++;
                            break;

                        case "OPOR":
                        case "OR":
                        case "IP":
                        case "PP":
                        case "DT":
                        case "OPDT":
                            if( journey == null ) {
                                throw new IllegalStateException( "Point outside of Journey" );
                            }
                            Point point = new Point( journey, r );
                            break;

                        default:
                            break;
                    }
                    break;

                case XMLStreamReader.END_ELEMENT:
                    switch( r.getName().getLocalPart() ) {
                        case "Journey":
                            Objects.requireNonNull( journey, "No journey" );

                            if( journey.getDestination().getTime().isBefore( now ) ) {
                                scount++;
                            }
                            else {
                                journeys.put( journey.getRid(), journey );
                                journey.getCallingPoints()
                                        .forEach( p -> {
                                            if( p.getTime().isAfter( now ) ) {
                                                stations.computeIfAbsent( p.getTpl(), tpl -> new TreeSet<>() )
                                                        .add( p );
                                            }
                                        } );
                            }

                            journey = null;
                            if( (jcount % 20000) == 0 ) {
                                LOG.log( Level.INFO, "Processed {0} journeys", jcount );
                            }
                            break;
                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }
        }

        LOG.log( Level.INFO, "Processed {0} journeys, removed {1}, active {2}", new Object[]{jcount, scount, journeys.size()} );
    }
}
