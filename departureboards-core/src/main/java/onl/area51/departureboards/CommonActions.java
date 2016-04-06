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
package onl.area51.departureboards;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Objects;
import java.util.function.Supplier;
import onl.area51.httpd.action.Action;
import onl.area51.httpd.action.Actions;
import org.apache.http.HttpStatus;

/**
 *
 * @author peter
 */
public interface CommonActions
{

    /**
     * Return an action to extract the CRS from a path.
     * <p>
     * This action will fail with {@link HttpStatus#SC_NOT_FOUND} if the crs is not present or not 3 upper case characters.
     * <p>
     * If successful the request will have a "crs" attribute containing the crs.
     *
     * @param idx path position
     *
     * @return action.
     */
    static Action extractCrsAction( int idx )
    {
        return extractCrsAction( idx, false );
    }

    /**
     * Return an action to extract the CRS from a path.
     * <p>
     * This action will fail with {@link HttpStatus#SC_NOT_FOUND} or not 3 characters. If redirect is true and the crs is not 3 upper case characters then it
     * will issue a redirect to the uri with upper case, if false then it will fail with {@link HttpStatus#SC_NOT_FOUND}.
     * <p>
     * If successful the request will have a "crs" attribute containing the crs.
     *
     * @param idx      path position
     * @param redirect true then if the crs is not upper case then send a redirect to the upper case version
     *
     * @return action.
     */
    static Action extractCrsAction( int idx, boolean redirect )
    {
        if( redirect ) {
            return r -> r.getAttribute( "crs", () -> {
                                    String crs = r.getPath( idx );

                                    if( crs == null || crs.length() != 3 ) {
                                        Actions.sendError( r, HttpStatus.SC_NOT_FOUND, Objects.toString( crs ) );
                                        return null;
                                    }

                                    String ucrs = crs.toUpperCase();
                                    if( !crs.equals( ucrs ) ) {
                                        String path[] = Arrays.copyOf( r.getPath(), r.getPathLength() );
                                        path[idx] = ucrs;
                                        Actions.sendRedirect( r, String.join( "/", path ) );
                                        return null;
                                    }

                                    return crs;
                                } );
        }
        else {
            return r -> r.getAttribute( "crs", () -> {
                                    String crs = r.getPath( idx );

                                    if( crs == null || crs.length() != 3 || !crs.equals( crs.toUpperCase() ) ) {
                                        Actions.sendError( r, HttpStatus.SC_NOT_FOUND, Objects.toString( crs ) );
                                        return null;
                                    }

                                    return crs;
                                } );
        }
    }

    /**
     * Extract a time from a path element. If the element does not exist then this will
     *
     * @param idx           path element
     * @param attributeName attribute to set
     *
     * @return action
     */
    static Action extractTime( int idx, String attributeName )
    {
        return extractTime( idx, attributeName, () -> null );
    }

    /**
     * Extract a time from a path element. If the element does not exist then this will use a supplier to get the default time. if the time is present and is
     * invalid then {@link HttpStatus#SC_BAD_REQUEST} is issued.
     *
     * @param idx           path element
     * @param attributeName attribute to set
     * @param defaultTime   If no time is set, or is invalid the default LocalTime to use
     *
     * @return action
     */
    static Action extractTime( int idx, String attributeName, Supplier<LocalTime> defaultTime )
    {
        return r -> {
            LocalTime time = null;
            String tm = r.getPath( idx );
            if( tm != null && !tm.trim().isEmpty() ) {
                try {
                    time = LocalTime.parse( tm.trim() ).truncatedTo( ChronoUnit.MINUTES );
                }
                catch( Exception ex ) {
                    Actions.sendError( r, HttpStatus.SC_BAD_REQUEST, "Invalid time" );
                    return;
                }
            }
            r.setAttribute( attributeName, time == null ? defaultTime.get() : time );
        };
    }
}
