export async function GET() {
  // Force rebuild - table view
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Review Duplicates - Datum</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; color: #333; }
    .container { max-width: 1400px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 30px; font-weight: bold; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 16px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
    .tab { padding: 12px 16px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: #666; border-bottom: 3px solid transparent; margin-bottom: -2px; }
    .tab.active { color: #000; border-bottom-color: #3b82f6; }

    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    thead { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    th { padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #666; }
    td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
    tr:hover { background: #f9fafb; }

    .name-col { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .location-col { max-width: 150px; color: #666; font-size: 13px; }
    .reason-col { font-size: 12px; color: #666; }
    .score-col { text-align: center; font-weight: 500; }

    .radio-group { display: flex; gap: 12px; align-items: center; }
    .radio-group label { display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer; margin: 0; }
    .radio-group input { margin: 0; cursor: pointer; }

    .controls { display: flex; gap: 16px; margin-top: 32px; }
    button { padding: 12px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; }
    .btn-save { background: #22c55e; color: white; flex: 1; }
    .btn-save:hover { background: #16a34a; }
    .btn-save:disabled { background: #9ca3af; cursor: not-allowed; }
    .btn-reload { background: #3b82f6; color: white; }
    .btn-reload:hover { background: #2563eb; }

    .loading { padding: 32px; text-align: center; color: #666; }
    .error { padding: 32px; color: #dc2626; }
    .empty { padding: 32px; text-align: center; color: #666; }

    .stats { color: #666; font-size: 13px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    let candidates = [];
    let activeTab = 'projects';
    let selections = {};
    let saveInProgress = false;

    async function loadCandidates(type) {
      activeTab = type;
      selections = {};
      const endpoint = type === 'projects' ? '/api/scan' : '/api/scan-companies';
      try {
        document.getElementById('app').innerHTML = '<div class="container"><div class="loading">Loading candidates...</div></div>';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 100 })
        });
        const data = await res.json();
        candidates = data.candidates || [];
        render();
      } catch (e) {
        console.error(e);
        document.getElementById('app').innerHTML = \`<div class="container"><div class="error">Error: \${e.message}</div></div>\`;
      }
    }

    function updateSelection(index, action) {
      selections[index] = action;
    }

    async function saveAll() {
      const actions = Object.entries(selections);
      if (actions.length === 0) {
        alert('No selections made');
        return;
      }

      saveInProgress = true;
      document.getElementById('save-btn').disabled = true;
      let completed = 0;
      let errors = [];

      for (const [index, action] of actions) {
        const idx = parseInt(index);
        const c = candidates[idx];

        try {
          if (action === 'skip') continue;

          const endpoint = activeTab === 'projects' ?
            (action === 'merge' ? '/api/merge' : '/api/mark-do-not-merge') :
            (action === 'merge' ? '/api/merge-companies' : '/api/mark-do-not-merge');

          const body = action === 'merge' ?
            { action: 'merge', canonical_project_id: c.canonical.id, duplicate_project_id: c.duplicate.id, merged_by: 'user' } :
            { type: activeTab, id1: c.canonical.id, id2: c.duplicate.id };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (res.ok) {
            completed++;
          } else {
            const data = await res.json();
            errors.push(\`Row \${idx + 1}: \${data.error || 'Unknown error'}\`);
          }
        } catch (e) {
          errors.push(\`Row \${idx + 1}: \${e.message}\`);
        }
      }

      saveInProgress = false;
      document.getElementById('save-btn').disabled = false;

      if (errors.length > 0) {
        alert('Saved ' + completed + ' / ' + actions.length + '\\n\\nErrors:\\n' + errors.slice(0, 5).join('\\n'));
      } else {
        alert('Successfully saved ' + completed + ' actions!');
      }

      selections = {};
      await loadCandidates(activeTab);
    }

    function render() {
      const app = document.getElementById('app');
      const typeLabel = activeTab === 'projects' ? 'Projects' : 'Companies';

      if (candidates.length === 0) {
        app.innerHTML = \`
          <div class="container">
            <h1>Review Duplicates</h1>
            <div class="subtitle">Find and merge duplicate entries</div>

            <div class="tabs">
              <button class="tab \${activeTab === 'projects' ? 'active' : ''}" onclick="loadCandidates('projects')">📊 Projects</button>
              <button class="tab \${activeTab === 'companies' ? 'active' : ''}" onclick="loadCandidates('companies')">🏢 Companies</button>
            </div>

            <div class="empty">No duplicates found to review</div>
          </div>
        \`;
        return;
      }

      let html = \`
        <div class="container">
          <h1>Review Duplicates</h1>
          <div class="subtitle">Select an action for each duplicate pair, then click Save</div>

          <div class="tabs">
            <button class="tab \${activeTab === 'projects' ? 'active' : ''}" onclick="loadCandidates('projects')">📊 Projects</button>
            <button class="tab \${activeTab === 'companies' ? 'active' : ''}" onclick="loadCandidates('companies')">🏢 Companies</button>
          </div>

          <div class="stats">\${typeLabel} • \${candidates.length} duplicates found</div>

          <table>
            <thead>
              <tr>
                <th style="width: 35%">Canonical</th>
                <th style="width: 35%">Duplicate</th>
                <th style="width: 15%">Match</th>
                <th style="width: 15%">Action</th>
              </tr>
            </thead>
            <tbody>
      \`;

      candidates.forEach((c, i) => {
        const selected = selections[i] || 'skip';
        html += \`
          <tr>
            <td>
              <div class="name-col" title="\${c.canonical.name}">\${c.canonical.name}</div>
              <div class="location-col">\${c.canonical.location || '—'}</div>
            </td>
            <td>
              <div class="name-col" title="\${c.duplicate.name}">\${c.duplicate.name}</div>
              <div class="location-col">\${c.duplicate.location || '—'}</div>
            </td>
            <td>
              <div class="reason-col">\${c.match_reason}</div>
              <div class="score-col">\${(c.confidence_score*100).toFixed(0)}%</div>
            </td>
            <td>
              <div class="radio-group">
                <label><input type="radio" name="action-\${i}" value="merge" \${selected === 'merge' ? 'checked' : ''} onchange="updateSelection(\${i}, 'merge')"> Merge</label>
                <label><input type="radio" name="action-\${i}" value="skip" \${selected === 'skip' ? 'checked' : ''} onchange="updateSelection(\${i}, 'skip')"> Skip</label>
                <label><input type="radio" name="action-\${i}" value="do-not-merge" \${selected === 'do-not-merge' ? 'checked' : ''} onchange="updateSelection(\${i}, 'do-not-merge')"> Don't Merge</label>
              </div>
            </td>
          </tr>
        \`;
      });

      html += \`
            </tbody>
          </table>

          <div class="controls">
            <button class="btn-save" id="save-btn" onclick="saveAll()" \${saveInProgress ? 'disabled' : ''}>💾 Save All Selections</button>
            <button class="btn-reload" onclick="loadCandidates('\${activeTab}')">🔄 Reload</button>
          </div>
        </div>
      \`;

      app.innerHTML = html;
    }

    // Initial load
    loadCandidates('projects');
  </script>
</body>
</html>
  \`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
