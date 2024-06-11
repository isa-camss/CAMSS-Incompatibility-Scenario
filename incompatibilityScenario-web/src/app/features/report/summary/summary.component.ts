/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Component,
    Inject,
    OnInit,
    ViewChild,
    ElementRef,
} from "@angular/core";
import { CONFIG_TOKEN, EuiAppConfig } from "@eui/core";
import { DataService } from "src/app/features/data.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EuiTableComponent } from "@eui/components/eui-table";
import { EuiDialogComponent } from "@eui/components/eui-dialog";
import Chart from "chart.js/auto";
import exportFromJSON from "export-from-json";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RowInput } from "jspdf-autotable";
import { EuiProgressBarModule } from "@eui/components/eui-progress-bar";
import { EuiBadgeModule } from "@eui/components/eui-badge";
import { Result } from "../../editor/result";
import { EuiGrowlService } from "@eui/core";
import { EuiTextAreaModule } from "@eui/components/eui-textarea";
import { AdjustedResult } from "../../editor/adjustedResult";
import dimensions from "src/assets/dimensions.json";
import views from "src/assets/views.json";
import { Assessment } from "../../assessment";

@Component({
    templateUrl: "./summary.component.html",
})
export class SummaryComponent implements OnInit {
    @ViewChild("myTable") myTable: EuiTableComponent;
    @ViewChild("adjustementDialog") adjustementDialog: EuiDialogComponent;
    @ViewChild("progressBar") progressBar: EuiProgressBarModule;
    @ViewChild("resultBadge") resultBadge: EuiBadgeModule;
    @ViewChild("changeTextArea") changeTextArea: EuiTextAreaModule;
    @ViewChild("summaryPage", { static: true }) summaryPage: ElementRef;

    isTable1Visible: boolean = false;
    isTable2Visible: boolean = false;
    isChartVisible: boolean = false;
    chart: Chart;
    imageChart: string;
    dataSource1 = [];
    dataSource2 = [];
    data1: unknown[] = [];
    data2: unknown[] = [];
    labels: unknown[] = [];
    globalResult1: string = "";
    globalResult2: string = "";
    assessmentDescription1 = null;
    assessmentDescription2 = null;
    activeCategory: string = "";
    activeResult: string = "";
    x: number = 20;
    y: number = 20;

    currentAssessment: number = 1;

    isChangeJustified: boolean = false;

    newSpecification: string = this.dataService.get().newSpecification;

    emptyResult: Result = {
        resultString: "",
        resultValue: 0,
        category: "",
    };
    currentResult: Result = this.emptyResult;

    activeValue: number = 0;
    effortResult: string = "";

    textAreaValue: string = "";

    //progress bar values
    barProgress: number = 0;
    barVariant: string = "warning";
    isCompare: boolean = false;
    isComparingAssessments: boolean = false;

    adjustementResults = [
        {
            resultString: "No Selected",
            resultValue: 0,
            barProgress: 0,
            barVariant: "primary",
        },
        {
            resultString: "Incompatible",
            resultValue: 1,
            barProgress: 1,
            barVariant: "danger",
        },
        {
            resultString: "Considerably Incompatible",
            resultValue: 2,
            barProgress: 17,
            barVariant: "danger",
        },
        {
            resultString: "Considerably Medium Incompatible",
            resultValue: 3,
            barProgress: 34,
            barVariant: "warning",
        },
        {
            resultString: "Moderately Incompatible",
            resultValue: 4,
            barProgress: 51,
            barVariant: "warning",
        },
        {
            resultString: "Moderately Low Incompatible",
            resultValue: 5,
            barProgress: 67,
            barVariant: "warning",
        },
        {
            resultString: "Slightly Incompatible",
            resultValue: 6,
            barProgress: 83,
            barVariant: "success",
        },
        {
            resultString: "Not Incompatible",
            resultValue: 7,
            barProgress: 100,
            barVariant: "success",
        },
    ];

    constructor(
        @Inject(CONFIG_TOKEN) private config: EuiAppConfig,
        private dataService: DataService,
        public router: Router,
        private readonly http: HttpClient,
        private euiGrowlService: EuiGrowlService,
        public growlService: EuiGrowlService
    ) {}

    ngOnInit() {
        this.dataService.getAssessment();
        if (this.dataService.get().criteriaList.length == 0) {
            this.router.navigate(["/editor/home"]);
        }
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
        });

        const criteriaList: object[] = [];

        for (let h = 0; h < this.dataService.get().criteriaList.length; h++) {
            const element = this.dataService.get().criteriaList[h];
            criteriaList.push({
                title: element.title,
                questionId: element.questionId,
                answer: element.answer.toLowerCase(),
                effort: element.effort.toLowerCase(),
                additionalEffort: element.additionalEffort,
                impact: element.impact.toLowerCase(),
                additionalImpact: element.additionalImpact,
                additionalComments: element.additionalComments,
            });
        }

        const assessmentEditor = {
            assessmentDescription: this.dataService.get().assessmentDescription,
            name: this.dataService.get().name,
            organisation: this.dataService.get().organisation,
            email: this.dataService.get().email,
            criteriaList: criteriaList,
        };

        this.http.post("/assessment", assessmentEditor, { headers }).subscribe({
            next: (respuesta: Assessment) => {
                this.dataService.get().criteriaList = respuesta.criteriaList;
                this.dataService.get().resultList = respuesta.resultList;
                this.dataService.get().globalResult = respuesta.globalResult;

                for (let h = 0; h < respuesta.resultList.length; h++) {
                    const result = respuesta.resultList[h];
                    const findedSource = this.dataSource1.find(
                        (data) => data.category === result.category
                    );

                    if (!findedSource)
                        this.dataSource1.push({
                            category: result.category,
                            result: result.resultString,
                        });
                    else
                        Object.assign(findedSource, {
                            category: result.category,
                            result: result.resultString,
                        });

                    this.data1.push(result.resultValue);
                    if (!this.labels.includes(result.category))
                        this.labels.push(result.category);
                }
                this.assessmentDescription1 = respuesta.assessmentDescription;
                this.globalResult1 = respuesta.globalResult;
                this.isTable1Visible = true;
                this.isChartVisible = true;

                this.rellenaValoresAusentes(this.data1);

                this.createChart();
            },
            error: (error: unknown) => {
                console.error("ERROR " + JSON.stringify(error));
            },
        });

        if (this.dataService.get2().resultList.length > 0) {
            this.isCompare = true;
            this.isComparingAssessments = true;
            for (
                let h = 0;
                h < this.dataService.get2().resultList.length;
                h++
            ) {
                const result = this.dataService.get2().resultList[h];
                this.dataSource2.push({
                    category: result.category,
                    result: result.resultString,
                });
                this.data2.push(result.resultValue);
                if (!this.labels.includes(result.category))
                    this.labels.push(result.category);
            }
            this.assessmentDescription2 =
                this.dataService.get2().assessmentDescription;
            this.globalResult2 = this.dataService.get2().globalResult;
            this.isTable2Visible = true;
            this.rellenaValoresAusentes(this.data2);
            this.isChartVisible = true;
            this.createChart();
        }
    }

    onPreviousPressed() {
        if (this.isComparingAssessments)
            this.router.navigate(["/editor/compare"]);
        else this.router.navigate(["/editor/criteria"]);
    }

    createChart() {
        let datasets = [];
        if (this.data1.length > 0 && this.data2.length <= 0) {
            datasets = [
                {
                    label: this.dataService.get().newSpecification,
                    data: this.data1,
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    pointBackgroundColor: "rgba(255, 99, 132, 1)",
                },
            ];
        } else if (this.data1.length > 0 && this.data2.length > 0) {
            datasets = [
                {
                    label: this.dataService.get().newSpecification,
                    data: this.data1,
                    fill: true,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgb(255, 99, 132)",
                    pointBackgroundColor: "rgb(255, 99, 132)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgb(255, 99, 132)",
                },
                {
                    label: this.dataService.get2().newSpecification,
                    data: this.data2,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgb(54, 162, 235)",
                    pointBackgroundColor: "rgb(54, 162, 235)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgb(54, 162, 235)",
                },
            ];
        }

        if (this.chart) {
            this.chart.destroy();
        }

        // Create a new chart instance
        this.chart = new Chart("MyChart", {
            type: "radar",
            data: {
                labels: this.labels,
                datasets: datasets,
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3,
                    },
                },
            },
        });

        this.imageChart = this.chart.toBase64Image("image/png", 1);
    }

    rellenaValoresAusentes(data) {
        if (this.dataService.get().views.length > 0) {
            const vs: any = views["views"];
            vs.forEach((view) => {
                let encontrado = false;
                for (const label of this.labels) {
                    if (label == view.name) {
                        encontrado = true;
                        break;
                    }
                }
                if (!encontrado) {
                    this.labels.push(view.name);
                    data.push(0);
                }
            });
        } else {
            const ds: any = dimensions["dimensions"];
            ds.forEach((dimension) => {
                let encontrado = false;
                for (const label of this.labels) {
                    if (label === dimension.name) {
                        encontrado = true;
                        break;
                    }
                }
                if (!encontrado) {
                    this.labels.push(dimension.name);
                    data.push(-1);
                }
            });
        }
    }

    updateResult(result: string) {
        const resultInfo = this.adjustementResults.find(
            (adjustementResult) => adjustementResult.resultString === result
        );
        this.barProgress = resultInfo.barProgress;
        this.barVariant = resultInfo.barVariant;
        this.currentResult.resultString = resultInfo.resultString;
        this.currentResult.resultValue = resultInfo.resultValue;
    }

    showRequiredText() {
        this.euiGrowlService.growl(
            {
                severity: "warning",
                summary: "Warning",
                detail: "Please justify the change before changing the result",
            },
            false,
            false,
            3000,
            "bottom-right"
        );
    }

    onConfirmNewResult() {
        if (this.textAreaValue.length > 0) {
            this.isChangeJustified = true;
        } else {
            this.euiGrowlService.growl(
                {
                    severity: "warning",
                    summary: "Warning",
                    detail: "Please justify the change before changing the result",
                },
                false,
                false,
                3000,
                "bottom-right"
            );
            return;
        }
        if (this.currentAssessment === 1) this.confirmNewResult();
        else if (this.currentAssessment === 2) this.confirmNewResult2();
    }

    confirmNewResult() {
        this.dataService.setResultByCategory(
            this.activeCategory,
            this.currentResult
        );

        const newAdjustement: AdjustedResult = {
            category: this.currentResult.category,
            newResultString: this.currentResult.resultString,
            newResultValue: this.currentResult.resultValue,
            lastResultString: this.effortResult,
            explanation: this.textAreaValue,
        };

        this.dataService.get().adjustmentList.push(newAdjustement);

        const categoryResult = this.dataSource1.find(
            (data) => data.category == this.activeCategory
        );
        if (categoryResult) {
            categoryResult.result = this.currentResult.resultString;
        }
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
        });

        const assessmentEditor = {
            assessmentDescription: this.dataService.get().assessmentDescription,
            name: this.dataService.get().name,
            organisation: this.dataService.get().organisation,
            email: this.dataService.get().email,
            criteriaList: this.dataService.get().criteriaList,
            resultList: this.dataService.getResultList(),
            adjustmentList: this.dataService.get().adjustmentList,
            GlobalResult: this.dataService.get().globalResult,
        };

        this.textAreaValue = "";

        this.http
        .post("/update-assessment", assessmentEditor, { headers })
        .subscribe({
            next: (response: any) => {
                this.globalResult1 = response.globalResult;
                for (let i = 0; i < response.resultList.length; i++)
                    this.data1[i] = response.resultList[i].resultValue;
                this.createChart();
                this.dataService.saveAssessment();
                this.euiGrowlService.growl(
                    {
                        severity: "success",
                        summary: "Success",
                        detail: "The result has been changed succesfully",
                    },
                    false,
                    false,
                    3000,
                    "bottom-right"
                );
            },
            error: (error: any) => {
                console.error("ERROR " + JSON.stringify(error));
            },
        });
    }

    confirmNewResult2() {
        this.dataService.setResultByCategory2(
            this.activeCategory,
            this.currentResult
        );

        const newAdjustement: AdjustedResult = {
            category: this.currentResult.category,
            newResultString: this.currentResult.resultString,
            newResultValue: this.currentResult.resultValue,
            lastResultString: this.effortResult,
            explanation: this.textAreaValue,
        };

        this.dataService.get2().adjustmentList.push(newAdjustement);

        const categoryResult = this.dataSource2.find(
            (data) => data.category == this.activeCategory
        );
        if (categoryResult) {
            categoryResult.result = this.currentResult.resultString;
        }
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
        });

        const assessmentEditor = {
            assessmentDescription:
                this.dataService.get2().assessmentDescription,
            name: this.dataService.get2().name,
            organisation: this.dataService.get2().organisation,
            email: this.dataService.get2().email,
            criteriaList: this.dataService.get2().criteriaList,
            resultList: this.dataService.getResultList2(),
            adjustmentList: this.dataService.get2().adjustmentList,
            GlobalResult: this.dataService.get2().globalResult,
        };

        this.textAreaValue = "";

        this.http
        .post("/update-assessment", assessmentEditor, { headers })
        .subscribe({
            next: (response: any) => {
                this.globalResult2 = response.globalResult;
                for (let i = 0; i < response.resultList.length; i++)
                    this.data2[i] = response.resultList[i].resultValue;
                this.createChart();
                this.dataService.saveAssessment();
                this.euiGrowlService.growl(
                    {
                        severity: "success",
                        summary: "Success",
                        detail: "The result has been changed succesfully",
                    },
                    false,
                    false,
                    3000,
                    "bottom-right"
                );
            },
            error: (error: any) => {
                console.error("ERROR " + JSON.stringify(error));
            },
        });
    }

    public onRowEdit(row: any, assesmentId: number) {
        this.adjustementDialog.openDialog();
        this.currentAssessment = assesmentId;
        this.activeCategory = row.category;
        this.effortResult = row.result;
        if (assesmentId === 2) {
            this.currentResult = this.dataService.getResultByCategory2(
                this.activeCategory
            );
        } else {
            this.currentResult = this.dataService.getResultByCategory(
                this.activeCategory
            );
        }
        this.updateResult(this.currentResult.resultString);
    }

    download(assessmentId: number) {
        let data;
        if (assessmentId === 2) data = this.dataService.get2();
        else data = this.dataService.get();
        const fileName = "assessment";
        const exportType = exportFromJSON.types.json;

        exportFromJSON({ data, fileName, exportType });
    }

    public onAcceptButtonDisable(): void {
        this.adjustementDialog.disableAcceptButton();
    }

    exportPDFNewAssessment() {
        const specificationName = this.dataService.get().rieName;
        const globalResult = this.dataService.get().globalResult;
        const doc = new jsPDF("p", "mm", "a4");
        const img = new Image();
        img.src = "../../../../assets/CAMSS Logo 2024.png";

        doc.addImage(img, "png", 75, 60, 65, 65);
        doc.setFont("helvetica", "bold");
        doc.text("CAMSS Incompatibility scenario", 65, 135);
        doc.text("Reference interoperatibily enviroment ", 58, 145);
        doc.text(specificationName, 58, 155);
        doc.addPage();

        this.x = 20;
        this.y = 20;

        let index: string =
            "\tTable of contents\n\n\t1.	Introduction\n\t2.	Assessment Summary\n\t\t";
        if (this.dataService.get().views.length > 0) {
            let h = 1;
            for (const view of this.dataService.get().views) {
                index = index + "2." + h + ".	" + view + "\n\t\t";
                h = h + 1;
            }
            index = index.slice(0, index.length - 1);
            index = index + "3.	Assessments Results";
        } else if (this.dataService.get().dimensions.length > 0) {
            let h = 1;
            for (const view of this.dataService.get().dimensions) {
                index = index + "2." + h + ".	" + view + "\n\t\t";
                h = h + 1;
            }
            index = index.slice(0, index.length - 1);
            index = index + "3.	Assessments Results";
        }

        doc.setFontSize(11);
        doc.cell(this.x, this.y, 170, 52, index, 0.1, "center");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.x = this.x + 10;
        this.y = this.y + 60;
        doc.text("Introduction", 30, this.y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1Introduction =
            "This report presents the findings from the CAMSS incompatibility assessment scenario, aimed at evaluating the impact of integrating new specifications or standards into an existing environment, referred to as the AS-IS environment. The primary objective is to determine whether these integrations threaten the interoperability of the environment with existing data and information exchange solutions. This assessment helps anticipate how the integration of new digital business capabilities or updated interoperability requirements might shape the future TO-BE Environment, aligning with desired interoperability outcomes.";
        this.y = this.y + 6;
        doc.text(p1Introduction, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 40;
        doc.text("Assessment summary", this.x, this.y); //125

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1AssessmentSummary =
            "This section provides a consolidated overview of the CAMSS incompatibility assessment conducted on the integration of " +
            specificationName +
            " into the RIE. It summarizes key findings from the evaluation of selected aspects of interoperability within the AS-IS environment.";
        this.y = this.y + 6;
        doc.text(p1AssessmentSummary, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });

        const positiveResult: boolean = true;
        const p2AssessmentSummary: string =
            "Upon concluding the assessment, it has been determined that the integration of " +
            specificationName +
            " into the RIE can be considered: ";
        this.y = this.y + 20;
        doc.text(p2AssessmentSummary, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        const p3AssessmentSummary: string = globalResult;
        this.y = this.y + 10;
        doc.setFont("helvetica", "bold");
        doc.text(p3AssessmentSummary, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        let p4AssessmentSummary: string = "";
        if (positiveResult) {
            p4AssessmentSummary =
                p4AssessmentSummary +
                "This outcome identifies the extent to which the new specification aligns with the interoperability of the existing environment. ";
        } else {
            p4AssessmentSummary =
                p4AssessmentSummary +
                "This outcome identifies the extent to which the new specification challenges the interoperability of the existing environment. ";
        }
        p4AssessmentSummary =
            p4AssessmentSummary +
            "The detailed analysis herein serves as a critical tool for understanding the implications of adopting " +
            specificationName +
            " within the current operational environment.";
        this.y = this.y + 6;
        doc.setFont("helvetica", "normal");
        doc.text(p4AssessmentSummary, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });

        const body: RowInput[] = [];

        if (this.dataService.get().views.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor("#0D0D0D");
            const p1Views =
                "Within the following subsections, the result per LOST view assessed will shown. ";
            this.y = this.y + 20;
            doc.text(p1Views, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });

            for (
                let index = 0;
                index < this.dataService.get().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get().resultList[index];
                const result = resultList.resultString;
                if (resultList.category == "Legal View") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Legal view", this.x, this.y); //202
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1LegalView =
                        "The results of the incompatibility assessment for the Legal view are the following.";
                    this.y = this.y + 6;
                    doc.text(p1LegalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2LegalView: string = "Result: " + result;
                    this.y = this.y + 6;
                    doc.text(p2LegalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, resultList.category, result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (resultList.category == "Organisational View") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Organisational  view", this.x, this.y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1OrganisationalView =
                        "The following section outlines the assessment results for the Organisational view.";
                    this.y = this.y + 6;
                    doc.text(p1OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2OrganisationalView: string = "Result: " + result;
                    this.y = this.y + 6;
                    doc.text(p2OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, resultList.category, result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (resultList.category == "Semantic View") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Semantic  view", this.x, this.y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1OrganisationalView =
                        "Detailed below is the summary of the incompatibility assessment concerning the Semantic view.";
                    this.y = this.y + 6;
                    doc.text(p1OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2OrganisationalView: string = "Result: " + result;
                    this.y = this.y + 12;
                    doc.text(p2OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, resultList.category, result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Application View") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Technical Application  view", this.x, this.y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1OrganisationalView =
                        "The results of the incompatibility assessment for the Technical Application view are the following.";
                    this.y = this.y + 6;
                    doc.text(p1OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2OrganisationalView: string = "Result: " + result;
                    this.y = this.y + 12;
                    doc.text(p2OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, resultList.category, result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Infraestructure View") {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Technical Infrastucture view", this.x, this.y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1OrganisationalView =
                        "The following section outlines the assessment results for the Technical Infrastructure view.";
                    this.y = this.y + 6;
                    doc.text(p1OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2OrganisationalView: string = "Result: " + result;
                    this.y = this.y + 12;
                    doc.text(p2OrganisationalView, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, resultList.category, result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
            }
        } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor("#0D0D0D");
            const p1Views =
                "Within this section, the result per interoperability dimension selected will be shown. ";
            this.y = this.y + 20;
            doc.text(p1Views, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });

            for (
                let index = 0;
                index < this.dataService.get().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get().resultList[index];
                const result = resultList.resultString;
                if (
                    resultList.category ==
                    "Structural Interoperability Dimension"
                ) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Structural Dimension", this.x, this.y); //202
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1Dimension =
                        "In relation to the Structural Dimension, the assessment highlights the following.";
                    this.y = this.y + 6;
                    doc.text(p1Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2Dimension: string = "Result: " + result;
                    this.y = this.y + 6;
                    doc.text(p2Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, "Structural Dimension", result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Behavieoural Interoperability Dimension"
                ) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Behavioural Dimension", this.x, this.y); //202
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1Dimension =
                        "As for the Behavioural Dimension, the assessment delineates the following.";
                    this.y = this.y + 6;
                    doc.text(p1Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2Dimension: string = "Result: " + result;
                    this.y = this.y + 6;
                    doc.text(p2Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, "Behavioural Dimension", result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Governance Interoperability Dimension"
                ) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.setTextColor("#2F5496");
                    if (index == 0) {
                        this.y = this.y + 6;
                    } else {
                        this.y = this.y + 13;
                    }
                    doc.text("Governance Dimension", this.x, this.y); //202
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor("#0D0D0D");
                    const p1Dimension =
                        "Concerning the Governance Dimension, the following findings are noted.";
                    this.y = this.y + 6;
                    doc.text(p1Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "bold");
                    const p2Dimension: string = "Result: " + result;
                    this.y = this.y + 6;
                    doc.text(p2Dimension, this.x, this.y, {
                        align: "justify",
                        maxWidth: 150,
                    });
                    doc.setFont("helvetica", "normal");
                    this.writeResults(doc, "Governance Dimension", result, 0);
                    if (
                        this.y > 262 &&
                        index + 1 < this.dataService.get().resultList.length
                    ) {
                        doc.addPage();
                        this.y = 20;
                    }
                    body.push([resultList.category, result]);
                }
            }
        }

        doc.addPage();
        this.y = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");

        doc.text("Assessments Results", this.x, this.y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1Results =
            "This section depicts the incompatibility assessment results of the specification " +
            this.dataService.get().newSpecification +
            ". The “Incompatibility” indicator measures the No Incompatibility or Incompatibility of the assessed specification " +
            this.dataService.get().newSpecification +
            " in regards to the applicable criteria";
        this.y = this.y + 6;
        doc.text(p1Results, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        doc.setFont("helvetica", "bold");
        const p2Results = "The assessment is " + globalResult;
        this.y = this.y + 19;
        doc.text(p2Results, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        this.y = this.y + 12;
        doc.setFont("helvetica", "normal");
        autoTable(doc, {
            startY: this.y,
            head: [["Category", "Incompatibility result"]],
            body: body,
            theme: "striped",
            headStyles: {
                fillColor: "#343a40",
            },
        });

        if (this.imageChart) {
            doc.addImage(this.imageChart, "jpeg", 5, 110, 200, 200);
        }

        return doc.save("assessment");
    }

    public writeResults(
        doc: jsPDF,
        view: string,
        result: string,
        firstY: number
    ) {
        let p2View = "";

        switch (result) {
            case "Not Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "The assessment finds that the integration is not incompatible, showing compatibility within the " +
                    view +
                    ". ";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Slightly Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "Only Slightly Incompatible is detected within the " +
                    view +
                    ", indicating minimal impact on overall interoperability.";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Moderately Low Incompatible":
                this.y = this.y + firstY;

                p2View =
                    "The specification presents Moderately Low Incompatible within the " +
                    view +
                    ", suggesting minor challenges that require attention.";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Moderately Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "Moderately Incompatible has been identified in the " +
                    view +
                    ", pointing to notable issues that impact integration.";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Considerably Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "Considerably Incompatible is observed within the " +
                    view +
                    ", which severely limits the specification’s integration capabilities.";
                this.y = this.y + 6;
                doc.text(p2View, this.x + 10, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Considerably Medium Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "The " +
                    view +
                    " exhibits Considerably Medium Incompatible, indicating significant challenges that may hinder effective interoperability.";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Incompatible":
                this.y = this.y + firstY;
                p2View =
                    "The specification is found to be incompatible for the " +
                    view +
                    ", indicating fundamental conflicts that prevent integration.";
                this.y = this.y + 6;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            default:
                break;
        }
    }

    exportPDFCompare() {
        const rieName1 = this.dataService.get().rieName;
        const rieName2 = this.dataService.get2().rieName;
        const specificationName1 = this.dataService.get().newSpecification;
        const specificationName2 = this.dataService.get2().newSpecification;
        const globalResult1 = this.dataService.get().globalResult;
        const globalResult2 = this.dataService.get2().globalResult;
        const doc = new jsPDF("p", "mm", "a4");
        const img = new Image();
        img.src = "../../../../assets/CAMSS Logo 2024.png";
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        doc.addImage(img, "png", 75, 60, 65, 65);
        doc.setFont("helvetica", "bold");
        
        doc.text("CAMSS Incompatibility scenario", pageWidth / 2, 135, {'align' : 'center'} );
        doc.text("Compare incompatibility assessment of ", pageWidth / 2, 145, {'align' : 'center'} );
        doc.text(specificationName1 , pageWidth / 2, 155, {'align' : 'center'} );
        doc.text(" and ", pageWidth / 2, 165, {'align' : 'center'} );
        doc.text(specificationName2, pageWidth / 2, 175, {'align' : 'center'} );
        
        doc.addPage();

        this.x = 20;
        this.y = 20;

        const indexString: string =
            "\tTable of contents\n\n\t1.	Introduction\n\t2.	Assessment summary per specification\n\t\t1.	" +
            specificationName1 +
            "\n\t\t2.	" +
            specificationName2 +
            "\n\t3.	Assessments Results";
        doc.setFontSize(11);
        doc.cell(this.x, this.y, 170, 52, indexString, 0.1, "center");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.x = this.x + 10;
        this.y = this.y + 60;
        doc.text("Introduction", 30, this.y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1Introduction =
            "This report presents the findings from the CAMSS incompatibility assessment scenario, aimed at evaluating the impact of integrating new specifications or standards into an existing environment, referred to as the AS-IS environment. The primary objective is to determine whether these integrations threaten the interoperability of the environment with existing data and information exchange solutions. This assessment helps anticipate how the integration of new digital business capabilities or updated interoperability requirements might shape the future TO-BE Environment, aligning with desired interoperability outcomes.";
        this.y = this.y + 6;
        doc.text(p1Introduction, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 40;
        doc.text("Assessment summary per specification", this.x, 125); //125

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1AssessmentSummary =
            "This section provides a consolidated overview of the comparison of the assessments performed using the CAMSS Incompatibility Scenario for the following specifications:";
        this.y = this.y + 6;
        doc.text(p1AssessmentSummary, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 15;
        doc.text(specificationName1, this.x, this.y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        this.writeGlobalResultsCompare(doc, globalResult1, 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 15;
        doc.text(specificationName2, this.x, this.y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        this.writeGlobalResultsCompare(doc, globalResult2, 6);

        this.overallSummaryComparison(
            doc,
            rieName1,
            globalResult1,
            rieName2,
            globalResult2
        );

        const body1: RowInput[] = [];
        if (this.dataService.get().views.length > 0) {
            for (
                let index = 0;
                index < this.dataService.get().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get().resultList[index];
                const result = resultList.resultString;
                if (resultList.category == "Legal View") {
                    body1.push([resultList.category, result]);
                }
                if (resultList.category == "Organisational View") {
                    body1.push([resultList.category, result]);
                }
                if (resultList.category == "Semantic View") {
                    body1.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Application View") {
                    body1.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Infraestructure View") {
                    body1.push([resultList.category, result]);
                }
            }
        } else {
            for (
                let index = 0;
                index < this.dataService.get().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get().resultList[index];
                const result = resultList.resultString;
                if (
                    resultList.category ==
                    "Structural Interoperability Dimension"
                ) {
                    body1.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Behavieoural Interoperability Dimension"
                ) {
                    body1.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Governance Interoperability Dimension"
                ) {
                    body1.push([resultList.category, result]);
                }
            }
        }

        const body2: RowInput[] = [];
        if (this.dataService.get2().views.length > 0) {
            for (
                let index = 0;
                index < this.dataService.get2().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get2().resultList[index];
                const result = resultList.resultString;
                if (resultList.category == "Legal View") {
                    body2.push([resultList.category, result]);
                }
                if (resultList.category == "Organisational View") {
                    body2.push([resultList.category, result]);
                }
                if (resultList.category == "Semantic View") {
                    body2.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Application View") {
                    body2.push([resultList.category, result]);
                }
                if (resultList.category == "Technical-Infraestructure View") {
                    body2.push([resultList.category, result]);
                }
            }
        } else {
            for (
                let index = 0;
                index < this.dataService.get2().resultList.length;
                index++
            ) {
                const resultList: Result =
                    this.dataService.get2().resultList[index];
                const result = resultList.resultString;
                if (
                    resultList.category ==
                    "Structural Interoperability Dimension"
                ) {
                    body2.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Behavieoural Interoperability Dimension"
                ) {
                    body2.push([resultList.category, result]);
                }
                if (
                    resultList.category ==
                    "Governance Interoperability Dimension"
                ) {
                    body2.push([resultList.category, result]);
                }
            }
        }

        doc.addPage();
        this.y = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");

        doc.text("Assessments Results", this.x, this.y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#0D0D0D");
        const p1Results =
            "This section depicts the incompatibility assessment results of the specification " +
            specificationName1 +
            ". The “Incompatibility” indicator measures the No Incompatibility or Incompatibility of the assessed specification " +
            specificationName2 +
            " in regards to the applicable criteria";
        this.y = this.y + 6;
        doc.text(p1Results, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        const p2Results = "The assessment is " + globalResult1;
        this.y = this.y + 19;
        doc.text(p2Results, this.x, this.y, {
            align: "justify",
            maxWidth: 150,
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 10;
        doc.text(specificationName1, this.x, this.y);
        this.y = this.y + 5;
        autoTable(doc, {
            startY: this.y,
            head: [["Category", "Incompatibility result"]],
            body: body1,
            theme: "striped",
            headStyles: {
                fillColor: "#343a40",
            },
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 55;
        doc.text(specificationName2, this.x, this.y);
        this.y = this.y + 5;
        autoTable(doc, {
            startY: this.y,
            head: [["Category", "Incompatibility result"]],
            body: body2,
            theme: "striped",
            headStyles: {
                fillColor: "#343a40",
            },
        });
        this.y = this.y + 50;
        if (this.imageChart) {
            doc.addImage(this.imageChart, "jpeg", 35, 170, 140, 140);
        }

        return doc.save("assessment");
    }

    public writeGlobalResultsCompare(
        doc: jsPDF,
        result: string,
        firstY: number
    ) {
        let p2View = "";
        let p3View = "";

        p2View = result;
        switch (result) {
            case "Not Incompatible":
                this.y = this.y + firstY;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                p3View =
                    "The overall assessment indicates that the integration is not incompatible, demonstrating compatibility across various aspects.";
                this.y = this.y + 6;
                doc.text(p3View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            case "Incompatible":
                this.y = this.y + firstY;
                doc.text(p2View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                p3View =
                    "The overall assessment finds the specification incompatible, highlighting fundamental conflicts that prevent integration.";
                this.y = this.y + 6;
                doc.text(p3View, this.x, this.y, {
                    align: "justify",
                    maxWidth: 150,
                });
                break;
            default:
                break;
        }
    }

    public overallSummaryComparison(
        doc: jsPDF,
        specificationName1: string,
        result1: string,
        specificationName2: string,
        result2: string
    ) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#2F5496");
        this.y = this.y + 15;
        doc.text("Overall summary comparison", this.x, this.y);

        let p1View = "";
        if (result1 == "Not Incompatible" && result2 == "Incompatibility") {
            p1View =
                "The assessment reveals that the " +
                specificationName1 +
                " demonstrates 'Not Incompatibility', while the " +
                specificationName2 +
                " exhibits 'Incompatibility'. This comparison underscores the superiority of 'Not Incompatibility' as it signifies complete alignment and compatibility without fundamental conflicts, whereas 'Incompatibility' indicates critical issues that prevent integration.";
            this.y = this.y + 6;
            doc.setTextColor("#0D0D0D");
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(p1View, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });
        } else if (
            result1 == "Incompatible" &&
            result2 == "Not Incompatible"
        ) {
            p1View =
                "In the assessment, both the " +
                specificationName1 +
                " and the " +
                specificationName2 +
                " exhibit 'Incompatibility', highlighting critical issues that impede the implementation of the specifications within the same reference integration environment. This situation underscores significant conflicts and discrepancies, posing substantial challenges to achieving synergy and collaboration between the specifications.";

            this.y = this.y + 6;
            doc.setTextColor("#0D0D0D");
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(p1View, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });
        } else if (
            result1 == "Not Incompatible" &&
            result2 == "Not Incompatible"
        ) {
            p1View =
                "In the evaluation, both the " +
                specificationName1 +
                " and the " +
                specificationName2 +
                " demonstrate a state of 'Not Incompatibility', indicating complete alignment and compatibility within the same reference integration environment. This congruence suggests a harmonious relationship between the specifications, facilitating seamless implementation and collaboration with no inherent conflicts.";
            this.y = this.y + 6;
            doc.setTextColor("#0D0D0D");
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(p1View, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });
        } else if (
            result1 == "Incompatible" &&
            result2 == "Incompatible"
        ) {
            p1View =
                "The overall assessment indicates that the integration is not incompatible, demonstrating compatibility across various aspects.";
            this.y = this.y + 6;
            doc.setTextColor("#0D0D0D");
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(p1View, this.x, this.y, {
                align: "justify",
                maxWidth: 150,
            });
        }
    }
}
