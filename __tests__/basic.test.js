// Basic test to verify Jest setup is working
describe('Basic Tests', () => {
    test('should pass a simple test', () => {
        expect(1 + 1).toBe(2);
    });

    test('should handle basic object operations', () => {
        const obj = { test: 'value' };
        expect(obj.test).toBe('value');
    });

    test('should handle array operations', () => {
        const arr = [1, 2, 3];
        expect(arr.length).toBe(3);
        expect(arr[0]).toBe(1);
    });
});
