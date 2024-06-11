import { Component, OnInit } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { ProgressBarComponent } from "@shared/progress-bar/progress-bar.component";

@Component({
    templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
    constructor(private dataService: DataService) {
        this.dataService.reset();
    }

    ngOnInit() {
        this.dataService.resetAssessment();
        this.dataService.resetAssessment2();
        this.dataService.reset();
        this.dataService.reset2();
    }
}
