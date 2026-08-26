export async function GET() {
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
    .container { max-width: 1280px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 30px; font-weight: bold; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .card { padding: 24px; border: 2px solid; border-radius: 8px; }
    .card-keep { background: #dcfce7; border-color: #22c55e; }
    .card-merge { background: #fee2e2; border-color: #ef4444; }
    .card h2 { font-weight: bold; margin-bottom: 16px; font-size: 16px; }
    .card-keep h2 { color: #166534; }
    .card-merge h2 { color: #991b1b; }
    .project-name { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    .project-location { font-size: 14px; color: #666; margin-bottom: 8px; }
    .match-info { font-size: 12px; color: #666; margin-top: 16px; }
    .buttons { display: flex; gap: 16px; margin-bottom: 32px; }
    button { padding: 16px 24px; font-size: 16px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; flex: 1; }
    .btn-merge { background: #22c55e; color: white; }
    .btn-merge:hover { background: #16a34a; }
    .btn-skip { background: #9ca3af; color: white; }
    .btn-skip:hover { background: #6b7280; }
    .btn-load { background: #3b82f6; color: white; width: 100%; }
    .btn-load:hover { background: #2563eb; }
    .loading { padding: 32px; }
    .error { padding: 32px; color: #dc2626; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    let candidates = [];
    let currentIndex = 0;
    let activeTab = 'projects'; // 'projects' or 'companies'

    async function loadCandidates(type) {
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
        currentIndex = 0;
        render();
      } catch (e) {
        console.error(e);
        document.getElementById('app').innerHTML = \`<div class="container"><div class="error">Error: \${e.message}</div></div>\`;
      }
    }

    async function merge() {
      if (currentIndex >= candidates.length) return;

      const c = candidates[currentIndex];
      const endpoint = activeTab === 'projects' ? '/api/merge' : '/api/merge-companies';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'merge',
            canonical_project_id: c.canonical.id,
            duplicate_project_id: c.duplicate.id,
            merged_by: 'user'
          })
        });

        if (res.ok) {
          alert(\`✓ Merged!\`);
          currentIndex++;
          render();
        } else {
          alert('Error merging');
        }
      } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
      }
    }

    function skip() {
      currentIndex++;
      render();
    }

    function render() {
      const app = document.getElementById('app');

      if (candidates.length === 0) {
        app.innerHTML = \`
          <div class="container">
            <h1>Review Duplicates</h1>
            <div class="subtitle">Find and merge duplicate entries</div>
            <button onclick="loadCandidates('projects')" class="btn-load">Load Project Duplicates</button>
          </div>
        \`;
        return;
      }

      const c = candidates[currentIndex];
      app.innerHTML = \`
        <div class="container">
          <h1>Review Duplicates</h1>
          <p class="subtitle">\${currentIndex + 1} of \${candidates.length}</p>

          <div class="grid">
            <div class="card card-keep">
              <h2>✓ KEEP THIS</h2>
              <div class="project-name">\${c.canonical.name}</div>
              <div class="project-location">\${c.canonical.location || '—'}</div>
            </div>
            <div class="card card-merge">
              <h2>✗ MERGE INTO LEFT</h2>
              <div class="project-name">\${c.duplicate.name}</div>
              <div class="project-location">\${c.duplicate.location || '—'}</div>
              <div class="match-info">\${c.match_reason} (\${(c.confidence_score*100).toFixed(0)}%)</div>
            </div>
          </div>

          <div class="buttons">
            <button onclick="merge()" class="btn-merge">✓ MERGE</button>
            <button onclick="skip()" class="btn-skip">SKIP</button>
          </div>
        </div>
      \`;
    }

    function switchTab(tab) {
      activeTab = tab;
      loadCandidates(tab);
    }

    function load() {
      loadCandidates(activeTab);
    }

    // Initial load
    loadCandidates('projects');
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
