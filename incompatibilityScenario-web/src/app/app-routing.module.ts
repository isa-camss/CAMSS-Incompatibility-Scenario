import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    { path: "", redirectTo: "editor", pathMatch: "full" },
    {
        path: "editor",
        loadChildren: () =>
            import("./features/editor/editor.module").then((m) => m.Module),
    },
    {
        path: "report",
        loadChildren: () =>
            import("./features/report/report.module").then((m) => m.Module),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
