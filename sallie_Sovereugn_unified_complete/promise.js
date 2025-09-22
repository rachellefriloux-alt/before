const getPromiseValue = () => 'Promise{…}';
export default getPromiseValue;
function parsePromiseDef(def, refs) {
    return (0, parseDef_1.parseDef)(def.type._def, refs);
}
//# sourceMappingURL=promise.js.map
