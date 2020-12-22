const digestMessage = async m => btoa(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(m))).reduce((a, b) => a + String.fromCharCode(b), ''));
export default digestMessage;