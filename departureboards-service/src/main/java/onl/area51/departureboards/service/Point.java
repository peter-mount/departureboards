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

import java.time.Duration;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.xml.stream.XMLStreamReader;
import uk.trainwatch.util.TimeUtils;

/**
 *
 * @author peter
 */
public class Point
        implements Comparable<Point>
{

    private static final String TTNS = "";//"http://www.thalesgroup.com/rtti/XmlTimetable/v8";

    private final int hashCode;
    private final Type type;
    private final Journey journey;
    private final String tpl;
    private int seq;

    private String act;
    private LocalTime pta;
    private LocalTime wta;
    private LocalTime ptd;
    private LocalTime wtd;
    private LocalTime wtp;
    private String plat;

    private LocalTime eta, ata;
    private LocalTime etd, atd;
    private LocalTime etp, atp;
    private boolean delayed;
    private boolean platsup;

    private LocalTime lastUpdated;

    private Point next;
    private Point prev;

    @SuppressWarnings("LeakingThisInConstructor")
    public Point( Journey journey, XMLStreamReader r )
    {
        this( journey, r, TTNS );
    }

    @SuppressWarnings("LeakingThisInConstructor")
    public Point( Journey journey, XMLStreamReader r, String ns )
    {
        this.journey = journey;

        this.type = Type.valueOf( r.getLocalName() );
        this.tpl = r.getAttributeValue( ns, "tpl" );
        this.act = r.getAttributeValue( ns, "act" );

        // Platform will be here if from timetable not from pushPort
        this.plat = r.getAttributeValue( ns, "plat" );

        this.pta = Point.getTime( r, ns, "pta" );
        this.wta = Point.getTime( r, ns, "wta" );
        this.ptd = Point.getTime( r, ns, "ptd" );
        this.wtd = Point.getTime( r, ns, "wtd" );
        this.wtp = Point.getTime( r, ns, "wtp" );

        lastUpdated = LocalTime.now( TimeUtils.LONDON );

        journey.add( this );
        seq = journey.getCallingPoints().indexOf( this );
        hashCode = (67 * (67 * journey.hashCode()) + tpl.hashCode()) + journey.getCallingPoints().size();
    }

    public JsonObjectBuilder toJson()
    {
        JsonObjectBuilder b = toJsonImpl()
                .add( "origin", journey.getOrigin().toJsonImpl() )
                .add( "dest", journey.getDestination().toJsonImpl() );
        add( b, "toc", journey.getToc() );
        add( b, "headcode", journey.getTrainId() );
        add( b, "cat", journey.getTrainCat() );
        return b;
    }

    public JsonObjectBuilder toJsonImpl()
    {
        JsonObjectBuilder b = Json.createObjectBuilder();
        add( b, "tpl", tpl );
        add( b, "plat", plat );
        add( b, "time", getTime() );
        add( b, "timetable", getTimetableTime() );
        add( b, "act", act );
        add( b, "pta", pta );
        add( b, "ptd", ptd );
        add( b, "wta", wta );
        add( b, "wtd", wtd );
        add( b, "wtp", wtp );
        add( b, "ata", ata );
        add( b, "atd", atd );
        add( b, "atp", atp );
        add( b, "eta", eta );
        add( b, "etd", etd );
        add( b, "etp", etp );
        add( b, "updated", lastUpdated );

        return b.add( "term", type.isTerm() )
                .add( "pass", type.isPass() )
                .add( "platsup", isPlatsup() )
                .add( "arrived", isArrived() )
                .add( "delayed", isDelayed() )
                .add( "ontime", isOntime() )
                // timetable or realTime
                .add( "tt", isTimeTable() );
    }

    /**
     * Is this from the timetable or from an update
     *
     * @return
     */
    public boolean isTimeTable()
    {
        return !isForecast();
    }

    public boolean isForecast()
    {
        return eta != null || ata != null || etd != null || atd != null || etp != null | atd != null;
    }

    public boolean isWithin( LocalTime s, LocalTime e )
    {
        LocalTime t = getTime();
        if( s.isBefore( e ) ) {
            // s<e so normal time
            return t.isAfter( s ) && t.isBefore( e );
        }
        else {
            // s>e then we have midnight to account for
            return t.isAfter( s ) || t.isBefore( e );
        }
    }

    public JsonObjectBuilder toCPJson()
    {
        JsonObjectBuilder b = Json.createObjectBuilder();
        add( b, "tpl", tpl );
        add( b, "time", getTime() );
        return b;
    }

    private static void add( JsonObjectBuilder b, String n, String s )
    {
        if( s == null ) {
            b.addNull( n );
        }
        else {
            b.add( n, s );
        }
    }

    private static void add( JsonObjectBuilder b, String n, LocalTime t )
    {
        if( t == null ) {
            b.addNull( n );
        }
        else {
            b.add( n, t.toString() );
        }
    }

    /**
     * This entries current time. This takes the first non-null value of:
     * ptd, pta, wtd, wta, wtp
     *
     * @return
     */
    public LocalTime getTime()
    {
        if( etd != null ) {
            return etd;
        }
        if( eta != null ) {
            return eta;
        }
        if( etp != null ) {
            return etp;
        }
        return getTimetableTime();
    }

    public LocalTime getTimetableTime()
    {
        if( ptd != null ) {
            return ptd;
        }
        if( pta != null ) {
            return pta;
        }
        if( wtd != null ) {
            return wtd.truncatedTo( ChronoUnit.MINUTES );
        }
        if( wta != null ) {
            return wta.truncatedTo( ChronoUnit.MINUTES );
        }
        return wtp;
    }

    @Override
    public int compareTo( Point o )
    {
        return getTime().compareTo( o.getTime() );
    }

    public static LocalTime getTime( XMLStreamReader r, String ns, String n )
    {
        String s = r.getAttributeValue( ns, n );
        if( s == null ) {
            return null;
        }
        return LocalTime.parse( s );
    }

    public String getTpl()
    {
        return tpl;
    }

    public Point getNext()
    {
        return next;
    }

    public Point getPrev()
    {
        return prev;
    }

    void setNext( Point next )
    {
        this.next = next;
    }

    void setPrev( Point prev )
    {
        this.prev = prev;
    }

    public int getSeq()
    {
        return seq;
    }

    public String getPlat()
    {
        return plat;
    }

    public Point setPlat( String plat )
    {
        this.plat = plat;
        return this;
    }

    @Override
    public int hashCode()
    {
        return hashCode;
    }

    @Override
    public boolean equals( Object obj )
    {
        if( this == obj ) {
            return true;
        }
        if( obj == null || getClass() != obj.getClass() ) {
            return false;
        }
        final Point other = (Point) obj;
        return Objects.equals( this.journey, other.journey )
               && Objects.equals( this.tpl, other.tpl )
               && Objects.equals( this.prev, other.prev )
               && Objects.equals( this.next, other.next );
    }

    public Type getType()
    {
        return type;
    }

    public Journey getJourney()
    {
        return journey;
    }

    public List<Point> getCallingPoints()
    {
        List<Point> cp = journey.getCallingPoints();
        int s = cp.size();
        if( (seq + 1) < s ) {
            return cp.subList( seq + 1, s );
        }
        else {
            return Collections.emptyList();
        }
    }

    public String getRid()
    {
        return journey.getRid();
    }

    public boolean isOntime()
    {
        LocalTime a = getTime();
        LocalTime b = getTimetableTime();
        Duration d;
        if( a.isAfter( b ) ) {
            d = Duration.between( b, a );
        }
        else {
            d = Duration.between( a, b );
        }
        return d.getSeconds() <= 60;
    }

    public String getAct()
    {
        return act;
    }

    public Point setAct( String act )
    {
        this.act = act;
        return this;
    }

    public LocalTime getPta()
    {
        return pta;
    }

    public Point setPta( LocalTime pta )
    {
        this.pta = pta;
        return this;
    }

    public LocalTime getWta()
    {
        return wta;
    }

    public Point setWta( LocalTime wta )
    {
        this.wta = wta;
        return this;
    }

    public LocalTime getPtd()
    {
        return ptd;
    }

    public Point setPtd( LocalTime ptd )
    {
        this.ptd = ptd;
        return this;
    }

    public LocalTime getWtd()
    {
        return wtd;
    }

    public Point setWtd( LocalTime wtd )
    {
        this.wtd = wtd;
        return this;
    }

    public LocalTime getWtp()
    {
        return wtp;
    }

    public Point setWtp( LocalTime wtp )
    {
        this.wtp = wtp;
        return this;
    }

    public LocalTime getEta()
    {
        return eta;
    }

    public Point setEta( LocalTime eta )
    {
        this.eta = eta;
        return this;
    }

    public LocalTime getEtd()
    {
        return etd;
    }

    public Point setEtd( LocalTime etd )
    {
        this.etd = etd;
        return this;
    }

    public LocalTime getEtp()
    {
        return etp;
    }

    public Point setEtp( LocalTime etp )
    {
        this.etp = etp;
        return this;
    }

    public boolean isDelayed()
    {
        return delayed;
    }

    public Point setDelayed( boolean delayed )
    {
        this.delayed = delayed;
        return this;
    }

    public boolean isArrived()
    {
        return atd!=null || ata!=null||atp!=null;
    }

    public boolean isPlatsup()
    {
        return platsup;
    }

    public Point setPlatsup( boolean platsup )
    {
        this.platsup = platsup;
        return this;
    }

    public LocalTime getLastUpdated()
    {
        return lastUpdated;
    }

    public Point setLastUpdated()
    {
        this.lastUpdated = LocalTime.now( TimeUtils.LONDON );
        return this;
    }

    public LocalTime getAta()
    {
        return ata;
    }

    public Point setAta( LocalTime ata )
    {
        this.ata = ata;
        return this;
    }

    public LocalTime getAtd()
    {
        return atd;
    }

    public Point setAtd( LocalTime atd )
    {
        this.atd = atd;
        return this;
    }

    public LocalTime getAtp()
    {
        return atp;
    }

    public Point setAtp( LocalTime atp )
    {
        this.atp = atp;
        return this;
    }

    public static enum Type
    {
        OR( true, false, true, false ),
        OPOR( true, false, true, false ),
        PP( false, false, false, true ),
        IP( false, false, true, false ),
        DT( false, true, true, false ),
        OPDT( false, true, true, false );

        private final boolean origin;
        private final boolean term;
        private final boolean stop;
        private final boolean pass;

        private Type( boolean origin, boolean term, boolean stop, boolean pass )
        {
            this.origin = origin;
            this.term = term;
            this.stop = stop;
            this.pass = pass;
        }

        public boolean isOrigin()
        {
            return origin;
        }

        public boolean isPass()
        {
            return pass;
        }

        public boolean isStop()
        {
            return stop;
        }

        public boolean isTerm()
        {
            return term;
        }

    }

}
