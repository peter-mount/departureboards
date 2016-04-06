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

import java.io.StringWriter;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.json.JsonStructure;
import javax.json.JsonWriter;
import onl.area51.httpd.action.Actions;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;

/**
 * Entity for returning Json objects
 *
 * @author peter
 */
public class JsonEntity
        extends StringEntity
        implements Cloneable
{

    public static HttpEntity createFromAttribute( String n, Request r )
    {
        Object o = r.getAttribute( n );
        if( o instanceof JsonStructure ) {
            return new JsonEntity( (JsonStructure) o );
        }
        if( o instanceof JsonObjectBuilder ) {
            return new JsonEntity( (JsonObjectBuilder) o );
        }
        if( o instanceof JsonArrayBuilder ) {
            return new JsonEntity( (JsonArrayBuilder) o );
        }
        return Actions.errorEntity( r, HttpStatus.SC_INTERNAL_SERVER_ERROR, "Unsupported Json " + o );
    }

    public JsonEntity( JsonStructure json )
    {
        super( encode( json ), ContentType.APPLICATION_JSON );
    }

    public JsonEntity( JsonObjectBuilder b )
    {
        this( b.build() );
    }

    public JsonEntity( JsonArrayBuilder b )
    {
        this( b.build() );
    }

    /**
     * Convert a {@link JsonStructure} to a String
     * <p>
     * @param s <p>
     * @return
     */
    public static String encode( JsonStructure s )
    {
        final StringWriter w = new StringWriter();
        try( JsonWriter jw = Json.createWriter( w ) ) {
            jw.write( s );
            return w.toString();
        }
    }

}
