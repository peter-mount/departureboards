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

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import uk.trainwatch.rabbitmq.Rabbit;

/**
 * Handles a live PushPort feed into {@link DarwinLive} to keep the train details up to date
 *
 * @author peter
 */
@ApplicationScoped
public class DarwinPushPort
{

    private static final Logger LOG = Logger.getGlobal();

    @Inject
    private DarwinLive darwinLive;

    @Inject
    private Rabbit rabbit;

    private XMLInputFactory inputFactory;

    @PostConstruct
    void start()
    {
        inputFactory = XMLInputFactory.newInstance();
        rabbit.queueDurableConsumer( "db.nre", "nre.push", ByteArrayInputStream::new, this::parseXML );
    }

    private static final String NS = "http://www.thalesgroup.com/rtti/PushPort/v12";
    private static final String NS3 = "http://www.thalesgroup.com/rtti/PushPort/Forecasts/v2";

    private void parseXML( InputStream is )
    {
        try {
            String ns = null;
            String ts;
            String rid = null;
            String tpl = null;
            Journey journey = null;
            List<Point> schedule = null;

            Map<String, Point> locations = new HashMap<>();
            Point location = null;
            boolean plat = false;
            Association assoc = null;

            XMLStreamReader r = inputFactory.createXMLStreamReader( is );
            while( r.hasNext() ) {
                switch( r.next() ) {
                    case XMLStreamReader.START_ELEMENT:
                        ns = r.getName().getPrefix();
                        switch( r.getName().getLocalPart() ) {
                            case "Pport":
                                ts = r.getAttributeValue( ns, "ts" );
                                break;

                            case "uR":
                                break;

                            case "Schedule":
                                rid = r.getAttributeValue( ns, "rid" );
                                journey = darwinLive.getJourney( rid, r.getAttributeValue( ns, "ssd" ), r.getAttributeValue( ns, "uid" ) );
                                journey.setToc( r.getAttributeValue( ns, "toc" ) );
                                journey.setTrainId( r.getAttributeValue( ns, "trainId" ) );
                                schedule = new ArrayList<>();
                                break;

                            case "association":
                                ns = null;
                                assoc = new Association( r.getAttributeValue( ns, "category" ), r.getAttributeValue( ns, "tiploc" ) );
                                break;

                            case "main":
                                ns = null;
                                if( assoc != null ) {
                                    assoc.setMain( Point.getTime( r, ns, "pta" ),
                                                   Point.getTime( r, ns, "wta" ),
                                                   r.getAttributeValue( ns, "rid" ) );
                                }
                                break;

                            case "assoc":
                                ns = null;
                                if( assoc != null ) {
                                    assoc.setAssoc( Point.getTime( r, ns, "ptd" ),
                                                    Point.getTime( r, ns, "wtd" ),
                                                    r.getAttributeValue( ns, "rid" ) );
                                }
                                break;

                            case "OPOR":
                            case "OR":
                            case "IP":
                            case "PP":
                            case "DT":
                            case "OPDT":
                                if( schedule != null ) {
                                    schedule.add( new Point( journey, r, ns ) );
                                }
                                break;

                            case "TS":
                                rid = r.getAttributeValue( ns, "rid" );
                                journey = darwinLive.getJourney( rid, r.getAttributeValue( ns, "ssd" ), r.getAttributeValue( ns, "uid" ) );
                                // Note: This will break for circular routes
                                locations = journey.getCallingPoints()
                                        .stream()
                                        .collect( Collectors.toMap( Point::getTpl, Function.identity(), ( a, b ) -> a, () -> new HashMap<>() ) );
                                break;

                            /*
                                <ns3:Location ptd="20:09" tpl="CHSSS" wtd="20:09">
                                <ns3:dep et="20:09" src="Darwin"/>
                                <ns3:plat cisPlatsup="true" platsup="true">1</ns3:plat>
                                </ns3:Location>
                             */
                            case "Location":
                                ns = null;
                                tpl = r.getAttributeValue( ns, "tpl" );
                                if( tpl != null ) {
                                    location = locations.get( tpl );
                                    if( location == null ) {
                                        location = new Point( journey, r, ns );
                                        locations.put( tpl, location );
                                    }
                                    location.setPta( Point.getTime( r, ns, "pta" ) )
                                            .setPtd( Point.getTime( r, ns, "ptd" ) )
                                            .setWta( Point.getTime( r, ns, "wta" ) )
                                            .setWtd( Point.getTime( r, ns, "wtd" ) )
                                            .setWtp( Point.getTime( r, ns, "wtp" ) )
                                            .setLastUpdated();
                                }
                                else {
                                    debug( r, ns );
                                }
                                break;

                            case "dep":
                                ns = null;
                                if( location != null ) {
                                    location.setEtd( Point.getTime( r, ns, "et" ) )
                                            .setAta( Point.getTime( r, ns, "at" ) )
                                            .setDelayed( Boolean.valueOf( r.getAttributeValue( ns, "delayed" ) ) );
                                }
                                break;

                            case "arr":
                                ns = null;
                                if( location != null ) {
                                    location.setEta( Point.getTime( r, ns, "et" ) )
                                            .setAtd( Point.getTime( r, ns, "at" ) )
                                            .setDelayed( Boolean.valueOf( r.getAttributeValue( ns, "delayed" ) ) );
                                }
                                break;

                            case "pass":
                                ns = null;
                                if( location != null ) {
                                    location.setEtp( Point.getTime( r, ns, "et" ) )
                                            .setAtp( Point.getTime( r, ns, "at" ) )
                                            .setDelayed( Boolean.valueOf( r.getAttributeValue( ns, "delayed" ) ) );
                                }
                                break;

                            /*
                                <ns3:plat cisPlatsup="true" conf="true" platsrc="A" platsup="true">2</ns3:plat>
                             */
                            case "plat":
                                ns = null;
                                if( location != null ) {
                                    location.setPlatsup( Boolean.valueOf( r.getAttributeValue( ns, "cisPlatsup" ) )
                                                         || Boolean.valueOf( r.getAttributeValue( ns, "platsup" ) ) );
                                    plat = true;
                                }
                                break;

                            default:
                                break;
                        }

                    case XMLStreamReader.CHARACTERS:
                        if( plat && location != null ) {
                            location.setPlat( r.getText() );
                        }
                        break;

                    case XMLStreamReader.END_ELEMENT:
                        switch( r.getName().getLocalPart() ) {
                            case "Schedule":
                                darwinLive.update( journey, new ArrayList<>( schedule ) );
                                journey = null;
                                schedule = null;
                                break;

                            case "TS":
                                darwinLive.update( journey, new ArrayList<>( locations.values() ) );
                                location = null;
                                journey = null;
                                schedule = null;
                                break;

                            case "plat":
                                plat = false;
                                break;

                            case "association":
                                if( assoc != null ) {
                                    Association a = assoc;
                                    darwinLive.forJourney( assoc.getMainRid(), j -> j.associate( a ) );
                                    darwinLive.forJourney( assoc.getAssocRid(), j -> j.associate( a ) );
                                    assoc = null;
                                }
                                break;

                            default:
                                break;
                        }

                    default:
                        break;
                }
            }
        }
        catch( XMLStreamException ex ) {
            Logger.getLogger( DarwinPushPort.class.getName() ).log( Level.SEVERE, null, ex );
        }
    }

    private static void debug( XMLStreamReader r, String ns )
    {
        String tns = r.getName().getNamespaceURI() + ":" + r.getName().getPrefix() + ":" + r.getName().getLocalPart();
        int ac = r.getAttributeCount();
        for( int ai = 0; ai < ac; ai++ ) {
            LOG.log( Level.INFO, ns + " " + tns + " " + ai + "/" + ac + " " + r.getAttributeNamespace( ai ) + ":" + r.getAttributeLocalName( ai ) );
        }
    }
}
