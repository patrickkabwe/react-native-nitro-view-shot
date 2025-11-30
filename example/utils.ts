
export function base64Decode(base64: string): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    base64 = base64.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    for (let i = 0; i < base64.length; i += 4) {
        const enc1 = chars.indexOf(base64.charAt(i));
        const enc2 = chars.indexOf(base64.charAt(i + 1));
        const enc3 = chars.indexOf(base64.charAt(i + 2));
        const enc4 = chars.indexOf(base64.charAt(i + 3));

        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;

        output += String.fromCharCode(chr1);

        if (enc3 !== 64) {
            output += String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output += String.fromCharCode(chr3);
        }
    }

    return output;
}

export function getPngDimensionsFromBase64(base64: string): {
    width: number;
    height: number;
} | null {
    try {
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');

        const binaryString = base64Decode(base64Data);
        if (binaryString.length < 24) {
            return null;
        }

        const width =
            (binaryString.charCodeAt(16) << 24) |
            (binaryString.charCodeAt(17) << 16) |
            (binaryString.charCodeAt(18) << 8) |
            binaryString.charCodeAt(19);

        const height =
            (binaryString.charCodeAt(20) << 24) |
            (binaryString.charCodeAt(21) << 16) |
            (binaryString.charCodeAt(22) << 8) |
            binaryString.charCodeAt(23);

        return { width, height };
    } catch (error) {
        console.warn('Failed to decode PNG dimensions from base64', error);
        return null;
    }
}