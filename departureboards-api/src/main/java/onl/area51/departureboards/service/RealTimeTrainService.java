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
import java.util.Collections;
import java.util.Objects;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import onl.area51.departureboards.api.RealTimeTrain;
import uk.trainwatch.util.JsonUtils;

/**
 *
 * @author peter
 */
@ApplicationScoped
public class RealTimeTrainService
        implements RealTimeTrain
{

    @Inject
    private DarwinLive darwinLive;

    @Inject
    private DarwinReference darwinReference;

    @Override
    public boolean isRidValid( String rid )
            throws IOException
    {
        return darwinLive.getJourney( rid ) != null;
    }

    @Override
    public JsonObject getJourney( String rid, boolean stopsOnly )
            throws IOException
    {
        Journey journey = darwinLive.getJourney( rid );
        if( journey == null ) {
            return null;
        }

        TiplocSet tpls = new TiplocSet();

        Journey j = tpls.addJourney( journey );
        JsonObjectBuilder b = journey.getOrigin()
                .toJsonImpl()
                .add( "rid", journey.getRid() )
                .add( "origin", journey.getOrigin().toJsonImpl() )
                .add( "dest", journey.getDestination().toJsonImpl() );
        JsonUtils.add( b, "toc", journey.getToc() );
        JsonUtils.add( b, "headcode", journey.getTrainId() );
        JsonUtils.add( b, "cat", journey.getTrainCat() );
        b.add( "calling", journey.getCallingPoints()
               .stream()
               .filter( cp -> !stopsOnly || cp.getType().isStop() )
               .map( cp -> tpls.addPoint( cp ).toJsonImpl() )
               .collect( JsonUtils.collectJsonArray() ) );

        journey.getAssociations()
                .stream()
                .map( a -> new Object()
                {
                    Association as = a;
                    Journey sj;
                    JsonObjectBuilder b;
                    String k;
                } )
                .map( a -> {
                    a.sj = tpls.addJourney( darwinLive.getJourney( a.as.getAssocRid() ) );
                    if( a.sj == null ) {
                        return null;
                    }

                    Point dest = a.sj.getDestination();
                    if( a.sj.getOrigin() == null || dest == null || j.getDestination().getTpl().equals( dest.getTpl() ) ) {
                        return null;
                    }

                    switch( a.as.getCategory() ) {
                        case "JJ":
                            a.k = "joins";
                            break;
                        case "VV":
                            a.k = "split";
                            break;
                        case "NP":
                            a.k = "nextTrain";
                            break;
                        default:
                            return null;
                    }

                    a.b = a.sj.getDestination().toJson( tpls::addPoint, Collections.emptyList() );
                    return a;
                } )
                .filter( Objects::nonNull )
                .forEach( a -> b.add( a.k, a.b ) );

        return tpls.toJson( b, darwinReference )
                .build();
    }

}
