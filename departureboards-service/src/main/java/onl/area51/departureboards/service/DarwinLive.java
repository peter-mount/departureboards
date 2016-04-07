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
import java.net.URI;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import uk.trainwatch.util.MapBuilder;
import uk.trainwatch.util.TimeUtils;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class DarwinLive
{

    /**
     * Debugging: Normally this is null, set to a time to force when the timetable starts
     */
    private static final LocalTime FORCE_TIME = null;//LocalTime.of( 16, 30 );

    private static final Logger LOG = Logger.getGlobal();

    private static final LocalTime DARWIN_MIDNIGHT = LocalTime.of( 2, 0 );

    @Inject
    private DarwinReference darwinReference;

    private FileSystem fs;

    private final Map<String, Journey> journeys = new ConcurrentHashMap<>();
    private final Map<String, Set<Point>> stations = new ConcurrentHashMap<>();

    public Journey getJourney( String rid )
    {
        return journeys.get( rid );
    }

    public void forJourney( String rid, Consumer<Journey> c )
    {
        Journey j = getJourney( rid );
        if( j != null ) {
            c.accept( j );
        }
    }

    public Journey getJourney( String rid, String ssd, String uid )
    {
        return journeys.computeIfAbsent( rid, r -> new Journey( rid, uid, ssd ) );
    }

    public void removeJourney( String rid )
    {
        journeys.computeIfPresent( rid, ( r, j ) -> {
                               j.getCallingPoints().forEach( p -> getStation( p ).remove( p ) );
                               return null;
                           } );
    }

    public Set<Point> getDeparturesByCrs( String crs )
    {
        return darwinReference.getLocationsFromCrs( crs )
                .stream()
                .map( l -> stations.get( l.getTiploc() ) )
                .filter( Objects::nonNull )
                .flatMap( Collection::stream )
                .collect( Collectors.toCollection( () -> new TreeSet<>( ( a, b ) -> a.getTime().compareTo( b.getTime() ) ) ) );
    }

    @PostConstruct
    public void loadTimeTable()
            throws IOException
    {
        if( fs == null ) {
            fs = FileSystems.newFileSystem( URI.create( "cache://ref" ),
                                            MapBuilder.<String, Object>builder()
                                            .add( "fileSystemType", "cache" )
                                            .add( "fileSystemWrapper", "http" )
                                            .add( "remoteUrl", "http://fileserver/ref" )
                                            .build() );
        }

        loadTimeTable( fs.getPath( "timetable.xml.gz" ) );
    }

    private void loadTimeTable( Path path )
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

    private void load( InputStream is )
            throws IOException,
                   XMLStreamException
    {
        Journey journey = null;
        Association assoc = null;
        int seq = 0;
        int jcount = 0;
        int scount = 0;

        LocalTime now = FORCE_TIME == null ? LocalTime.now( TimeUtils.LONDON ) : FORCE_TIME;

        XMLInputFactory inputFactory = XMLInputFactory.newInstance();
        XMLStreamReader r = inputFactory.createXMLStreamReader( is );
        while( r.hasNext() ) {
            switch( r.next() ) {
                case XMLStreamReader.START_ELEMENT:
                    switch( r.getName().getLocalPart() ) {
                        case "PportTimetable":
                            LOG.log( Level.INFO, () -> "Processing timetable " + r.getAttributeValue( null, "timetableID" ) );
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

                        case "Association":
                            assoc = new Association( r.getAttributeValue( null, "category" ), r.getAttributeValue( null, "tiploc" ) );
                            break;

                        case "main":
                            if( assoc != null ) {
                                assoc.setMain( Point.getTime( r, null, "pta" ),
                                               Point.getTime( r, null, "wta" ),
                                               r.getAttributeValue( null, "rid" ) );
                            }
                            break;

                        case "assoc":
                            if( assoc != null ) {
                                assoc.setAssoc( Point.getTime( r, null, "ptd" ),
                                                Point.getTime( r, null, "wtd" ),
                                                r.getAttributeValue( null, "rid" ) );
                            }
                            break;

                        default:
                            break;
                    }
                    break;

                case XMLStreamReader.END_ELEMENT:
                    switch( r.getName().getLocalPart() ) {
                        case "Journey":
                            if( journey != null ) {
                                Objects.requireNonNull( journey, "No journey" );

                                LocalTime jt = journey.getDestination().getTime();
                                if( jt.isBefore( now ) && jt.isAfter( DARWIN_MIDNIGHT ) ) {
                                    scount++;
                                }
                                else {
                                    journeys.put( journey.getRid(), journey );
                                    journey.getCallingPoints()
                                            .forEach( p -> {
                                                LocalTime pt = p.getTime();
                                                if( pt.isAfter( now ) || pt.isBefore( DARWIN_MIDNIGHT ) ) {
                                                    getStation( p ).add( p );
                                                }
                                            } );
                                }

                                journey = null;
                                if( (jcount % 20000) == 0 ) {
                                    LOG.log( Level.INFO, "Processed {0} journeys", jcount );
                                }
                            }
                            break;

                        case "Association":
                            if( assoc != null && assoc.isValid() ) {
                                Association a = assoc;
                                forJourney( assoc.getMainRid(), j -> j.associate( a ) );
                                forJourney( assoc.getAssocRid(), j -> j.associate( a ) );
                            }
                            assoc = null;
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

    private Set<Point> getStation( Point p )
    {
        return stations.computeIfAbsent( p.getTpl(), tpl -> new TreeSet<>() );
    }

    public void update( Journey newJourney, List<Point> newCp )
    {
        // This effectively locks the Journey
        journeys.compute( newJourney.getRid(),
                          ( rid, existing ) -> {
                              // Remove any existing points not in the new set
                              Set<Point> n = new HashSet<>( existing.getCallingPoints() );
                              n.removeAll( newCp );
                              n.forEach( p -> getStation( p ).remove( p ) );
                              // Now just add them all, this will replace existing entries as needed
                              newCp.forEach( p -> getStation( p ).add( p ) );

                              // Update Journey to the new points and use the new reference incase it's different
                              // Sort as will be out of sync
                              Collections.sort( newCp );
                              newJourney.setCallingPoints( newCp );
                              return newJourney;
                          } );
    }

}
