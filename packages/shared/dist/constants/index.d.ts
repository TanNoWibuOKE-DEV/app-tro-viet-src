/**
 * Trọ Việt - Constants & Error Mappings
 * Strictly adheres to SPEC Section 9 & 20-vietnamese-ui rule
 */
export declare const APP_NAME = "Tr\u1ECD Vi\u1EC7t";
export declare const APP_TAGLINE = "T\u00ECm \u0111\u00FAng ch\u1ED7 \u2014 Thu\u00EA an t\u00E2m.";
export declare const ERROR_MESSAGES: Record<string, string>;
export declare function getFriendlyErrorMessage(code: string | undefined): string;
export declare const COLORS: {
    light: {
        primary: string;
        primaryHover: string;
        primaryLight: string;
        primarySubtle: string;
        background: string;
        card: string;
        textPrimary: string;
        textSecondary: string;
        border: string;
        accentBlue: string;
        accentBlueText: string;
        badgeL1: string;
        badgeL1Text: string;
        badgeL2: string;
        badgeL2Text: string;
        warning: string;
        danger: string;
        error: string;
        success: string;
    };
    dark: {
        primary: string;
        primaryHover: string;
        primaryLight: string;
        primarySubtle: string;
        background: string;
        card: string;
        textPrimary: string;
        textSecondary: string;
        border: string;
        accentBlue: string;
        accentBlueText: string;
        badgeL1: string;
        badgeL1Text: string;
        badgeL2: string;
        badgeL2Text: string;
        warning: string;
        danger: string;
        error: string;
        success: string;
    };
};
