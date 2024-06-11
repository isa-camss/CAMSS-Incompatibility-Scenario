import { Component, ViewChild, Input, OnInit } from "@angular/core";
import { EuiProgressBarModule } from "@eui/components/eui-progress-bar";

@Component({
    selector: "app-progress-bar",
    templateUrl: "./progress-bar.component.html",
})
export class ProgressBarComponent implements OnInit {

    @ViewChild("progressBar") progressBar: EuiProgressBarModule;
    @Input() currentStepName: string;

    currentStep = {
        stepString: "",
        stepValue: 0,
        stepVariant: "primary",
        isCompareVisible: false,
    };

    steps = [
        { step: "Home", value: 3, isCompareVisible: true },
        { step: "RIE Information", value: 17, isCompareVisible: false },
        { step: "Assessment Description", value: 36, isCompareVisible: false },
        {
            step: "Assessment Configuration",
            value: 57,
            isCompareVisible: false,
        },
        { step: "Assessment Criteria", value: 77, isCompareVisible: false },
        { step: "Assessment Results", value: 97, isCompareVisible: true },
    ];

    compareSteps = [
        { step: "Home", value: 3 },
        { step: "Assessment Comparison", value: 45 },
        { step: "Assessment Comparison Results", value: 97 },
    ];

    ngOnInit() {
        if (this.currentStepName === "Assessment Comparison") {
            this.currentStep.stepString = "Assessment Comparison";
            this.currentStep.stepValue = 46;
            return;
        }
        if (this.currentStepName === "Assessment Comparison Results") {
            this.currentStep.stepString = "Assessment Comparison Results";
            this.currentStep.stepValue = 94;
            return;
        }
        this.checkCurrentStep();
    }  

    checkCurrentStep() {
        const foundStep = this.steps.find(
            (step) => step.step === this.currentStepName
        );

        this.currentStep.stepString = foundStep.step;
        this.currentStep.stepValue = foundStep.value;
        this.currentStep.isCompareVisible = foundStep.isCompareVisible;
    }
}
