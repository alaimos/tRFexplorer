export function ArrayEquals (a1, a2) {
    a1 = a1.sort();
    a2 = a2.sort();
    return (a1.length === a2.length && a1.every((value, index) => (value === a2[index])));
}
