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
import java.util.Objects;
import javax.json.Json;
import javax.json.JsonObjectBuilder;
import uk.trainwatch.util.JsonUtils;

/**
 *
 * @author peter
 */
public class Association
{

    private final String category;
    private final String tpl;
    private LocalTime pta;
    private LocalTime wta;
    private String mainRid;
    private LocalTime ptd;
    private LocalTime wtd;
    private String assocRid;

    public Association( String category, String tpl )
    {
        this.category = category;
        this.tpl = tpl;
    }

    @Override
    public int hashCode()
    {
        int hash = 3;
        hash = 53 * hash + Objects.hashCode( this.category );
        hash = 53 * hash + Objects.hashCode( this.mainRid );
        hash = 53 * hash + Objects.hashCode( this.assocRid );
        return hash;
    }

    @Override
    public boolean equals( Object obj )
    {
        if( this == obj ) {
            return true;
        }
        if( obj == null ) {
            return false;
        }
        if( getClass() != obj.getClass() ) {
            return false;
        }
        final Association other = (Association) obj;
        if( !Objects.equals( this.category, other.category ) ) {
            return false;
        }
        if( !Objects.equals( this.mainRid, other.mainRid ) ) {
            return false;
        }
        if( !Objects.equals( this.assocRid, other.assocRid ) ) {
            return false;
        }
        return true;
    }

    public boolean isValid()
    {
        return wta != null && wtd != null && mainRid != null && assocRid != null;
    }

    public String getCategory()
    {
        return category;
    }

    public String getTpl()
    {
        return tpl;
    }

    public LocalTime getWta()
    {
        return wta;
    }

    public LocalTime getWtd()
    {
        return wtd;
    }

    public String getAssocRid()
    {
        return assocRid;
    }

    public String getMainRid()
    {
        return mainRid;
    }

    public JsonObjectBuilder toJson()
    {
        JsonObjectBuilder b = Json.createObjectBuilder()
                .add( "cat", category )
                .add( "tpl", tpl )
                .add( "mainRid", mainRid )
                .add( "assocRid", assocRid );
        JsonUtils.add( b, "pta", pta );
        JsonUtils.add( b, "ptd", ptd );
        JsonUtils.add( b, "wta", wta );
        JsonUtils.add( b, "wtd", wtd );
        return b;
    }

    public void setMain( LocalTime pta, LocalTime wta, String rid )
    {
        this.pta = pta;
        this.wta = wta;
        this.mainRid = rid;
    }

    public void setAssoc( LocalTime ptd, LocalTime wtd, String rid )
    {
        this.ptd = ptd;
        this.wtd = wtd;
        this.assocRid = rid;
    }

}
