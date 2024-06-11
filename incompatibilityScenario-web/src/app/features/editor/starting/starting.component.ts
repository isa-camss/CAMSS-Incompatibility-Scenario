import { Component, ViewChild, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "src/app/features/data.service";
import { FormBuilder, Validators } from "@angular/forms";
import {
    EuiMessageBoxComponent,
    EuiMessageBoxConfig,
    EuiMessageBoxService,
} from "@eui/components/eui-message-box";
import {
    EuiDialogComponent,
    EuiDialogConfig,
    EuiDialogModule,
    EuiDialogService,
} from "@eui/components/eui-dialog";
import { Assessment } from "src/app/features/assessment";
import { EuiGrowlService } from "@eui/core";

@Component({
    // eslint-disable-next-line
    selector: "starting",
    templateUrl: "./starting.component.html",
})
export class StartingComponent implements OnInit {
    @ViewChild("messageBoxNoDismissButton")
    messageBoxNoDismissButton: EuiMessageBoxComponent;
    @ViewChild("dialog") dialog: EuiDialogComponent;

    checkoutForm = this.formBuilder.group({
        newCandidateSpecification: { value: "", disabled: true },
        assessmentDescription: ["", Validators.required],
        name: "",
        organisation: "",
        email: ["", Validators.email],
        interoperability: ["views"],
    });

    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder,
        public router: Router,
        private euiMessageBoxService: EuiMessageBoxService,
        private euiGrowlService: EuiGrowlService,
        private euiDialogService: EuiDialogService
    ) {}

    ngOnInit() {
        this.dataService.getAssessment();
        if (this.dataService.get().newSpecification) {
            this.updateForm(this.dataService.get());
        } else {
            this.router.navigate(["/editor/home"]);
        }
    }

    //LOST VIEW INFO MSG
    public popUpLostViewsInfo(): void {
        const config = new EuiMessageBoxConfig({
            title: "Lost Views Information",
            content:
                'A "view" in the context of the European Interoperability Reference Architecture is a focused representation that highlights a specific aspect of interoperability according to the European Interoperability Framework (EIF). Each view in EIRA corresponds to one of the EIF interoperability layers (LOST) - Legal, Organisational, Semantic, and Technical - offering a targeted perspective that addresses relevant architectural concerns and requirements. These views assist in structuring and documenting how various components of a system interact to achieve interoperability in public services.',
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(config);
    }

    public openWithService(): void {
        const config = new EuiDialogConfig({
            title: "Lost Views Information",
            content:
                'A "view" in the context of the European Interoperability Reference Architecture is a focused representation that highlights a specific aspect of interoperability according to the <a href="https://ec.europa.eu/isa2/eif_en/" target="_blank">European Interoperability Framework (EIF)</a>. Each view in <a href="https://joinup.ec.europa.eu/collection/european-interoperability-reference-architecture-eira" target="_blank">EIRA</a> corresponds to one of the <a href="https://ec.europa.eu/isa2/eif_en/" target="_blank">EIF</a> interoperability layers (LOST) - Legal, Organisational, Semantic, and Technical - offering a targeted perspective that addresses relevant architectural concerns and requirements. These views assist in structuring and documenting how various components of a system interact to achieve interoperability in public services.',
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiDialogService.openDialog(config);
    }

    //INTEROPERABILITY DIMENSIONS INFO MSG
    public popUpInterDimensionsInfo(): void {
        const config = new EuiMessageBoxConfig({
            title: "Interoperability Dimensions Information",
            content:
                "The various facets or aspects of interoperability that need to be considered and optimized to ensure effective and seamless peer-to-peer collaboration between different systems, organizations, or environments. These dimensions typically include structural, behavioral, and governance components, each focusing on different aspects of interoperability—such as system architecture, behavior during interactions, and the rules governing these interactions—to facilitate comprehensive and efficient communication and cooperation.",
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(config);
    }

    //Fin Mensaje-info Script

    setData(): void {
        this.dataService.get().newSpecification =
            this.checkoutForm.value.newCandidateSpecification;
        this.dataService.get().assessmentDescription =
            this.checkoutForm.value.assessmentDescription;
        this.dataService.get().name = this.checkoutForm.value.name;
        this.dataService.get().organisation =
            this.checkoutForm.value.organisation;
        this.dataService.get().email = this.checkoutForm.value.email;
        this.dataService.saveAssessment();
        if (this.checkoutForm.value.interoperability == "views") {
            this.router.navigate(["/editor/selectViews"]);
        } else if (this.checkoutForm.value.interoperability == "dimensions") {
            this.router.navigate(["/editor/selectDimensions"]);
        }
    }

    updateForm(data: Assessment) {
        this.checkoutForm = this.formBuilder.group({
            newCandidateSpecification: data.newSpecification,
            assessmentDescription: data.assessmentDescription,
            name: data.name,
            organisation: data.organisation,
            email: data.email,
            interoperability: ["views"],
        });
    }
}
