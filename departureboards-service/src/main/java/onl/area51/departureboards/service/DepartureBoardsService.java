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
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import onl.area51.departureboards.api.DepartureBoards;
import uk.trainwatch.nre.darwin.reference.DarwinReferenceManager;
import uk.trainwatch.nrod.location.TrainLocation;

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

        TrainLocation loc = darwinReferenceManager.getLocationRefFromCrs( crs.toUpperCase() );
        if( loc == null ) {
            return null;
        }

        JsonObjectBuilder ob = Json.createObjectBuilder()
                .add( "crs", loc.getCrs() )
                .add( "location", loc.getLocation() )
                .add( "nr", loc.isMainline() )
                .add( "dlr", loc.isDlr() )
                .add( "tfl", loc.isTfl() );

        JsonArrayBuilder ab = Json.createArrayBuilder();

        Set<Point> set = stations.get( loc.getTiploc() );
        if( set != null ) {
            LocalTime now = LocalTime.now();
            LocalTime st = now.minus( 5, ChronoUnit.MINUTES );
            LocalTime et = now.plus( 1, ChronoUnit.HOURS );

            set.stream()
                    .filter( p -> p.getTime().isAfter( st ) )
                    .filter( p -> p.getTime().isBefore( et ) )
                    .map( Point::toJson )
                    .forEach( ab::add );
        }

        return ob.add( "departures", ab )
                .build();
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

        LocalTime now = LocalTime.now();

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
                            if( (jcount % 5000) == 0 ) {
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
