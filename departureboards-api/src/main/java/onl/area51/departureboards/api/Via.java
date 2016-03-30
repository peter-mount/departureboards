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

/**
 *
 * @author peter
 */
public class Via
{

    private final String at;
    private final String dest;
    private final String loc1;
    private final String loc2;
    private final String text;

    public Via( String at, String dest, String loc1 )
    {
        this( at, dest, loc1, null, null );
    }

    public Via( String at, String dest, String loc1, String loc2 )
    {
        this( at, dest, loc1, loc2, null );
    }

    public Via( String at, String dest, String loc1, String loc2, String text )
    {
        this.at = at;
        this.dest = dest;
        this.loc1 = loc1;
        this.loc2 = loc2;
        this.text = text;
    }

    public String getAt()
    {
        return at;
    }

    public String getDest()
    {
        return dest;
    }

    public String getLoc1()
    {
        return loc1;
    }

    public String getLoc2()
    {
        return loc2;
    }

    public String getText()
    {
        return text;
    }

    @Override
    public int hashCode()
    {
        int hash = 7;
        hash = 29 * hash + Objects.hashCode( this.at );
        hash = 29 * hash + Objects.hashCode( this.dest );
        hash = 29 * hash + Objects.hashCode( this.loc1 );
        hash = 29 * hash + Objects.hashCode( this.loc2 );
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
        final Via other = (Via) obj;
        return Objects.equals( this.at, other.at )
               && Objects.equals( this.dest, other.dest )
               && Objects.equals( this.loc1, other.loc1 )
               && Objects.equals( this.loc2, other.loc2 );
    }

}
