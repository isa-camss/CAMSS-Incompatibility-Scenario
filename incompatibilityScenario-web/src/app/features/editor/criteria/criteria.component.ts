import {
    Component,
    OnInit,
    ViewChild,
    ChangeDetectionStrategy,
} from "@angular/core";
import { DataService } from "src/app/features/data.service";
import questionsPerViews from "src/assets/questionsPerViews.json";
import examplesPerViews from "src/assets/examplesPerViews.json";
import examplesPerDimensions from "src/assets/examplesPerDimensions.json";
import questionsPerDimensions from "src/assets/questionsPerDimensions.json";
import { EuiTabComponent, EuiTabsComponent } from "@eui/components/eui-tabs";
import { EuiButtonComponent } from "@eui/components/eui-button";
import { EuiDialogComponent } from "@eui/components/eui-dialog";
import { Criteria } from "../criteria";
import { Router } from "@angular/router";
import exportFromJSON from "export-from-json";

@Component({
    templateUrl: "./criteria.component.html",
    styleUrls: ["./criteria.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteriaComponent implements OnInit {
    titles = [];
    questions = [];
    examples = [];
    assessment: Map<string, Array<Criteria>> = new Map([]);

    answers = [
        { id: "1", name: "yes", checked: "NO" },
        { id: "2", name: "no", checked: "NO" },
    ];

    efforts = [
        { id: "4", name: "low", checked: "NO" },
        { id: "5", name: "medium", checked: "NO" },
        { id: "6", name: "high", checked: "NO" },
        { id: "7", name: "none", checked: "NO" },
    ];

    impacts = [
        { id: "8", name: "low", checked: "NO" },
        { id: "9", name: "medium", checked: "NO" },
        { id: "10", name: "high", checked: "NO" },
        { id: "11", name: "none", checked: "NO" },
    ];

    disablePrevious = true;
    isNextVisible = true;
    isFinishVisible = false;
    missingQuestions: {
        questionId: number;
        title: string;
        questionText;
        disclaimer?: boolean;
    }[] = [];
    newSpecification: string = this.dataService.get().newSpecification;

    isViews: boolean = true;
    forms = 0;
    tabs = 0;

    @ViewChild("euiTabs") euiTabs: EuiTabsComponent;
    @ViewChild("euiButtonNext") euiButtonNext: EuiButtonComponent;
    @ViewChild("dialog") dialog: EuiDialogComponent;

    tabPosition = 0;

    constructor(private dataService: DataService, public router: Router) {}

    ngOnInit() {
        this.dataService.getAssessment();
        if (
            this.dataService.get().views.length == 0 &&
            this.dataService.get().dimensions.length == 0
        ) {
            this.router.navigate(["/editor/home"]);
        }
        this.loadQuestions();
    }

    loadQuestions() {
        if (this.dataService.get().dimensions.length) {
            this.isViews = false;
            this.tabs = this.dataService.get().dimensions.length;
            this.titles = this.dataService.get().dimensions;

            for (let h = 0; h < this.titles.length; h++) {
                const title = this.titles[h];
                this.assessment[title] = [];
                this.questions[title] = questionsPerDimensions[title].map(
                    (element, index) => ({
                        id: index,
                        text: element,
                    })
                );
                this.examples[title] = examplesPerDimensions[title].map(
                    (example, index) => ({
                        id: index,
                        text: example,
                    })
                );
                this.forms = questionsPerDimensions[title].length;
            }
        } else {
            this.isViews = true;
            this.tabs = this.dataService.get().views.length;
            this.titles = this.dataService.get().views;

            for (let h = 0; h < this.titles.length; h++) {
                const title = this.titles[h];
                this.assessment[title] = [];
                this.questions[title] = questionsPerViews[title].map(
                    (element, index) => ({
                        id: index,
                        text: element,
                    })
                );
                this.examples[title] = examplesPerViews[title].map(
                    (example, index) => ({
                        id: index,
                        text: example,
                    })
                );
                this.forms = questionsPerViews[title].length;
            }
        }
        if (this.tabs === 1) {
            this.isNextVisible = false;
            this.isFinishVisible = true;
        }
    }

    next(): void {
        if (this.tabPosition < 5) {
            this.tabPosition++;
            this.euiTabs.changeTab(this.tabPosition);
        }
        if (this.tabPosition + 1 == this.euiTabs.tabs.length) {
            this.isNextVisible = false;
            this.isFinishVisible = true;
        }
        if (this.tabPosition > 0) {
            this.disablePrevious = false;
        }

        //Script para scroll al top when Next-Previous
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }

    previous(): void {
        this.tabPosition--;
        if (this.tabPosition == 0) {
            this.disablePrevious = true;
        }
        if (this.tabPosition + 1 < this.euiTabs.tabs.length) {
            this.isNextVisible = true;
            this.isFinishVisible = false;
        }
        this.euiTabs.changeTab(this.tabPosition);

        //Script para scroll al top when Next-Previous
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }

    finish(): void {
        if (this.validate()) {
            this.dataService.saveAssessment();
            this.router.navigate(["/report"]);
        } else {
            console.error("No valid");
        }
    }

    download() {
        const data = this.dataService.get();
        const fileName = "assessment";
        const exportType = exportFromJSON.types.json;

        exportFromJSON({ data, fileName, exportType });
    }

    onTabSelect(event: { tab: EuiTabComponent; index: number }): void {
        this.tabPosition = event.index;
        if (this.euiTabs.tabs.length === 1) {
            this.isNextVisible = false;
            this.isFinishVisible = true;
        } else {
            if (this.tabPosition + 1 === this.euiTabs.tabs.length) {
                this.isNextVisible = false;
                this.isFinishVisible = true;
            } else {
                this.isNextVisible = true;
                this.isFinishVisible = false;
            }
        }
        if (this.tabPosition > 0) {
            this.disablePrevious = false;
        } else {
            this.disablePrevious = true;
        }
    }

    childEvent(criteria: Criteria): void {
        const criteriaList = this.dataService.get().criteriaList;
        const findquestion = criteriaList.find(
            (foundCriteria) =>
                foundCriteria.title === criteria.title &&
                foundCriteria.questionId === criteria.questionId
        );

        if (findquestion) {
            Object.assign(findquestion, criteria);
        } else {
            criteriaList.push(criteria);
        }
        if (criteriaList.length == this.forms * this.tabs) {
            this.isNextVisible = false;
            this.isFinishVisible = true;
        }
    }

    validate(): boolean {
        let result = true;
        const criteriaList = this.dataService.get().criteriaList;
        const expectedQuestions = this.tabs * this.forms;
        this.missingQuestions = [];

        if (criteriaList.length < expectedQuestions) {
            result = false;
        }

        for (
            let sectionIndex = 0;
            sectionIndex < this.titles.length;
            sectionIndex++
        ) {
            const sectionTitle = this.titles[sectionIndex];
            let questionsInSection;
            if (!this.isViews)
                questionsInSection = questionsPerDimensions[sectionTitle];
            else questionsInSection = questionsPerViews[sectionTitle];
            for (
                let questionIdInSection = 0;
                questionIdInSection < questionsInSection.length;
                questionIdInSection++
            ) {
                let found = false;
                for (const criteria of criteriaList) {
                    if (
                        criteria.title === sectionTitle &&
                        criteria.questionId === questionIdInSection
                    ) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    const questionText =
                        questionsInSection[questionIdInSection];
                    this.missingQuestions.push({
                        questionId: questionIdInSection,
                        title: sectionTitle,
                        questionText: questionText,
                    });
                }
            }
        }

        if (this.missingQuestions.length > 0) {
            result = false;
        }

        for (const criteria of criteriaList) {
            if (!criteria.answer) {
                let questionText = "";
                if (!this.isViews)
                    questionText =
                        questionsPerDimensions[criteria.title][
                            criteria.questionId
                        ];
                else
                    questionText =
                        questionsPerViews[criteria.title][criteria.questionId];
                this.missingQuestions.push({
                    questionId: criteria.questionId,
                    title: criteria.title,
                    questionText: questionText,
                });
                result = false;
            }
            if (criteria.answer === "Yes") {
                if (
                    (criteria.effort === "Medium" &&
                        criteria.impact === "None") ||
                    (criteria.effort === "High" && criteria.impact === "None")
                ) {
                    let questionText = "";
                    if (!this.isViews)
                        questionText =
                            questionsPerDimensions[criteria.title][
                                criteria.questionId
                            ];
                    else
                        questionText =
                            questionsPerViews[criteria.title][
                                criteria.questionId
                            ];
                    this.missingQuestions.push({
                        questionId: criteria.questionId,
                        title: criteria.title,
                        questionText: questionText,
                        disclaimer: true,
                    });
                    result = false;
                }
                if (!criteria.effort || !criteria.impact) {
                    let questionText = "";
                    if (!this.isViews)
                        questionText =
                            questionsPerDimensions[criteria.title][
                                criteria.questionId
                            ];
                    else
                        questionText =
                            questionsPerViews[criteria.title][
                                criteria.questionId
                            ];
                    this.missingQuestions.push({
                        questionId: criteria.questionId,
                        title: criteria.title,
                        questionText: questionText,
                    });
                    result = false;
                }
            }
        }
        if (!result) {
            this.dialog.openDialog();
        }
        return result;
    }

    public previousComponent(): void {
        if (this.dataService.get().views.length > 0) {
            this.router.navigate(["/editor/selectViews"]);
        } else {
            this.router.navigate(["/editor/selectDimensions"]);
        }
    }
}
