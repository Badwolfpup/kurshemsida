export default interface AssertProjectType {
    techStack: "html" | "html+css" | "html+css+js";
    difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface AssertProjectResponse {
    title: string;
    description: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    techStack: "html" | "html+css" | "html+css+js";
    learningGoals: string;
    userStories: string;
    designSpecs: string;
    assetsNeeded: string;
    starterHtml: string;
    solutionHtml: string;
    solutionCss: string;
    solutionJs: string;
    bonusChallenges: string;
    success: boolean;
    error?: string;
}

export type AssertProjectItem= {
    comment: string;
    code: string;
}