/*
 * Sallie AI Font Manager
 * Simple font styling utilities
 */

export interface FontType {
    regular: string;
    medium: string;
    bold: string;
}

export const fontTypes: Record<string, FontType> = {
    default: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    serif: {
        regular: 'serif',
        medium: 'serif',
        bold: 'serif',
    },
    monospace: {
        regular: 'monospace',
        medium: 'monospace',
        bold: 'monospace',
    },
};

export const getFontStyle = (type: string = 'default', weight: keyof FontType = 'regular') => {
    const fontType = fontTypes[type] || fontTypes.default;
    return {
        fontFamily: fontType[weight],
    };
};

export default {
    getFontStyle,
    fontTypes,
};
