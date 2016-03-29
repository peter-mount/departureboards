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
package onl.area51.departureboards.api;

import java.util.Objects;
import javax.json.Json;
import javax.json.JsonObjectBuilder;

/**
 *
 * @author peter
 */
public class LocationRef
{

    private final String location;
    private final String crs;
    private final String tiploc;
    private final String toc;

    public LocationRef( String location, String crs, String tiploc, String toc )
    {
        this.location = location;
        this.crs = crs;
        this.tiploc = tiploc;
        this.toc = toc;
    }

    public String getCrs()
    {
        return crs;
    }

    public String getLocation()
    {
        return location;
    }

    public String getTiploc()
    {
        return tiploc;
    }

    public String getToc()
    {
        return toc;
    }

    @Override
    public int hashCode()
    {
        return Objects.hashCode( this.tiploc );
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
        final LocationRef other = (LocationRef) obj;
        return Objects.equals( this.tiploc, other.tiploc );
    }

    public JsonObjectBuilder toSmallJson()
    {
        JsonObjectBuilder b = Json.createObjectBuilder();
        if( crs == null ) {
            b.addNull( "crs" );
        }
        else {
            b.add( "crs", crs );
        }
        return b.add( "loc", location );
    }
}
