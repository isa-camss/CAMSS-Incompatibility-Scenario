/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { EuiTableComponent } from "@eui/components/eui-table";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { FormBuilder, Validators } from "@angular/forms";
import { Assessment } from "src/app/features/assessment";
import { Router } from "@angular/router";
import { EuiGrowlService } from "@eui/core";
import {
    EuiMessageBoxConfig,
    EuiMessageBoxService,
} from "@eui/components/eui-message-box";

@Component({
    templateUrl: "./information.component.html",
})
export class InformationComponent implements OnInit {
    @ViewChild("myTable1") myTable1: EuiTableComponent;
    @ViewChild("myTable2") myTable2: EuiTableComponent;

    isTable1Visible: boolean = false;
    isTable2Visible: boolean = false;

    public dataSource1: any[] = [];
    public dataSource2: any[] = [];

    checkoutForm = this.formBuilder.group({
        rieName: ["", Validators.required],
        rieDescription: ["", Validators.required],
    });

    constructor(
        private dataService: DataService,
        private readonly http: HttpClient,
        private formBuilder: FormBuilder,
        public router: Router,
        private euiGrowlService: EuiGrowlService,
        public growlService: EuiGrowlService,
        private euiMessageBoxService: EuiMessageBoxService
    ) {}

    ngOnInit(): void {
        this.dataService.getAssessment();
        if (
            this.dataService.get().rieName ||
            this.dataService.get().rieDescription
        ) {
            this.updateForm(this.dataService.get());
        }

        for (
            let index = 0;
            index < this.dataService.get().rieSbbs.length;
            index++
        ) {
            const rieSbb = this.dataService.get().rieSbbs[index];
            const rieSpecification =
                this.dataService.get().rieSpecifications[index];
            this.dataSource1.push({
                sbb: rieSbb,
                specification: rieSpecification,
            });
            this.isTable1Visible = true;
        }

        // let newSpec = this.getDiferentSpecification(this.dataService.get().rieSpecifications,this.dataService.get().candidateSpecifications);
        for (
            let index = 0;
            index < this.dataService.get().candidateSbbs.length;
            index++
        ) {
            const candidateSbb = this.dataService.get().candidateSbbs[index];
            const candidateSpecification =
                this.dataService.get().candidateSpecifications[index];
            const existing = this.checkDifferentNew(candidateSpecification);
            console.log("existing: ", existing);
            let newSpec = "";
            if (!existing) {
                newSpec = this.dataService.get().newSpecification;
            }
            this.dataSource2.push({
                sbb: candidateSbb,
                specification: existing,
                newSpecification: newSpec,
            });
            this.isTable2Visible = true;
        }
    }

    updateForm(data: Assessment) {
        this.checkoutForm = this.formBuilder.group({
            rieName: data.rieName,
            rieDescription: data.rieDescription,
        });
    }

    onSendForm() {
        this.dataService.get().rieName = this.checkoutForm.value.rieName;
        this.dataService.get().rieDescription =
            this.checkoutForm.value.rieDescription;
        this.dataService.saveAssessment();
        this.router.navigate(["/editor/starting"]);
    }

    changeRie($event) {
        const files = $event.target.files[0];
        const formData = new FormData();
        formData.append("file", files);

        this.getBase64EncodedFileData(files).subscribe((data) => {
            const blob = new Blob([data], { type: "text/xml" });
            formData.append("file", blob);
            this.http.post("/sbb", formData).subscribe({
                next: (response: any) => {
                    if (response.length > 0) {
                        for (let index = 0; index < response.length; index++) {
                            const element = response[index];
                            this.dataSource1.push({
                                sbb: element.sbbname,
                                specification: element.specificationsName,
                            });
                            this.dataService
                            .get()
                            .rieSbbs.push(element.sbbname);
                            this.dataService
                            .get()
                            .rieSpecifications.push(element.specificationsName);
                            this.isTable1Visible = true;
                        }
                    } else {
                        console.info("The XML file does not contain any SBB");
                        this.euiGrowlService.growl(
                            {
                                severity: "danger",
                                summary: "Error",
                                detail: "The XML file does not contain any SBB",
                            },
                            false,
                            false,
                            3000,
                            "bottom-right"
                        );
                    }
                },
                error: (error: any) => {
                    console.error(error);
                },
            });
        });
    }

    changeCandidate($event) {
        const files = $event.target.files[0];
        const formData = new FormData();
        formData.append("file", files);

        this.getBase64EncodedFileData(files).subscribe((data) => {
            const blob = new Blob([data], { type: "text/xml" });
            formData.append("file", blob);
            this.http.post("/sbb", formData).subscribe({
                next: (response: any) => {
                    console.log("res");
                    if (response.length > 0) {
                        for (let index = 0; index < response.length; index++) {
                            const element = response[index];
                            this.dataService
                            .get()
                            .candidateSbbs.push(element.sbbname);
                            this.dataService
                            .get()
                            .candidateSpecifications.push(
                                element.specificationsName
                            );
                            this.isTable2Visible = true;
                            const newSpec = this.getDiferentSpecification(
                                this.dataService.get().rieSpecifications,
                                this.dataService.get().candidateSpecifications
                            );
                            if (newSpec != null) {
                                this.dataService.get().newSpecification =
                                    newSpec;
                            }
                        }
                        for (
                            let index = 0;
                            index < this.dataService.get().candidateSbbs.length;
                            index++
                        ) {
                            const candidateSbb =
                                this.dataService.get().candidateSbbs[index];
                            const candidateSpecification =
                                this.dataService.get().candidateSpecifications[
                                    index
                                ];
                            const existing = this.checkDifferentNew(
                                candidateSpecification
                            );
                            let newSpec = "";
                            if (!existing && candidateSpecification) {
                                newSpec =
                                    this.dataService.get().newSpecification;
                            }
                            this.dataSource2.push({
                                sbb: candidateSbb,
                                specification: existing,
                                newSpecification: newSpec,
                            });
                            this.isTable2Visible = true;
                        }
                    } else {
                        console.info("The XML file does not contain any SBB");
                        this.euiGrowlService.growl(
                            {
                                severity: "danger",
                                summary: "Error",
                                detail: "The XML file does not contain any SBB",
                            },
                            false,
                            false,
                            3000,
                            "bottom-right"
                        );
                    }
                },
                error: (error: any) => {
                    console.error(error);
                },
            });
        });
    }

    checkDifferentNew(specification) {
        if (this.dataService.get().newSpecification === specification) {
            return null;
        } else return specification;
    }

    checkDifferentOld(specification) {
        if (this.dataService.get().newSpecification === specification) {
            return specification;
        } else return null;
    }

    public popUpSBBInfo(): void {
        const config = new EuiMessageBoxConfig({
            title: "Solution Building Block (SBB)",
            content:
                "Corresponds to a piece of data, produced software or deployment/operation of IT system that permit to implement one or more EIRA Architecture Building Blocks of an European Public Service.",
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(config);
    }

    public uploadPreviousAssesment($event) {
        const files = $event.target.files[0];
        const formData = new FormData();
        formData.append("file", files);

        this.getBase64EncodedFileData2(files)
        .then((uploadedAssesment: Assessment) => {
            this.updateForm(uploadedAssesment);
            this.dataService.set(uploadedAssesment);
            this.euiGrowlService.growl(
                {
                    severity: "success",
                    summary: "Success",
                    detail: "Previous assesment imported succesfully",
                },
                false,
                false,
                3000,
                "bottom-right"
            );
            this.router.navigate(["/editor/criteria"]);
        })
        .catch((error) => {
            this.euiGrowlService.growl(
                {
                    severity: "danger",
                    summary: "Error",
                    detail: "Import a valid JSON assesment",
                },
                false,
                false,
                3000,
                "bottom-right"
            );
        });
    }

    private getDiferentSpecification(
        rieSpecifications: string[],
        candidateSpecification: string[]
    ) {
        let result;

        candidateSpecification.forEach((spec) => {
            if (!rieSpecifications.includes(spec)) result = spec;
            // else result = null
        });

        return result;
    }

    private getBase64EncodedFileData(pFile: File): Observable<any> {
        const sub = new Subject<string>();
        const lReader = new FileReader();

        lReader.onload = () => {
            const lFileContent: string = lReader.result as string;
            sub.next(lFileContent);
            sub.complete();
        };

        lReader.readAsBinaryString(pFile);
        return sub.asObservable();
    }

    private getBase64EncodedFileData2(pFile: File): Promise<Assessment> {
        return new Promise((resolve, reject) => {
            const lReader = new FileReader();
            lReader.onload = () => {
                const lFileContent: string = lReader.result as string;
                try {
                    const parsedContent = JSON.parse(lFileContent);
                    resolve(parsedContent);
                } catch (error) {
                    reject(new Error("File content is not valid JSON"));
                }
            };
            lReader.onerror = () => {
                reject(lReader.error);
            };
            lReader.readAsBinaryString(pFile);
        });
    }
}
