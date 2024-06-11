import { NgModule } from "@angular/core";
import { Module2RoutingModule } from "./report-routing.module";
import { SummaryComponent } from "./summary/summary.component";
import { AdjustmentComponent } from "./adjustment/adjustment.component";

import { SharedModule } from "@shared/shared.module";

@NgModule({
    imports: [SharedModule, Module2RoutingModule],
    declarations: [SummaryComponent, AdjustmentComponent],
})
export class Module {}
