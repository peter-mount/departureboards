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
import java.time.Duration;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import onl.area51.httpd.action.Actions;

/**
 * Deploys the static pages of the site
 *
 * @author peter
 */
@Dependent
public class StaticActions
{

    void deploy( @Observes ActionRegistry builder )
            throws IOException
    {
        Duration HOUR = Duration.ofHours( 1 );
        Duration DAY = Duration.ofDays( 1 );

        builder.registerHandler("/",
                                 HttpRequestHandlerBuilder.create()
                                 .log()
                                 .method( "GET" )
                                 .add(LayoutBuilder.builder()
                                         .setTitle( "Departure Boards" )
                                         .setBanner( Banner.HOME )
                                         .setFooter( StandardTiles.FOOTER )
                                         .setBody(Actions.resourceAction(StaticActions.class, "/home.html" )
                                                 .compose( r -> r.expiresIn( HOUR ).maxAge( HOUR ) )
                                         )
                                         .build()
                                 )
                                 .end()
                                 .build()
        )
                .registerHandler("/about",
                                  HttpRequestHandlerBuilder.create()
                                  .log()
                                  .method( "GET" )
                                  .add(LayoutBuilder.builder()
                                          .setTitle( "About Departure Boards" )
                                          .setBanner( Banner.HOME )
                                          .setFooter( StandardTiles.FOOTER )
                                          .setBody(Actions.resourceAction(StaticActions.class, "/about.html" )
                                                  .compose( r -> r.expiresIn( DAY ).maxAge( DAY ) )
                                          )
                                          .build()
                                  )
                                  .end()
                                  .build()
                )
                .registerHandler("/contact",
                                  HttpRequestHandlerBuilder.create()
                                  .log()
                                  .method( "GET" )
                                  .add(LayoutBuilder.builder()
                                          .setTitle( "Contact Departure Boards" )
                                          .setBanner( Banner.HOME )
                                          .setFooter( StandardTiles.FOOTER )
                                          .setBody(Actions.resourceAction(StaticActions.class, "/contact.html" )
                                                  .compose( r -> r.expiresIn( DAY ).maxAge( DAY ) )
                                          )
                                          .build()
                                  )
                                  .end()
                                  .build()
                );
    }

}
