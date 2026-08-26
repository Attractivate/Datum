export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Review Duplicates - Datum</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-gray-50">
  <div id="app"></div>
  <script>
    let candidates = [];
    let currentIndex = 0;
    let activeTab = 'projects'; // 'projects' or 'companies'

    async function loadCandidates(type) {
      const endpoint = type === 'projects' ? '/api/scan' : '/api/scan-companies';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ limit: 100 })
        });
        const data = await res.json();
        candidates = data.candidates || [];
        currentIndex = 0;
        render();
      } catch (e) {
        console.error(e);
        alert('Error loading candidates');
      }
    }

    async function merge() {
      if (currentIndex >= candidates.length) return;

      const c = candidates[currentIndex];
      const endpoint = activeTab === 'projects' ? '/api/merge' : '/api/merge-companies';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            action: 'merge',
            canonical_id: c.canonical.id,
            duplicate_id: c.duplicate.id,
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
          <div class="p-8">
            <h1 class="text-3xl font-bold mb-4">Review Duplicates</h1>
            <div class="mb-8">
              <button onclick="switchTab('projects')" class="\${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-200'} px-6 py-2 rounded mr-4">Projects</button>
              <button onclick="switchTab('companies')" class="\${activeTab === 'companies' ? 'bg-blue-600 text-white' : 'bg-gray-200'} px-6 py-2 rounded">Companies</button>
            </div>
            <button onclick="load()" class="bg-green-600 text-white px-6 py-2 rounded">Load Candidates</button>
          </div>
        \`;
        return;
      }

      const c = candidates[currentIndex];
      app.innerHTML = \`
        <div class="min-h-screen bg-gray-50">
          <div class="max-w-6xl mx-auto p-8">
            <h1 class="text-3xl font-bold mb-2">Review Duplicates</h1>
            <p class="text-gray-600 mb-8">\${currentIndex + 1} of \${candidates.length}</p>

            <div class="grid grid-cols-2 gap-8 mb-8">
              <div class="bg-green-50 p-6 border-2 border-green-200 rounded-lg">
                <h2 class="font-bold text-green-800 mb-4">KEEP THIS</h2>
                <p class="text-xl font-bold mb-2">\${c.canonical.name}</p>
                <p class="text-sm text-gray-600">\${c.canonical.location || c.canonical.industry || '—'}</p>
              </div>
              <div class="bg-red-50 p-6 border-2 border-red-200 rounded-lg">
                <h2 class="font-bold text-red-800 mb-4">MERGE INTO LEFT</h2>
                <p class="text-xl font-bold mb-2">\${c.duplicate.name}</p>
                <p class="text-sm text-gray-600">\${c.duplicate.location || c.duplicate.industry || '—'}</p>
                <p class="text-xs text-gray-500 mt-4">\${c.match_reason} (\${(c.confidence_score*100).toFixed(0)}%)</p>
              </div>
            </div>

            <div class="flex gap-4">
              <button onclick="merge()" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">✓ MERGE</button>
              <button onclick="skip()" class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded">SKIP</button>
            </div>
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
