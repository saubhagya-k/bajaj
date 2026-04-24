function formatTree(node, obj, prefix = "") {
  let result = node + "\n";

  const keys = Object.keys(obj);

  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;

    const connector = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    result += prefix + connector + key + "\n";

    result += formatTree(key, obj[key], nextPrefix).replace(key + "\n", "");
  });

  return result;
}

function sendData() {
  const input = document.getElementById("input").value;

  const data = input
    .split("\n")
    .map(x => x.trim())
    .filter(x => x.length > 0);

  fetch("http://localhost:3009/bfhl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data })
  })
  .then(res => res.json())
  .then(result => {

    let outputText = "";

    // 🌳 TREE DISPLAY
    if (result.hierarchies && result.hierarchies.length > 0) {
      result.hierarchies.forEach(h => {
        if (h.has_cycle) {
          outputText += `⚠️ Cycle detected at root ${h.root}\n\n`;
        } else {
          const root = h.root;
          const tree = h.tree[root];

          outputText += formatTree(root, tree) + "\n";
        }
      });
    }

    // ❌ INVALID ENTRIES
    if (result.invalid_entries && result.invalid_entries.length > 0) {
      outputText += "\n❌ Invalid Entries:\n";
      result.invalid_entries.forEach(e => {
        outputText += `- ${e}\n`;
      });
    }

    // 🔁 DUPLICATES
    if (result.duplicate_edges && result.duplicate_edges.length > 0) {
      outputText += "\n🔁 Duplicate Edges:\n";
      result.duplicate_edges.forEach(e => {
        outputText += `- ${e}\n`;
      });
    }

    // 📊 SUMMARY
    if (result.summary) {
      outputText += "\n📊 Summary:\n";
      outputText += `Trees: ${result.summary.total_trees}\n`;
      outputText += `Cycles: ${result.summary.total_cycles}\n`;
      outputText += `Largest Root: ${result.summary.largest_tree_root}\n`;
    }

    document.getElementById("output").innerText = outputText;
  })
  .catch(err => {
    document.getElementById("output").innerText =
      "❌ Error connecting to API";
  });
}