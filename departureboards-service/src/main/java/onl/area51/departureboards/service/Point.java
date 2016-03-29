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

    private LocalTime eta;
    private LocalTime etd;
    private LocalTime etp;
    private boolean delayed;
    private boolean arrived;
    private boolean platsup;

    private LocalTime lastUpdated;

    private Point next;
    private Point prev;

    @SuppressWarnings("LeakingThisInConstructor")
    public Point( Journey journey, XMLStreamReader r )
    {
        this.journey = journey;

        this.type = Type.valueOf( r.getLocalName() );
        this.tpl = r.getAttributeValue( TTNS, "tpl" );
        this.act = r.getAttributeValue( TTNS, "act" );
        this.plat = r.getAttributeValue( TTNS, "plat" );

        this.pta = Point.getTime( r, "pta" );
        this.wta = Point.getTime( r, "wta" );
        this.ptd = Point.getTime( r, "ptd" );
        this.wtd = Point.getTime( r, "wtd" );
        this.wtp = Point.getTime( r, "wtp" );

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

        return b.add( "term", type.isTerm() )
                .add( "pass", type.isPass() )
                .add( "platsup", isPlatsup() )
                .add( "arrived", isArrived() )
                .add( "delayed", isDelayed() )
                .add( "ontime", isOntime() );
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
            return wtd;
        }
        if( wta != null ) {
            return wta;
        }
        return wtp;
    }

    @Override
    public int compareTo( Point o )
    {
        return getTime().compareTo( o.getTime() );
    }

    private static LocalTime getTime( XMLStreamReader r, String n )
    {
        String s = r.getAttributeValue( TTNS, n );
        if( s == null ) {
            return null;
        }
        return LocalTime.parse( s );
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

    public String getTpl()
    {
        return tpl;
    }

    public String getAct()
    {
        return act;
    }

    public LocalTime getPta()
    {
        return pta;
    }

    public LocalTime getWta()
    {
        return wta;
    }

    public LocalTime getPtd()
    {
        return ptd;
    }

    public LocalTime getWtd()
    {
        return wtd;
    }

    public LocalTime getWtp()
    {
        return wtp;
    }

    public LocalTime getLastUpdated()
    {
        return lastUpdated;
    }

    public LocalTime getEta()
    {
        return eta;
    }

    public LocalTime getEtd()
    {
        return etd;
    }

    public LocalTime getEtp()
    {
        return etp;
    }

    public boolean isDelayed()
    {
        return delayed;
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

    public boolean isArrived()
    {
        return arrived;
    }

    public boolean isPlatsup()
    {
        return platsup;
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
