import { validateGitHubFilePath } from '../../src/utils/sanitize';

describe('Path Traversal Protection', () => {
    it('should reject path traversal attempts', () => {
        expect(validateGitHubFilePath('../../../etc/passwd')).toBe(false);
        expect(validateGitHubFilePath('..\\..\\..\\windows\\system.ini')).toBe(false);
        expect(validateGitHubFilePath('/etc/passwd')).toBe(false);
    });
    
    it('should accept valid paths', () => {
        expect(validateGitHubFilePath('src/config/index.ts')).toBe(true);
        expect(validateGitHubFilePath('docs/README.md')).toBe(true);
    });
});
