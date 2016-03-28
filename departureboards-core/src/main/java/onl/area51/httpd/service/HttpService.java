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
package onl.area51.httpd.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.enterprise.inject.spi.CDI;
import javax.inject.Inject;
import onl.area51.httpd.HttpRequestHandlerBuilder;
import org.apache.http.config.SocketConfig;
import onl.area51.httpd.HttpServer;
import onl.area51.httpd.HttpServerBuilder;
import onl.area51.httpd.action.Action;
import onl.area51.kernel.CommandArguments;
import uk.trainwatch.util.config.Configuration;
import uk.trainwatch.util.config.ConfigurationService;
import org.apache.http.HttpStatus;
import onl.area51.httpd.action.Actions;

@ApplicationScoped
public class HttpService
{

    private static final Logger LOG = Logger.getGlobal();

    @Inject
    private ConfigurationService configurationService;
    private Configuration httpdConfig;

    private HttpServer server;
    private int port;
    private String serverInfo;

    /**
     * Instantiate this bean on startup.
     *
     * @param args
     */
    public void boot( @Observes CommandArguments args )
    {
        // Nothing to do here, it's presence ensures the bean is instantiated by CDI
    }

    @PostConstruct
    void start()
    {
        httpdConfig = configurationService.getConfiguration( "httpd" );

        port = httpdConfig.getInt( "port", 8080 );
        serverInfo = httpdConfig.getString( "serverInfo", "Area51/1.1" );

        LOG.log( Level.INFO, () -> "Creating http server " + serverInfo + " on port " + port );

        HttpServerBuilder serverBuilder = HttpServerBuilder.builder()
                // HTTP Server config
                .setSocketConfig( SocketConfig.custom()
                        .setSoTimeout( httpdConfig.getInt( "socket.soTimeout", 15000 ) )
                        .setTcpNoDelay( httpdConfig.getBoolean( "socket.tcpNoDelay", true ) )
                        .build() )
                .setListenerPort( port )
                .setServerInfo( serverInfo )
                .setSslContext( null )
                .setExceptionLogger( ex -> LOG.log( Level.SEVERE, null, ex ) )
                .shutdown( httpdConfig.getLong( "shutdown.time", 5L ), httpdConfig.getEnum( "shutdown.unit", TimeUnit.class, TimeUnit.SECONDS ) );

        // Default global action is to serve resources
        Actions.registerClassResourceHandler( serverBuilder, HttpService.class );

        serverBuilder.notify( CDI.current().getBeanManager()::fireEvent );

        // Add global error handlers. As these are at the end, earlier ones take precedence
        Actions.registerErrorHandlers( serverBuilder );

        server = serverBuilder.build();

        LOG.log( Level.INFO, () -> "Starting http server " + serverInfo + " on port " + port );

        try {
            server.start();
        } catch( IOException ex ) {
            throw new UncheckedIOException( ex );
        }

        LOG.log( Level.INFO, () -> "Started http server " + serverInfo + " on port " + port );
    }

    @PreDestroy
    void stop()
    {
        LOG.log( Level.INFO, () -> "Shutting down http server " + serverInfo + " on port " + port );

        server.stop();

        LOG.log( Level.INFO, () -> "Shut down http server " + serverInfo + " on port " + port );
    }
}
