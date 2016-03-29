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

import java.util.function.UnaryOperator;
import onl.area51.httpd.action.Action;
import onl.area51.httpd.tiles.TileBuilders;

/**
 *
 * @author peter
 */
public interface LayoutBuilder
{

    LayoutBuilder setTitle( String title );

    LayoutBuilder setTitleTransform( UnaryOperator titleTransform );

    LayoutBuilder setBanner( Action banner );

    LayoutBuilder setHeader( Action header );

    LayoutBuilder setBody( Action body );

    LayoutBuilder setCookie( Action cookie );

    LayoutBuilder setFooter( Action footer );

    Action build();

    static LayoutBuilder builder()
    {
        return new LayoutBuilder()
        {
            private String title;
            private Action body, banner, header, footer, cookie;

            private UnaryOperator titleTransform = UnaryOperator.identity();

            @Override
            public LayoutBuilder setTitle( String title )
            {
                this.title = title;
                return this;
            }

            @Override
            public LayoutBuilder setTitleTransform( UnaryOperator titleTransform )
            {
                this.titleTransform = titleTransform;
                return this;
            }

            @Override
            public LayoutBuilder setBody( Action body )
            {
                this.body = body;
                return this;
            }

            @Override
            public LayoutBuilder setBanner( Action banner )
            {
                this.banner = banner;
                return this;
            }

            @Override
            public LayoutBuilder setCookie( Action cookie )
            {
                this.cookie = cookie;
                return this;
            }

            @Override
            public LayoutBuilder setFooter( Action footer )
            {
                this.footer = footer;
                return this;
            }

            @Override
            public LayoutBuilder setHeader( Action header )
            {
                this.header = header;
                return this;
            }

            @Override
            public Action build()
            {
                return TileBuilders.layoutMainBuilder()
                        .setTitle( title )
                        .setTitleTransform( titleTransform )
                        .setHeader( StandardTiles.HTML_HEADER )
                        .setBody( r -> r.getResponse()
                                .div()
                                .id( "outer" )
                                // Banner
                                .div()
                                .id( "outer-banner" )
                                .div()
                                .id( "inner-banner" )
                                .exec( banner )
                                .exec( header )
                                .end()
                                .end()
                                // Body
                                .div()
                                .id( "outer-body" )
                                .div()
                                .id( "inner-body" )
                                .exec( body )
                                .end()
                                .end()
                                // Footer
                                .div()
                                .id( "outer-footer" )
                                .div()
                                .id( "inner-footer" )
                                .exec( footer )
                                .end()
                                .end()
                                // Cookie and end outer
                                .exec( cookie )
                                .end()
                                // Loading div, must not be shortened
                                .begin( "div", true )
                                .id( "loading" )
                                .end()
                        )
                        .build();
            }
        };
    }
}
