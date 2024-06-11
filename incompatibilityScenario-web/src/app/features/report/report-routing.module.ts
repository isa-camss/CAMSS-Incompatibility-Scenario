import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SummaryComponent } from "./summary/summary.component";
import { AdjustmentComponent } from "./adjustment/adjustment.component";

const routes: Routes = [
    { path: "", redirectTo: "summary", pathMatch: "full" },
    { path: "summary", component: SummaryComponent },
    { path: "adjustment", component: AdjustmentComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class Module2RoutingModule {}
