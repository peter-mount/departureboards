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

        // Any splits
        journey.getAssociations()
                .stream()
                .filter( a -> "VV".equals( a.getCategory() ) )
                .map( a -> tpls.addJourney( darwinLive.getJourney( a.getAssocRid() ) ) )
                .filter( Objects::nonNull )
                .map( sj -> {
                    Point orig = sj.getOrigin();
                    Point dest = sj.getDestination();

                    // Filter out splits to ourselves, i.e. we are the split train
                    if( orig == null || dest == null || j.getDestination().getTpl().equals( dest.getTpl() ) ) {
                        return null;
                    }

                    // Json but use calling points from origin
                    return dest.toJson( tpls::addPoint, Collections.emptyList() );
                } )
                .filter( Objects::nonNull )
                .findAny()
                .ifPresent( b1 -> b.add( "split", b1 ) );

        return tpls.toJson( b, darwinReference )
                .build();
    }

}
