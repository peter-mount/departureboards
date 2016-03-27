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
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.HttpServerBuilder;
import onl.area51.httpd.action.ActionBuilder;

/**
 * Deploys the / action which simply displays the home page
 *
 * @author peter
 */
@Dependent
public class HomeAction
{

    void deploy( @Observes HttpServerBuilder builder )
            throws IOException
    {
        builder.registerHandler( "/",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .add( LayoutBuilder.builder()
                                         .setTitle( "Departure Boards" )
                                         .setBanner( Banner.HOME )
                                         .setFooter( StandardTiles.FOOTER )
                                         .setBody( ActionBuilder.resourceAction( HomeAction.class, "/home.html" ) )
                                         .build()
                                 )
                                 .end()
                                 .build()
        );
    }

}
