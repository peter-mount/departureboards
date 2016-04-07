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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArraySet;
import javax.xml.stream.XMLStreamReader;
import uk.trainwatch.util.CollectorUtils;

/**
 *
 * @author peter
 */
public class Journey
{

    private static final String TTNS = "";//"http://www.thalesgroup.com/rtti/XmlTimetable/v8";

    private final String rid;
    private final String uid;
    private String trainId;
    private final String ssd;
    private String toc;
    private String status;
    private String trainCat;
    private boolean isPassengerSvc;
    private List<Point> callingPoints = new ArrayList<>();
    private Point origin;
    private Point destination;
    private Collection<Association> associations = null;

    public Journey( XMLStreamReader r )
    {
        this.rid = r.getAttributeValue( TTNS, "rid" );
        this.uid = r.getAttributeValue( TTNS, "uid" );
        this.trainId = r.getAttributeValue( TTNS, "trainId" );
        this.ssd = r.getAttributeValue( TTNS, "ssd" );
        this.toc = r.getAttributeValue( TTNS, "toc" );
        this.status = r.getAttributeValue( TTNS, "status" );
        this.trainCat = r.getAttributeValue( TTNS, "trainCat" );
        this.isPassengerSvc = !"false".equals( r.getAttributeValue( TTNS, "isPassengerSvc" ) );
    }

    public Journey( String rid, String uid, String ssd )
    {
        this.rid = rid;
        this.uid = uid;
        this.ssd = ssd;
    }

    public Point getLastReport()
    {
        return callingPoints.stream()
                .filter( Point::isReport )
                .collect( CollectorUtils.findLast() )
                .orElse( null );
    }

    public Collection<Association> getAssociations()
    {
        return associations == null ? Collections.emptyList() : associations;
    }

    public synchronized void associate( Association assoc )
    {
        if( associations == null ) {
            associations = new CopyOnWriteArraySet<>();
        }
        associations.add( assoc );
    }

    public List<Point> getCallingPoints()
    {
        return callingPoints;
    }

    public void setCallingPoints( List<Point> callingPoints )
    {
        this.callingPoints = callingPoints;
    }

    void add( Point p )
    {
        callingPoints.add( p );

        if( origin == null ) {
            origin = p;
        }
        if( destination == null ) {
            destination = p;
        }
        else {
            p.setPrev( destination );
            destination.setNext( p );
            destination = p;
        }
    }

    public Point getDestination()
    {
        return destination;
    }

    public Point getOrigin()
    {
        return origin;
    }

    @Override
    public int hashCode()
    {
        int hash = 3;
        hash = 79 * hash + Objects.hashCode( this.rid );
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
        final Journey other = (Journey) obj;
        return Objects.equals( this.rid, other.rid );
    }

    public String getRid()
    {
        return rid;
    }

    public String getUid()
    {
        return uid;
    }

    public String getTrainId()
    {
        return trainId;
    }

    public void setTrainId( String trainId )
    {
        this.trainId = trainId;
    }

    public String getSsd()
    {
        return ssd;
    }

    public String getToc()
    {
        return toc;
    }

    public void setToc( String toc )
    {
        this.toc = toc;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus( String status )
    {
        this.status = status;
    }

    public String getTrainCat()
    {
        return trainCat;
    }

    public void setTrainCat( String trainCat )
    {
        this.trainCat = trainCat;
    }

    public boolean isIsPassengerSvc()
    {
        return isPassengerSvc;
    }

    public void setIsPassengerSvc( boolean isPassengerSvc )
    {
        this.isPassengerSvc = isPassengerSvc;
    }

}
