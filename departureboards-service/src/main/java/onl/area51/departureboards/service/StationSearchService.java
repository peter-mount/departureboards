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

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import onl.area51.departureboards.api.StationSearch;
import uk.trainwatch.nre.darwin.reference.DarwinReferenceManager;
import uk.trainwatch.nrod.location.TrainLocation;
import uk.trainwatch.util.JsonUtils;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class StationSearchService
        implements StationSearch
{

    @Inject
    private DarwinReferenceManager darwinReferenceManager;

    @Override
    public JsonArray search( String term )
            throws IOException
    {
        Logger.getGlobal().log( Level.INFO, () -> "Searching for: " + term );

        return darwinReferenceManager.searchLocations( term )
                .map( l -> Json.createObjectBuilder()
                        .add( "label", l.getLocation() + " [" + l.getCrs() + "]" )
                        .add( "value", l.getLocation() )
                        .add( "crs", l.getCrs() )
                )
                .collect( JsonUtils.collectJsonArray() )
                .build();
    }

    @Override
    public boolean isCrsValid( String crs )
            throws IOException
    {
        return darwinReferenceManager.getLocationRefFromCrs( crs ) != null;
    }

    @Override
    public JsonObject lookupCrs( String crs )
            throws IOException
    {
        TrainLocation loc = darwinReferenceManager.getLocationRefFromCrs( crs );

        if( loc != null ) {
            return loc.toJson().build();
        }

        return null;
    }

}
