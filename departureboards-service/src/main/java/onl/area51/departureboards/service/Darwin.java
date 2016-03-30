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
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Observes;
import onl.area51.kernel.CommandArguments;

/**
 * Ensures the core beans are initialised on application startup
 * @author peter
 */
@Dependent
public class Darwin
{

    void start( @Observes CommandArguments arguments,
                DarwinLive darwinLive,
                DarwinReference darwinReference )
            throws IOException
    {
        // Just call them to initialise the beans inside the proxies
        darwinLive.toString();
        darwinReference.toString();
    }

}
