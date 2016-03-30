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

import java.io.IOException;
import java.time.LocalDate;
import onl.area51.httpd.action.Action;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpException;

/**
 *
 * @author peter
 */
public enum StandardTiles
        implements Action
{
    HTML_HEADER
    {
        @Override
        public void apply( Request request )
                throws HttpException,
                       IOException
        {
            request.getResponse()
                    .linkStylesheet( "/css/mobile.css" )
                    .linkStylesheet( "/css/ldb.css" )
                    .script( "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js" )
                    .script( "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js" )
                    .script( "/js/jquery-cookie.js" )
                    .script( "/js/ldb/mobile.js" );
        }

    },
    FOOTER
    {
        @Override
        public void apply( Request request )
                throws HttpException,
                       IOException
        {
            LocalDate date = LocalDate.now();

            request.getResponse()
                    .write( "&copy;2011-" )
                    .write( date.getYear() )
                    .write( " Peter Mount, All Rights Reserved." )
                    .br()
                    .write( "Contains data provided by " )
                    .a( "http://www.networkrail.co.uk/" )
                    .write( "Network Rail" )
                    .end()
                    .write( ", " )
                    .a( "http://www.networkrail.co.uk/" )
                    .write( "National Rail Enquiries" )
                    .end()
                    .write( ", " )
                    .a( "http://www.tfl.gov.uk/" )
                    .write( "Transport for London" )
                    .end()
                    .write( " and other public sector information licensed under the Open Government Licence." );
        }

    };

}
