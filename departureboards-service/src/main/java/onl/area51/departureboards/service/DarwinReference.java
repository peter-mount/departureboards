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

import onl.area51.departureboards.api.LocationRef;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import onl.area51.departureboards.api.Reason;
import onl.area51.departureboards.api.Toc;
import onl.area51.departureboards.api.Via;
import uk.trainwatch.nrod.location.TrainLocation;
import uk.trainwatch.nrod.location.TrainLocationFactory;
import uk.trainwatch.util.MapBuilder;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class DarwinReference
{

    private static final String NS = "http://www.thalesgroup.com/rtti/XmlRefData/v3";

    private static final Logger LOG = Logger.getGlobal();

    @Inject
    private TrainLocationFactory trainLocationFactory;

    private FileSystem fs;

    private final Map<String, List<LocationRef>> crs = new ConcurrentHashMap<>();
    private final Map<String, LocationRef> tiploc = new ConcurrentHashMap<>();
    private final Map<String, Toc> tocs = new ConcurrentHashMap<>();
    private final Map<Integer, Reason> lateReason = new ConcurrentHashMap<>();
    private final Map<Integer, Reason> cancReason = new ConcurrentHashMap<>();
    private final Map<Via, Via> vias = new ConcurrentHashMap<>();

    public List<LocationRef> getLocationsFromCrs( String crs )
    {
        List<LocationRef> l = crs == null ? null : this.crs.get( crs.toUpperCase().trim() );
        return l == null ? Collections.emptyList() : l;
    }

    public LocationRef getLocationFromCrs( String crs )
    {
        List<LocationRef> l = getLocationsFromCrs( crs );
        return l == null || l.isEmpty() ? null : l.get( 0 );
    }

    public LocationRef getLocationFromTiploc( String tiploc )
    {
        return tiploc == null ? null : this.tiploc.get( tiploc.toUpperCase().trim() );
    }

    /**
     * Like {@link #getLocationFromTiploc(java.lang.String)} except this will also try to resolve
     * a tiploc by looking at the NR timetable data if it's not in darwin.
     * @param tiploc
     * @return 
     */
    public LocationRef resovleTiploc( String tiploc )
    {
        if( tiploc == null ) {
            return null;
        }
        return this.tiploc.computeIfAbsent( tiploc.toUpperCase().trim(),
                                            tpl -> {
                                                // See if NR has it in CIF file
                                                TrainLocation tl = trainLocationFactory.getTrainLocationByTiploc( tpl );
                                                if( tl == null ) {
                                                    // No then default to just tpl
                                                    return new LocationRef( tpl, "", "{" + tpl + "}", null );
                                                }
                                                return new LocationRef( tl.getLocation(), tl.getCrs(), tl.getTiploc(), null );
                                            } );
    }

    public Toc getToc( String toc )
    {
        return toc == null ? null : tocs.get( toc.toUpperCase() );
    }

    public Reason getLateReason( int code )
    {
        return lateReason.get( code );
    }

    public Reason getCancReason( int code )
    {
        return cancReason.get( code );
    }

    public Via getVia( Via via )
    {
        return vias.get( via );
    }

    public void loadReference()
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

        loadReference( fs.getPath( "reference.xml.gz" ) );
    }

    private void loadReference( Path path )
            throws IOException
    {
        LOG.log( Level.INFO, () -> "Loading reference " + path );
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

    private List<LocationRef> getCrs( String crs )
    {
        return this.crs.computeIfAbsent( crs.toUpperCase(), c -> new ArrayList<>() );
    }

    private void load( InputStream is )
            throws IOException,
                   XMLStreamException
    {
        Map<Integer, Reason> reasonMap = null;

        XMLInputFactory inputFactory = XMLInputFactory.newInstance();
        XMLStreamReader r = inputFactory.createXMLStreamReader( is );
        while( r.hasNext() ) {
            switch( r.next() ) {
                case XMLStreamReader.START_ELEMENT:
                    switch( r.getName().getLocalPart() ) {
                        case "PportTimetableRef":
                            LOG.log( Level.INFO, () -> "Processing reference " + r.getAttributeValue( "", "timetableId" ) );
                            break;

                        case "LocationRef": {
                            LocationRef loc = new LocationRef( r.getAttributeValue( "", "locname" ),
                                                               r.getAttributeValue( "", "crs" ),
                                                               r.getAttributeValue( "", "tpl" ),
                                                               r.getAttributeValue( "", "toc" ) );
                            if( !loc.getTiploc().equals( loc.getLocation() ) ) {
                                LocationRef orig = tiploc.put( loc.getTiploc(), loc );
                                if( orig != null && orig.getCrs() != null ) {
                                    getCrs( orig.getCrs() ).remove( orig );
                                }
                                if( loc.getCrs() != null ) {
                                    getCrs( loc.getCrs() ).add( loc );
                                }
                            }
                        }
                        break;

                        case "TocRef": {
                            Toc toc = new Toc( r.getAttributeValue( "", "toc" ),
                                               r.getAttributeValue( "", "tocname" ),
                                               r.getAttributeValue( "", "url" ) );
                            tocs.put( toc.getToc(), toc );
                        }
                        break;

                        case "LateRunningReasons":
                            reasonMap = lateReason;
                            break;

                        case "CancellationReasons":
                            reasonMap = cancReason;
                            break;

                        case "Reason": {
                            Reason rt = new Reason( Integer.parseInt( r.getAttributeValue( "", "code" ) ),
                                                    r.getAttributeValue( "", "reasonText" ) );
                            reasonMap.put( rt.getCode(), rt );
                        }
                        break;

                        case "Via": {
                            Via via = new Via( r.getAttributeValue( "", "at" ),
                                               r.getAttributeValue( "", "dest" ),
                                               r.getAttributeValue( "", "loc1" ),
                                               r.getAttributeValue( "", "loc2" ),
                                               r.getAttributeValue( "", "viatext" ) );
                            vias.put( via, via );
                        }
                        break;

                        // Unused
                        case "CISSource":
                        // <CISSource code="AM01" name="Southern Metropolitan" />

                        default:
                            break;
                    }
                    break;

                case XMLStreamReader.END_ELEMENT:
                    break;

                default:
                    break;
            }
        }
    }
}
