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
import javax.json.Json;
import javax.json.JsonArray;
import onl.area51.departureboards.api.StationSearch;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class StationSearchService
        implements StationSearch
{

    @Override
    public JsonArray search( String term )
            throws IOException
    {
        Logger.getGlobal().log( Level.INFO, () -> "Searching for: " + term );
        return Json.createArrayBuilder()
                .add( Json.createObjectBuilder()
                        .add( "label", "Maidstone East [MDE]" )
                        .add( "value", "Maidstone East" )
                        .add( "crs", "MDE" )
                )
                .build();
    }

}
