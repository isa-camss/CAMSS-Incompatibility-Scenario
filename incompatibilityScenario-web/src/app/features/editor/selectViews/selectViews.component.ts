import { Component, OnInit } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { Router } from "@angular/router";
import { EuiGrowlService } from "@eui/core";
import {
    EuiMessageBoxConfig,
    EuiMessageBoxService,
} from "@eui/components/eui-message-box";
import { View } from "./view";

@Component({
    templateUrl: "./selectViews.component.html",
    styleUrls: ["./selectViews.component.css"],
})
export class SelectViewsComponent implements OnInit {
    isMessageVisible: boolean = false;
    viewsList = [
        {
            id: "1",
            name: "Legal View",
            description:
                "The Legal view models the most salient public policy development enablers and implementation instruments that shall be considered to support the End-to-End design of interoperable digital public services.",
            checked: false,
        },
        {
            id: "2",
            name: "Organisational View",
            description:
                "The Organisational view models the most salient Architecture Building Blocks that shall be considered to support organisational aspects for the End-to-End design of Digital Public Services.",
            checked: false,
        },
        {
            id: "3",
            name: "Semantic View",
            description:
                "The Semantic view models the most salient Architecture Building Blocks that should be considered to support semantic aspects for the End-to-End design of interoperable Digital Public Services.",
            checked: false,
        },
        {
            id: "4",
            name: "Technical-Application View",
            description:
                "The Technical - Application Domain specific view contains the most salient application Architecture Building Blocks that need to be considered to support technical aspects for the End-to-End analysis and design of Digital Solutions. A Digital Solution can support one or more public policies.",
            checked: false,
        },
        {
            id: "5",
            name: "Technical-Infraestructure View",
            description:
                "The Technical - Infrastructure view contains the most salient cross-sectorial infrastructure services that need to be considered to support technical aspects for the infrastructure (i.e. computing hosting, networking, and data hosting) of Digital Solutions regardless the use case considered.",
            checked: false,
        },
    ];

    constructor(
        private dataService: DataService,
        public router: Router,
        private euiGrowlService: EuiGrowlService,
        private euiMessageBoxService: EuiMessageBoxService,
        public growlService: EuiGrowlService
    ) {}

    ngOnInit() {
        this.dataService.getAssessment();
        if (!this.dataService.get().assessmentDescription) {
            this.router.navigate(["/editor/home"]);
        }

        this.dataService.get().dimensions = [];
        if (this.dataService.get().views.length > 0) {
            for (let h = 0; h < this.dataService.get().views.length; h++) {
                const view = this.dataService.get().views[h];
                for (let u = 0; u < this.viewsList.length; u++) {
                    const item = this.viewsList[u];
                    if (item.name == view) {
                        item.checked = true;
                    }
                }
            }
        }
        this.dataService.get().views = [];
    }

    checkViews() {
        for (let i = 0; i < this.viewsList.length; i++) {
            if (this.viewsList[i].checked === true) {
                return true;
            }
        }
        return false;
    }

    setData(): void {
        for (let h = 0; h < this.viewsList.length; h++) {
            const view = this.viewsList[h];

            if (view.checked) {
                this.dataService.get().views.push(view.name);
            }
        }
        this.dataService.saveAssessment();
        if (this.dataService.get().views.length >= 1) {
            this.router.navigate(["/editor/criteria"]);
        }
    }

    openViewInformationModal(view: View) {
        const info = new EuiMessageBoxConfig({
            title: view.name,
            content: view.description,
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(info);
    }
}
