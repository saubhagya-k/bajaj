const { isValidEdge } = require("../utils/validator");

// 🔥 DFS: Build Tree + Detect Cycle
function buildTree(node, graph, visited = new Set()) {
    if (visited.has(node)) return null; // cycle detected

    visited.add(node);

    const children = graph[node] || [];
    const result = {};

    for (let child of children) {
        const subtree = buildTree(child, graph, new Set(visited));

        if (subtree === null) return null; // propagate cycle

        result[child] = subtree;
    }

    return result;
}

// 🔥 DFS: Calculate Depth
function getDepth(node, graph) {
    const children = graph[node] || [];

    if (children.length === 0) return 1;

    let maxDepth = 0;

    for (let child of children) {
        maxDepth = Math.max(maxDepth, getDepth(child, graph));
    }

    return 1 + maxDepth;
}

exports.handleBFHL = (req, res) => {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({
            success: false,
            message: "Invalid input format"
        });
    }

    const validEdges = [];
    const invalidEntries = [];
    const duplicateEdges = [];

    const seen = new Set();
    const duplicateSet = new Set();

    // ✅ Validation + Duplicates
    data.forEach(item => {
        if (!isValidEdge(item)) {
            invalidEntries.push(item);
            return;
        }

        const edge = item.trim();

        if (seen.has(edge)) {
            if (!duplicateSet.has(edge)) {
                duplicateEdges.push(edge);
                duplicateSet.add(edge);
            }
        } else {
            seen.add(edge);
            validEdges.push(edge);
        }
    });

    // ✅ BUILD GRAPH
    const graph = {};
    const childSet = new Set();

    validEdges.forEach(edge => {
        const [parent, child] = edge.split("->");

        if (!graph[parent]) graph[parent] = [];

        graph[parent].push(child);
        childSet.add(child);
    });

    // ✅ FIND ALL NODES
    const allNodes = new Set();

    validEdges.forEach(edge => {
        const [p, c] = edge.split("->");
        allNodes.add(p);
        allNodes.add(c);
    });

    // ✅ FIND ROOTS
    let roots = [...allNodes].filter(node => !childSet.has(node));

    // ⚠️ If no roots → cycle case → pick smallest node
    if (roots.length === 0 && allNodes.size > 0) {
        roots = [ [...allNodes].sort()[0] ];
    }

    // ✅ BUILD HIERARCHIES
    const hierarchies = [];
    let totalTrees = 0;
    let totalCycles = 0;
    let maxDepth = 0;
    let largestTreeRoot = "";

    roots.forEach(root => {
        const tree = buildTree(root, graph);

        if (tree === null) {
            totalCycles++;
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
        } else {
            const depth = getDepth(root, graph);
            totalTrees++;

            if (depth > maxDepth || 
               (depth === maxDepth && root < largestTreeRoot)) {
                maxDepth = depth;
                largestTreeRoot = root;
            }

            hierarchies.push({
                root,
                tree: { [root]: tree },
                depth
            });
        }
    });

    // ✅ FINAL RESPONSE (MATCHES PROBLEM FORMAT)
    res.json({
        user_id: "saubhagya_03",
        email_id: "saubhagyakeshavsingh@gmail.com",
        college_roll_number: "RA2311027010061",
        hierarchies,
        invalid_entries: invalidEntries,
        duplicate_edges: duplicateEdges,
        summary: {
            total_trees: totalTrees,
            total_cycles: totalCycles,
            largest_tree_root: largestTreeRoot
        }
    });
};