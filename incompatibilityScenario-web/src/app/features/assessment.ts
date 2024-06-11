import { AdjustedResult } from "./editor/adjustedResult";
import { Criteria } from "./editor/criteria";
import { Result } from "./editor/result";

export interface Assessment {
    rieSbbs: string[];
    rieSpecifications: string[];
    rieName: string;
    rieDescription: string;
    candidateSbbs: string[];
    candidateSpecifications: string[];
    newSpecification: string;
    assessmentDescription: string;
    name: string;
    organisation: string;
    email: string;
    views: string[];
    dimensions: string[];
    criteriaList: Criteria[];
    resultList: Result[];
    adjustmentList: AdjustedResult[];
    globalResult: string;
}
