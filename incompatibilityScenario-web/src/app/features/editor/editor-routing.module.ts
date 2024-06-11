import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { InformationComponent } from "./information/information.component";
import { CompareComponent } from "./compare/compare.component";
import { StartingComponent } from "./starting/starting.component";
import { SelectViewsComponent } from "./selectViews/selectViews.component";
import { SelectDimensionsComponent } from "./selectDimensions/selectDimensions.component";
import { CriteriaComponent } from "./criteria/criteria.component";

const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "information", component: InformationComponent },
    { path: "compare", component: CompareComponent },
    { path: "starting", component: StartingComponent },
    { path: "selectViews", component: SelectViewsComponent },
    { path: "selectDimensions", component: SelectDimensionsComponent },
    { path: "criteria", component: CriteriaComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HomeRoutingModule {}
