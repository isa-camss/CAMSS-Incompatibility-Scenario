import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { DataService } from "src/app/features/data.service";
import { FormBuilder } from "@angular/forms";
import { Criteria } from "../criteria";
import {
    EuiMessageBoxConfig,
    EuiMessageBoxService,
} from "@eui/components/eui-message-box";

@Component({
    selector: "app-criteria-details",
    templateUrl: "./criteriaDetails.component.html",
})
export class CriteriaDetailsComponent implements OnInit {
    contactForm;
    result;

    answers = [
        { id: "1", name: "Yes", checked: "NO" },
        { id: "2", name: "No", checked: "NO" },
        { id: "3", name: "Not applicable", checked: "NO" },
    ];

    efforts = [
        { id: "4", name: "Low", checked: "NO" },
        { id: "5", name: "Medium", checked: "NO" },
        { id: "6", name: "High", checked: "NO" },
        { id: "7", name: "None", checked: "NO" },
    ];

    impacts = [
        { id: "4", name: "Low", checked: "NO" },
        { id: "5", name: "Medium", checked: "NO" },
        { id: "6", name: "High", checked: "NO" },
        { id: "7", name: "None", checked: "NO" },
    ];

    criteria: Criteria = {
        title: "",
        questionId: -1,
        answer: "",
        effort: "",
        additionalEffort: "",
        impact: "",
        additionalImpact: "",
        additionalComments: "",
        result: "",
    };

    @Output() parentEvent: EventEmitter<Criteria> = new EventEmitter();
    @Input() questionText: string;
    @Input() exampleText: string;
    @Input() questionId: number;
    @Input() title: string;

    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private euiMessageBoxService: EuiMessageBoxService
    ) {
        this.contactForm = this.formBuilder.group({
            answer: [""],
            effort: [""],
            additionalEffort: [""],
            impact: [""],
            additionalImpact: [""],
            additionalComments: [""],
        });
    }

    ngOnInit() {
        this.initValues();
        this.checkForm();
        this.contactForm
        .get("answer")
        .valueChanges.subscribe((selectedValue) => {
            if (
                selectedValue == "No" ||
                selectedValue == "Not Applicable" ||
                selectedValue == "Not applicable"
            ) {
                this.contactForm.get("effort").disable();
                this.contactForm.get("additionalEffort").disable();
                this.contactForm.get("impact").disable();
                this.contactForm.get("additionalImpact").disable();
            } else if (selectedValue == "Yes") {
                this.contactForm.get("effort").enable();
                this.contactForm.get("additionalEffort").enable();
                this.contactForm.get("impact").enable();
                this.contactForm.get("additionalImpact").enable();
            }
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.answer = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
        this.contactForm
        .get("effort")
        .valueChanges.subscribe((selectedValue) => {
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.effort = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
        this.contactForm
        .get("additionalEffort")
        .valueChanges.subscribe((selectedValue) => {
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.additionalEffort = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
        this.contactForm
        .get("impact")
        .valueChanges.subscribe((selectedValue) => {
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.impact = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
        this.contactForm
        .get("additionalImpact")
        .valueChanges.subscribe((selectedValue) => {
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.additionalImpact = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
        this.contactForm
        .get("additionalComments")
        .valueChanges.subscribe((selectedValue) => {
            this.criteria.title = this.title;
            this.criteria.questionId = this.questionId;
            this.criteria.additionalComments = selectedValue;
            this.parentEvent.emit(this.criteria);
        });
    }

    initValues() {
        const assessmentAnswers = this.dataService.get();
        assessmentAnswers.criteriaList.forEach((answer) => {
            const capitalizedAnswer = {
                title: answer.title,
                result: answer.result,
                questionId: answer.questionId,
                answer: this.capitalizeFirstLetter(answer.answer),
                effort: this.capitalizeFirstLetter(answer.effort),
                additionalEffort: this.capitalizeFirstLetter(
                    answer.additionalEffort
                ),
                impact: this.capitalizeFirstLetter(answer.impact),
                additionalImpact: this.capitalizeFirstLetter(
                    answer.additionalImpact
                ),
                additionalComments: this.capitalizeFirstLetter(
                    answer.additionalComments
                ),
            };
            if (
                answer.questionId === this.questionId &&
                answer.title === this.title
            ) {
                this.contactForm = this.formBuilder.group({
                    answer: [capitalizedAnswer.answer],
                    effort: [capitalizedAnswer.effort],
                    additionalEffort: [capitalizedAnswer.additionalEffort],
                    impact: [capitalizedAnswer.impact],
                    additionalImpact: [capitalizedAnswer.additionalImpact],
                    additionalComments: [capitalizedAnswer.additionalComments],
                });
                this.criteria = capitalizedAnswer;
                this.parentEvent.emit(this.criteria);
            }
        });
    }

    checkForm() {
        const valueForm = this.contactForm.get("answer").value;
        if (valueForm === "Yes") {
            this.contactForm.get("effort").enable();
            this.contactForm.get("additionalEffort").enable();
            this.contactForm.get("impact").enable();
            this.contactForm.get("additionalImpact").enable();
        } else {
            this.contactForm.get("effort").disable();
            this.contactForm.get("additionalEffort").disable();
            this.contactForm.get("impact").disable();
            this.contactForm.get("additionalImpact").disable();
        }
    }

    capitalizeFirstLetter(word: string): string {
        if (!word) {
            return "";
        }

        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    openViewInformationModal(view: string) {
        const info = new EuiMessageBoxConfig({
            title: "Example",
            content: view,
            hasDismissButton: false,
            acceptLabel: "OK",
        });

        this.euiMessageBoxService.openMessageBox(info);
    }
}
