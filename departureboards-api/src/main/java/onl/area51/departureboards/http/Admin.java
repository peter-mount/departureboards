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
package onl.area51.departureboards.http;

import java.io.IOException;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.departureboards.service.DarwinFTPClient;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.ActionRegistry;

/**
 * Handles the train details.
 * <ul>
 * <li>/api/departure/train/short/{rid} Returns Json for an active train with stops only.</li>
 * <li>/api/departure/train/full/{rid} Returns Json for an active train with all points.</li>
 * <li>/train/{rid} Returns the departureboards detail page which shows the short content</li>
 * </ul>
 *
 * @author peter
 */
@Dependent
public class Admin
{

    void deploy( @Observes ActionRegistry builder, DarwinFTPClient darwinFTPClient )
            throws IOException
    {
        builder.registerHandler( "/api/departure/reload",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .add( r -> darwinFTPClient.reload() )
                                 .sendOk( "OK" )
                                 .end()
                                 .build() )
                .registerHandler( "/api/departure/reload/force",
                                  HttpRequestHandlerBuilder.create()
                                  .log()
                                  .method( "GET" )
                                  .add( r -> darwinFTPClient.reload( true ) )
                                  .sendOk( "OK" )
                                  .end()
                                  .build() );
    }

}
