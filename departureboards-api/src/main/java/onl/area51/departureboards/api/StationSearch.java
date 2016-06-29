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

import java.io.IOException;
import javax.json.JsonArray;
import javax.json.JsonObject;

/**
 *
 * @author peter
 */
public interface StationSearch
{

    /**
     * Search a station by it's name. This will accept either CRS/3Alpha codes or part of the station name in it's results.
     * 
     * @param term
     * @return
     * @throws IOException 
     */
    JsonArray search( String term )
            throws IOException;

    /**
     * Is a CRS/3Alpha code valid
     * 
     * @param crs CRS to check
     * @return true if it's a valid CRS code
     * @throws IOException 
     */
    boolean isCrsValid( String crs )
            throws IOException;

    /**
     * Lookup a CRS/3Alpha code and return it's details as Json
     * @param crs CRS to lookup
     * @return JsonObject or null if crs is not valid
     * @throws IOException 
     */
    JsonObject lookupCrs( String crs )
            throws IOException;
}
