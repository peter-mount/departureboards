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

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.json.JsonObjectBuilder;
import onl.area51.departureboards.api.LocationRef;
import onl.area51.departureboards.api.Toc;
import uk.trainwatch.util.JsonUtils;

/**
 * A set of tiplocs to names
 *
 * @author peter
 */
public class TiplocSet
{

    private final Set<String> tpls = new HashSet<>();
    private final Set<String> tocs = new HashSet<>();

    public void add( String tpl )
    {
        tpls.add( tpl );
    }

    public Point addPoint( Point p )
    {
        if( p != null ) {
            tpls.add( p.getTpl() );
        }
        return p;
    }

    public Journey addJourney( Journey j )
    {
        if( j != null ) {
            addPoint( j.getOrigin() );
            addPoint( j.getDestination() );
            addPoint( j.getLastReport() );
            String t = j.getToc();
            if( t != null ) {
                tocs.add( t );
            }
        }
        return j;
    }

    public JsonObjectBuilder getLocRef( DarwinReference darwinReference )
    {
        return tpls.stream()
                .map( darwinReference::resovleTiploc )
                .collect( JsonUtils.collectJsonObject( LocationRef::getTiploc, LocationRef::toSmallJson ) );
    }

    public JsonObjectBuilder getOpRef( DarwinReference darwinReference )
    {
        return tocs.stream()
                .map( darwinReference::getToc )
                .filter( Objects::nonNull )
                .collect( JsonUtils.collectJsonObject( Toc::getToc, Toc::getName ) );
    }

    public JsonObjectBuilder toJson( JsonObjectBuilder b, DarwinReference darwinReference )
    {
        return b.add( "locref", getLocRef( darwinReference ) )
                .add( "opref", getOpRef( darwinReference ) );
    }
}
