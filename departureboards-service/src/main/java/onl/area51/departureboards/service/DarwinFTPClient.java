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
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import onl.area51.kernel.CommandArguments;
import org.apache.commons.net.ftp.FTPFile;
import uk.trainwatch.io.IOAction;
import uk.trainwatch.io.IOSupplier;
import uk.trainwatch.util.TimeUtils;
import uk.trainwatch.util.config.Configuration;
import uk.trainwatch.util.config.impl.GlobalConfiguration;
import uk.trainwatch.io.ftp.FTPClient;
import uk.trainwatch.scheduler.Cron;
import uk.trainwatch.util.CollectorUtils;

/**
 * Service that handles the updating of static data by connecting to NRE via FTP
 *
 * @author peter
 */
@ApplicationScoped
public class DarwinFTPClient
{

    private static final String REFERENCE_ENDS_WITH = "_ref_v3.xml.gz";
    private static final String TIMETABLE_ENDS_WITH = "_v8.xml.gz";
    private static final String DATE = "date";
    private static final String DARWIN = "darwin";
    private static final String TIMETABLE = "timetable";
    private static final String FORCE = "force";

    private static final Logger LOG = Logger.getGlobal();

    @Inject
    private DarwinLive darwinLive;

    @Inject
    private DarwinReference darwinReference;

    @Inject
    @GlobalConfiguration(DARWIN)
    private Configuration configuration;

    private FileSystem fs;

    public synchronized FileSystem getFileSystem()
            throws IOException
    {
        if( fs == null ) {
            Configuration config = configuration.getConfiguration( "cache" );
            fs = FileSystems.newFileSystem( config.getURI( "uri" ), config );
        }
        return fs;
    }

    void deploy( @Observes CommandArguments arguments )
    {
    }

    @PostConstruct
    void start()
    {
        reload( true );
    }

    /**
     * Reload at 03:00 then check every 15 minutes until 09:45. As we'll have a cache of the file
     * and this will reload on the first file we'll handle most instances of darwin not being available in time
     */
    @Cron("0 0/15 3-9 * * ? *")
    public void reload()
    {
        reload( false );
    }

    /**
     * Reload the timetable
     *
     * @param force true to force the reload
     */
    public synchronized void reload( boolean force )
    {
        LocalDateTime dateTime = TimeUtils.getLondonDateTime();
        if( dateTime.toLocalTime().isBefore( LocalTime.of( 2, 0 ) ) ) {
            dateTime = dateTime.minusDays( 1 );
        }

        try {
            Configuration config = configuration.getConfiguration( "ftp" );
            FTPClient.builder()
                    .setLogger( l -> LOG.log( Level.INFO, l ) )
                    .connect( config.getString( "server" ) )
                    .login( config.getString( "user" ), config.getString( "password" ) )
                    .binary()
                    .passive()
                    .printCommands()
                    .setAttribute( FORCE, force )
                    .setAttribute( DATE, dateTime.toLocalDate() )
                    // Reload the reference data
                    .invokeLater( this::checkReference )
                    // Now see if we need to reload the timetable
                    .invokeLater( this::checkTimeTable )
                    // Now run the chain
                    .execute();
        }
        catch( IOException ex ) {
            LOG.log( Level.SEVERE, "Failed to reload", ex );
        }
    }

    private IOAction checkReference( FTPClient client )
            throws IOException
    {
        LocalDate date = client.getAttribute( DATE );

        Path path = getFileSystem().getPath( DARWIN, "reference",
                                             String.valueOf( date.getYear() ),
                                             String.valueOf( date.getMonthValue() ),
                                             date.toString() + REFERENCE_ENDS_WITH
        );

        return retrieve( client, path, REFERENCE_ENDS_WITH, () -> () -> darwinReference.loadReference( path ) );
    }

    private IOAction checkTimeTable( FTPClient client )
            throws IOException
    {
        LocalDate date = client.getAttribute( DATE );

        Path path = getFileSystem().getPath( DARWIN, TIMETABLE,
                                             String.valueOf( date.getYear() ),
                                             String.valueOf( date.getMonthValue() ),
                                             date.toString() + TIMETABLE_ENDS_WITH
        );

        return retrieve( client, path, TIMETABLE_ENDS_WITH, () -> () -> darwinLive.loadTimeTable( path ) );
    }

    private IOAction retrieve( FTPClient client, Path path, String endsWith, IOSupplier<IOAction> task )
            throws IOException
    {
        boolean reload = client.getBooleanAttribute( FORCE );

        if( !Files.exists( path, LinkOption.NOFOLLOW_LINKS ) ) {
            Optional<FTPFile> file = client.files( f -> f.isFile() && f.getName().endsWith( endsWith ) )
                    .sorted( ( a, b ) -> a.getName().compareTo( b.getName() ) )
                    .collect( CollectorUtils.findLast() );
            reload |= client.retrieveIfNeeded( file.get(), path, StandardCopyOption.REPLACE_EXISTING );
        }

        return reload ? task.get() : null;
    }
}
