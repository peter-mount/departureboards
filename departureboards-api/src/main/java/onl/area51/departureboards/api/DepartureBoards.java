/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package onl.area51.departureboards.api;

import java.io.IOException;
import javax.json.JsonObject;

/**
 *
 * @author peter
 */
public interface DepartureBoards
{

    JsonObject departureBoards( String crs )
            throws IOException;
    
}
