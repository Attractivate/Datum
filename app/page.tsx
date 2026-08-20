export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">What Changed</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Active Projects</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">4,081</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Across six industries</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Events This Week</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">153</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">New activity on tracked projects</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Significant</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">5</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Awards, stage changes, filings — deduplicated</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6">
          <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-2">Past Due</div>
          <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">134</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Milestone date passed, no update since</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Industry</div>
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">All 4,081</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Power Generation 3,843</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Oil & Gas 83</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Hi Tech 51</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Power Delivery 35</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Water 28</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Life Sciences 26</button>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Activity</div>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">All activity 153</button>
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Significant only 5</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* News Section */}
        <div className="col-span-2">
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">WEDNESDAY 19 AUGUST</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">7 EVENTS</div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">News Mention</div>
                <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Google reveals it is behind 506-acre Project Clydesdale data center in Oklahoma</h3>
                <div className="flex gap-3 text-sm">
                  <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Project Clydesdale</a>
                  <span className="text-slate-500 dark:text-slate-400">Google</span>
                  <span className="text-slate-500 dark:text-slate-400">Tulsa County, Oklahoma</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">News pipeline</div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">News Mention</div>
                <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">NVIDIA partners with SB Energy on 10-GW AI "factory" in Ohio</h3>
                <div className="flex gap-3 text-sm">
                  <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Piketon AI Factory</a>
                  <span className="text-slate-500 dark:text-slate-400">NVIDIA and SB Energy</span>
                  <span className="text-slate-500 dark:text-slate-400">Piketon, Ohio</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">News pipeline</div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">News Mention</div>
                <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Genentech marks topping-out milestone for new Holly Springs manufacturing facility</h3>
                <div className="flex gap-3 text-sm">
                  <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Holly Springs Fill-Finish</a>
                  <span className="text-slate-500 dark:text-slate-400">Genentech</span>
                  <span className="text-slate-500 dark:text-slate-400">Holly Springs, North Carolina</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">News pipeline</div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">News Mention</div>
                <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Georgia Transmission builds new 230-kV station amid rising demand</h3>
                <div className="flex gap-3 text-sm">
                  <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Georgia 230-kV Station</a>
                  <span className="text-slate-500 dark:text-slate-400">Georgia Transmission</span>
                  <span className="text-slate-500 dark:text-slate-400">Georgia</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">News pipeline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="col-span-1">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Needs attention <span className="text-yellow-700 dark:text-yellow-400">134</span></h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Projected milestone date has passed with no update since. The oldest have been quiet for years.</p>
            <div className="space-y-4 text-sm">
              <div>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Montezuma II</a>
                <div className="text-slate-600 dark:text-slate-400">Solano County, CA</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">13 yr overdue</div>
              </div>
              <div>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Frostburg 138 kV</a>
                <div className="text-slate-600 dark:text-slate-400">Allegany County, MD</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">4 yr overdue</div>
              </div>
              <div>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Fresno Cogeneration Expansion</a>
                <div className="text-slate-600 dark:text-slate-400">Fresno County, CA</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">3 yr overdue</div>
              </div>
              <div>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Daggett Solar 3</a>
                <div className="text-slate-600 dark:text-slate-400">San Bernardino County, CA</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">3 yr overdue</div>
              </div>
              <div>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium">Los Esteros Critical Energy</a>
                <div className="text-slate-600 dark:text-slate-400">Santa Clara County, CA</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">2 yr overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
