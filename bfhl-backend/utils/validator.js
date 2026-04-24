function isValidEdge(str) {
    if (typeof str !== "string") return false;

    str = str.trim();

    // Format check: A->B
    if (!/^[A-Z]->[A-Z]$/.test(str)) return false;

    // Self loop check
    if (str[0] === str[3]) return false;

    return true;
}

module.exports = { isValidEdge };