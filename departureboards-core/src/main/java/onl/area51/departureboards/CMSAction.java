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
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import onl.area51.httpd.action.ActionRegistry;
import onl.area51.httpd.action.Action;
import onl.area51.httpd.action.Request;
import org.apache.http.HttpException;

/**
 * Prototype action for accessing CMS Content
 * 
 * @author peter
 */
@ApplicationScoped
public class CMSAction
        implements Action
{
    void deploy(@Observes ActionRegistry builder) {
        
    }

    @Override
    public void apply( Request request )
            throws HttpException,
                   IOException
    {
        throw new UnsupportedOperationException( "Not supported yet." ); //To change body of generated methods, choose Tools | Templates.
    }
    
}
