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

import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.xml.stream.XMLStreamReader;

/**
 *
 * @author peter
 */
public class Point
        implements Comparable<Point>
{

    private static final String TTNS = "";//"http://www.thalesgroup.com/rtti/XmlTimetable/v8";

    private final Type type;
    private final String rid;
    private final String tpl;
    private final String act;
    private final LocalTime pta;
    private final LocalTime wta;
    private final LocalTime ptd;
    private final LocalTime wtd;
    private final LocalTime wtp;
    private final String plat;
    private Point next;
    private Point prev;

    @SuppressWarnings("LeakingThisInConstructor")
    public Point( Journey j, XMLStreamReader r )
    {
        this.type = Type.valueOf( r.getLocalName() );
        this.rid = j.getRid();
        this.tpl = r.getAttributeValue( TTNS, "tpl" );
        this.act = r.getAttributeValue( TTNS, "act" );
        this.plat = r.getAttributeValue( TTNS, "plat" );

        this.pta = Point.getTime( r, "pta" );
        this.wta = Point.getTime( r, "wta" );
        this.ptd = Point.getTime( r, "ptd" );
        this.wtd = Point.getTime( r, "wtd" );
        this.wtp = Point.getTime( r, "wtp" );
        j.add( this );
    }

    public JsonObjectBuilder toJson()
    {
        JsonObjectBuilder b = Json.createObjectBuilder();
        add(b,"tpl",tpl);
        add(b,"plat",plat);
        add(b,"time",getTime());
        add(b,"act",act);
        add(b,"pta",pta);
        add(b,"ptd",ptd);
        add(b,"wta",wta);
        add(b,"wtd",wtd);
        add(b,"wtp",wtp);
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

    public String getPlat()
    {
        return plat;
    }

    @Override
    public int hashCode()
    {
        int hash = 3;
        hash = 67 * hash + Objects.hashCode( rid );
        hash = 67 * hash + Objects.hashCode( tpl );
        return hash;
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
        return Objects.equals( this.rid, other.rid )
               && Objects.equals( this.tpl, other.tpl )
               && Objects.equals( this.prev, other.prev )
               && Objects.equals( this.next, other.next );
    }

    public Type getType()
    {
        return type;
    }

    public String getRid()
    {
        return rid;
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

    public static enum Type
    {
        OR,
        OPOR,
        PP,
        IP,
        DT,
        OPDT
    }

}
