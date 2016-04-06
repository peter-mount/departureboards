/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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
