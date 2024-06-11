import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
    CachePreventionInterceptor,
    CorsSecurityInterceptor,
    CsrfPreventionInterceptor,
    EuLoginSessionTimeoutHandlingInterceptor,
    CoreModule as EuiCoreModule,
    translateConfig,
    CoreModuleEffects,
    EUI_CONFIG_TOKEN,
} from '@eui/core';
import { EuiLayoutModule } from '@eui/components/layout';

import { appConfig } from '../../config/index';
import { environment } from '../../environments/environment';

import { REDUCER_TOKEN, getReducers, metaReducers } from './reducers/index';

import { SharedModule } from '@shared/shared.module';

@NgModule({
    imports: [
        EuiLayoutModule,
        SharedModule,
        HttpClientModule,
        EuiCoreModule.forRoot(),
        EffectsModule.forRoot([...CoreModuleEffects]),
        TranslateModule.forRoot(translateConfig),
        StoreModule.forRoot(REDUCER_TOKEN, { metaReducers }),
        !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 50 }) : [],
    ],
    declarations: [
    ],
    exports: [
        EuiLayoutModule,
        SharedModule,
    ],
    providers: [
        {
            provide: REDUCER_TOKEN,
            deps: [],
            useFactory: getReducers,
        },
        {
            provide: EUI_CONFIG_TOKEN,
            useValue: { appConfig, environment }
        },
        {
            // Sets the withCredentials on Ajax Request to send the JSESSIONID cookie to another domain.
            // This is necessary when a request is being made to another domain that is protected by EU Login.
            provide: HTTP_INTERCEPTORS,
            useClass: CorsSecurityInterceptor,
            multi: true,
        },
        {
            // WARNING: in case of OpenID this is not needed since OpenID is stateless therefore no revalidation needed.
            // When the authentication session is invalid, we need to re-authenticate. The browser refreshes the current URL,
            // and lets the EU Login client redirect to the official EU Login page.
            provide: HTTP_INTERCEPTORS,
            useClass: EuLoginSessionTimeoutHandlingInterceptor,
            multi: true,
        },
        {
            // Adds HTTP header to each Ajax request that ensures the request is set by a piece of JavaScript code in the application.
            // This prevents dynamically-loaded content from forging a request in the name of the currently logged-in user.
            // Be aware that this assumes that cross-site scripting (XSS) is already put in place, (default setting in Angular).
            provide: HTTP_INTERCEPTORS,
            useClass: CsrfPreventionInterceptor,
            multi: true,
        },
        {
            // Asks the intermediate proxies not to return a cache copy of the resource.
            // In matter of fact forces each server in the chain to validate the freshness of the resource.
            provide: HTTP_INTERCEPTORS,
            useClass: CachePreventionInterceptor,
            multi: true,
        },
    ]
})
export class CoreModule {

}
