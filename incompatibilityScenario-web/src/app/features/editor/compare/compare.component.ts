import { Component } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { Observable, Subject } from "rxjs";
import { Router } from "@angular/router";
import { Assessment } from "src/app/features/assessment";
import { EuiGrowlService } from "@eui/core";

@Component({
    templateUrl: "./compare.component.html",
})
export class CompareComponent {
    isFile2sucess: boolean = false;
    isFile1sucess: boolean = false;
    isButtonDisabled: boolean = true;

    constructor(
        private dataService: DataService,
        public router: Router,
        public growlService: EuiGrowlService,
        private euiGrowlService: EuiGrowlService
    ) {}

    uploadFile1($event) {
        const files = $event.target.files[0];
        const formData = new FormData();
        formData.append("file", files);

        this.getBase64EncodedFileData(files).subscribe((data) => {
            const dataJSON = JSON.parse(data);
            const assessment: Assessment = {
                rieSbbs: dataJSON.rieSbbs,
                rieSpecifications: dataJSON.rieSpecifications,
                rieName: dataJSON.rieName,
                rieDescription: dataJSON.rieDescription,
                candidateSbbs: dataJSON.candidateSbbs,
                candidateSpecifications: dataJSON.candidateSpecifications,
                newSpecification: dataJSON.newSpecification,
                assessmentDescription: dataJSON.assessmentDescription,
                name: dataJSON.name,
                organisation: dataJSON.organisation,
                email: dataJSON.email,
                views: dataJSON.views,
                dimensions: dataJSON.dimensions,
                criteriaList: dataJSON.criteriaList,
                resultList: dataJSON.resultList,
                adjustmentList: dataJSON.adjustmentList,
                globalResult: dataJSON.globalResult,
            };
            this.dataService.set(assessment);
            this.isFile1sucess = true;
            if (this.isFile1sucess && this.isFile2sucess) {
                this.isButtonDisabled = false;
            }
        });
    }

    onNextPressed() {
        const assessment1 = this.dataService.get();
        const assessment2 = this.dataService.get2();

        if (
            (assessment1.views.length > 0 && assessment2.views.length === 0) ||
            (assessment2.views.length > 0 && assessment2.views.length === 0)
        ) {
            this.euiGrowlService.growl(
                {
                    severity: "danger",
                    summary: "Error",
                    detail: "Upload two assessments with the same method (views or dimensions).",
                },
                false,
                false,
                3000,
                "bottom-right"
            );
        } else if (
            (assessment1.dimensions.length > 0 &&
                assessment2.dimensions.length === 0) ||
            (assessment2.dimensions.length > 0 &&
                assessment2.dimensions.length === 0)
        ) {
            this.euiGrowlService.growl(
                {
                    severity: "danger",
                    summary: "Error",
                    detail: "Upload two assessments with the same method (views or dimensions).",
                },
                false,
                false,
                3000,
                "bottom-right"
            );
        } else this.router.navigate(["/report/summary"]);
    }

    uploadFile2($event) {
        const files = $event.target.files[0];
        const formData = new FormData();
        formData.append("file", files);

        this.getBase64EncodedFileData(files).subscribe((data) => {
            const dataJSON = JSON.parse(data);
            const assessment2: Assessment = {
                rieSbbs: dataJSON.rieSbbs,
                rieSpecifications: dataJSON.rieSpecifications,
                rieName: dataJSON.rieName,
                rieDescription: dataJSON.rieDescription,
                candidateSbbs: dataJSON.candidateSbbs,
                candidateSpecifications: dataJSON.candidateSpecifications,
                newSpecification: dataJSON.newSpecification,
                assessmentDescription: dataJSON.assessmentDescription,
                name: dataJSON.name,
                organisation: dataJSON.organisation,
                email: dataJSON.email,
                views: dataJSON.views,
                dimensions: dataJSON.dimensions,
                criteriaList: dataJSON.criteriaList,
                resultList: dataJSON.resultList,
                adjustmentList: dataJSON.adjustmentList,
                globalResult: dataJSON.globalResult,
            };
            this.dataService.set2(assessment2);
            this.isFile2sucess = true;
            if (this.isFile1sucess && this.isFile2sucess) {
                this.isButtonDisabled = false;
            }
        });
    }

    private getBase64EncodedFileData(pFile: File): Observable<string> {
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
}
