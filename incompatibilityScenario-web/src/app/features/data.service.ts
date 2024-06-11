import { Assessment } from "./assessment";
import { Injectable } from "@angular/core";
import { default as views } from "src/assets/views.json";
import { default as dimensions } from "src/assets/dimensions.json";
import { Result } from "./editor/result";
import { AdjustedResult } from "./editor/adjustedResult";

@Injectable({ providedIn: "root" })
export class DataService {
    private assessment: Assessment = {
        rieSbbs: [],
        rieSpecifications: [],
        rieName: "",
        rieDescription: "",
        candidateSbbs: [],
        candidateSpecifications: [],
        newSpecification: "",
        assessmentDescription: "",
        name: "",
        organisation: "",
        email: "",
        views: [],
        dimensions: [],
        criteriaList: [],
        resultList: [],
        adjustmentList: [],
        globalResult: "",
    };

    private assessment2: Assessment = {
        rieSbbs: [],
        rieSpecifications: [],
        rieName: "",
        rieDescription: "",
        candidateSbbs: [],
        candidateSpecifications: [],
        newSpecification: "",
        assessmentDescription: "",
        name: "",
        organisation: "",
        email: "",
        views: [],
        dimensions: [],
        criteriaList: [],
        resultList: [],
        adjustmentList: [],
        globalResult: "",
    };

    get() {
        return this.assessment;
    }

    set(assessment: Assessment) {
        this.assessment = assessment;
    }

    get2() {
        return this.assessment2;
    }

    set2(assessment2: Assessment) {
        this.assessment2 = assessment2;
    }

    reset() {
        this.assessment = {
            rieSbbs: [],
            rieSpecifications: [],
            rieName: "",
            rieDescription: "",
            candidateSbbs: [],
            candidateSpecifications: [],
            newSpecification: "",
            assessmentDescription: "",
            name: "",
            organisation: "",
            email: "",
            views: [],
            dimensions: [],
            criteriaList: [],
            resultList: [],
            adjustmentList: [],
            globalResult: "",
        };
    }

    reset2() {
        this.assessment2 = {
            rieSbbs: [],
            rieSpecifications: [],
            rieName: "",
            rieDescription: "",
            candidateSbbs: [],
            candidateSpecifications: [],
            newSpecification: "",
            assessmentDescription: "",
            name: "",
            organisation: "",
            email: "",
            views: [],
            dimensions: [],
            criteriaList: [],
            resultList: [],
            adjustmentList: [],
            globalResult: "",
        };
    }

    getViewsJsonContent() {
        return views["views"];
    }

    getDimensionsJsonContent() {
        return dimensions["dimensions"];
    }

    getResultList() {
        return this.assessment.resultList;
    }

    getResultList2() {
        return this.assessment2.resultList;
    }

    getResultByCategory(category: string) {
        const matchingResult = this.assessment.resultList.find(
            (result) => result.category === category
        );
        return matchingResult;
    }

    getResultByCategory2(category: string) {
        const matchingResult = this.assessment2.resultList.find(
            (result) => result.category === category
        );
        return matchingResult;
    }

    setResultByCategory(category: string, result: Result) {
        this.assessment.resultList.forEach((assesmentResult) => {
            if (assesmentResult.category === category) assesmentResult = result;
        });
    }

    setResultByCategory2(category: string, result: Result) {
        this.assessment2.resultList.forEach((assesmentResult) => {
            if (assesmentResult.category === category) assesmentResult = result;
        });
    }

    setNewAdjustement(newAdjustement: AdjustedResult) {
        this.assessment.adjustmentList.push(newAdjustement);
    }

    saveAssessment() {
        sessionStorage.setItem("assessment", JSON.stringify(this.assessment));
    }

    saveAssessment2() {
        sessionStorage.setItem("assessment2", JSON.stringify(this.assessment2));
    }

    getAssessment() {
        if (!this.get().rieName && sessionStorage.getItem("assessment")) {
            this.assessment = JSON.parse(sessionStorage.getItem("assessment"));
        }
    }

    getAssessment2() {
        if (!this.get().rieName && sessionStorage.getItem("assessment2")) {
            this.assessment2 = JSON.parse(
                sessionStorage.getItem("assessment2")
            );
        }
    }

    resetAssessment() {
        sessionStorage.removeItem("assessment");
    }
    resetAssessment2() {
        sessionStorage.removeItem("assessment2");
    }
}
