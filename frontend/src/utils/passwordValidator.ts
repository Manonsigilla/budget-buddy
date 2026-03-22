export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 10) {
        errors.push('Minimum 10 caractères');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Au moins 1 majuscule (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Au moins 1 minuscule (a-z)');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Au moins 1 chiffre (0-9)');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};:'"`,.<>?/\\|`~]/.test(password)) {
        errors.push('Au moins 1 caractère spécial (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}