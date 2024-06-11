import { NgModule } from "@angular/core";

import { SharedModule } from "@shared/shared.module";

import { HomeRoutingModule } from "./editor-routing.module";

import { HomeComponent } from "./home/home.component";
import { InformationComponent } from "./information/information.component";
import { CompareComponent } from "./compare/compare.component";
import { StartingComponent } from "./starting/starting.component";
import { SelectViewsComponent } from "./selectViews/selectViews.component";
import { SelectDimensionsComponent } from "./selectDimensions/selectDimensions.component";
import { CriteriaComponent } from "./criteria/criteria.component";
import { CriteriaDetailsComponent } from "./criteriaDetails/criteriaDetails.component";

@NgModule({
    imports: [SharedModule, HomeRoutingModule],
    declarations: [
        HomeComponent,
        InformationComponent,
        CompareComponent,
        StartingComponent,
        SelectViewsComponent,
        SelectDimensionsComponent,
        CriteriaComponent,
        CriteriaDetailsComponent,
    ],
})
export class Module {}
