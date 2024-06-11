import { Component, OnInit } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { Router } from "@angular/router";
import {
    EuiMessageBoxConfig,
    EuiMessageBoxService,
} from "@eui/components/eui-message-box";
import { Dimension } from "./dimension";

@Component({
    templateUrl: "./selectDimensions.component.html",
    styleUrls: ["./selectDimensions.component.css"],
})
export class SelectDimensionsComponent implements OnInit {
    dimensionsList = [
        {
            id: "1",
            name: "Structural Interoperability Dimension",
            description:
                "The structural interoperability dimension is the extent its structure has been developed reusing and/or sharing components in support of a peer-to-peer collaboration",
            checked: false,
        },
        {
            id: "2",
            name: "Behavieoural Interoperability Dimension",
            description:
                "The behavioural interoperability dimension is the extent its manifested behaviour exchanges data, information or knowledge with its environment in support of a peer-to-peer collaboration",
            checked: false,
        },
        {
            id: "3",
            name: "Governance Interoperability Dimension",
            description:
                "The governance interoperability dimension is the extent its agreed choreography rules support a peer-to-peer collaboration.",
            checked: false,
        },
    ];

    constructor(
        private dataService: DataService,
        public router: Router,
        private euiMessageBoxService: EuiMessageBoxService
    ) {}

    ngOnInit() {
        this.dataService.getAssessment();
        if (!this.dataService.get().assessmentDescription) {
            this.router.navigate(["/editor/home"]);
        }

        this.dataService.get().views = [];
        if (this.dataService.get().dimensions.length > 0) {
            for (let h = 0; h < this.dataService.get().dimensions.length; h++) {
                const view = this.dataService.get().dimensions[h];
                for (let u = 0; u < this.dimensionsList.length; u++) {
                    const item = this.dimensionsList[u];
                    if (item.name == view) {
                        item.checked = true;
                    }
                }
            }
        }

        this.dataService.get().dimensions = [];
    }

    setData(): void {
        for (let h = 0; h < this.dimensionsList.length; h++) {
            const dimension = this.dimensionsList[h];

            if (dimension.checked) {
                this.dataService.get().dimensions.push(dimension.name);
            }
        }
        this.dataService.saveAssessment();
        this.router.navigate(["/editor/criteria"]);
    }

    checkDimensions() {
        for (let i = 0; i < this.dimensionsList.length; i++) {
            if (this.dimensionsList[i].checked === true) {
                return true;
            }
        }
        return false;
    }

    openDimensionInformationModal(dimension: Dimension) {
        const info = new EuiMessageBoxConfig({
            title: dimension.name,
            content: dimension.description,
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(info);
    }
}
