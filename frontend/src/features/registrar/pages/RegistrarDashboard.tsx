import React, { useState } from 'react';

const RegistrarDashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const stats = [
    {
      id: 1,
      label: 'Total Alumni',
      value: '24,000+',
      color: 'astu-navy',
      icon: 'people',
      bgGradient: 'from-blue-50 to-indigo-50',
      trend: '+1,200 this year',
      trendIcon: 'trending_up'
    },
    {
      id: 2,
      label: 'Active Surveys',
      value: '12',
      color: 'astu-green',
      icon: 'assignment',
      bgGradient: 'from-emerald-50 to-green-50',
      trend: '68% response rate',
      trendIcon: 'check_circle'
    },
    {
      id: 3,
      label: 'Reports Generated',
      value: '34',
      color: 'astu-red',
      icon: 'description',
      bgGradient: 'from-red-50 to-orange-50',
      trend: '+8 this month',
      trendIcon: 'trending_up'
    },
    {
      id: 4,
      label: 'Data Quality',
      value: '94%',
      color: 'purple-600',
      icon: 'verified_user',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: 'Excellent',
      trendIcon: 'star'
    }
  ];

  const activeSurveys = [
    {
      id: 1,
      title: '6-Month Employment Tracer Study',
      target: 'Class of 2023',
      responseRate: 68,
      status: 'Active',
      started: 'Jan 15, 2024',
      ends: 'Mar 15, 2024'
    },
    {
      id: 2,
      title: 'Curriculum Feedback Survey',
      target: 'All Departments',
      responseRate: 45,
      status: 'Active',
      started: 'Feb 1, 2024',
      ends: 'Apr 30, 2024'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen text-on-surface font-body-md overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-astu-navy shadow-2xl w-[280px] hidden md:flex">
        <div className="p-6 mt-6">
          <div className="flex items-center gap-3">
            <img
              alt="ASTU Official Logo"
              className="h-12 w-12 object-contain drop-shadow-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
            />
            <div>
              <h1 className="text-headline-md font-bold text-on-primary">ASTU Registrar</h1>
              <p className="text-label-sm text-primary-fixed-dim/70 uppercase tracking-widest">Management Hub</p>
            </div>
          </div>
        </div>

        <nav className="mt-10 flex-grow px-3">
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-4 bg-white/15 text-astu-green border-l-4 border-astu-green px-6 py-3 rounded-r-xl hover:bg-white/20 transition-all duration-300 shadow-lg">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-label-md font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
              <span className="material-symbols-outlined">people</span>
              <span className="text-label-md font-medium">Alumni Records</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
              <span className="material-symbols-outlined">assignment</span>
              <span className="text-label-md font-medium">Surveys</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
              <span className="material-symbols-outlined">description</span>
              <span className="text-label-md font-medium">Reports</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-label-md font-medium">Settings</span>
            </a>
          </div>

          <div className="mt-10 px-6">
            <button className="w-full bg-gradient-to-r from-astu-red to-red-600 hover:from-astu-red hover:to-red-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Create Survey
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/20 mt-auto">
          <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white mb-4 transition-all duration-300">
            <span className="material-symbols-outlined">help</span>
            <span className="text-label-md">Help Center</span>
          </a>
          <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[280px] min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-10 h-16 bg-white/95 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all duration-300"
                placeholder="Search alumni records, surveys..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full relative transition-all duration-300 hover:scale-110">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-astu-red rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110">
              <span className="material-symbols-outlined">apps</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">Dr. Abebe Assefa</p>
                <p className="text-xs text-on-surface-variant">Registrar</p>
              </div>
              <img
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-astu-navy/20 shadow-md hover:shadow-lg transition-shadow"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rhHWBnOkWV1xWVC1HCSOzZwYhELqmvpSOzjKGmJ3QT9TkogaTK1A-VFzyS2wFdRCyz1RPhDUnlP_MiltJbq474wk-J0Hy58LqjlIXdUewPZ7RW2ySloQgh-_OSmwjVC1CDIGlrJYVf-girKkZdSApD6aHXWeguIrLeNIpZr62hAY5d6aFvI83jB92w3mmbGBsn4lIuvqN0WRJVdQ_EoXDHNzeJEbPEco-5mwZoLz4ZRrnorLI2LyJrUdUUoGmyjMYj7_ay9KPUjw"
              />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 space-y-8">
          {/* Welcome Banner */}
          <section className="relative bg-gradient-to-r from-astu-navy via-blue-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-astu-green/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Registrar Dashboard 📊</h2>
                <p className="text-lg opacity-95 leading-relaxed">Manage alumni records, conduct tracer studies, and generate comprehensive institutional reports to drive continuous improvement.</p>
              </div>
              <button className="bg-gradient-to-r from-astu-red to-red-600 hover:from-astu-red hover:to-red-700 px-10 py-4 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Create Survey
              </button>
            </div>
          </section>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.id}
                onMouseEnter={() => setHoveredCard(stat.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${hoveredCard === stat.id ? 'translate-y-[-8px]' : ''}`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.bgGradient}`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10`}>
                      <span className={`material-symbols-outlined text-2xl text-${stat.color}`}>{stat.icon}</span>
                    </div>
                    <span className="text-xs font-semibold text-astu-green bg-astu-green/15 px-3 py-1 rounded-full">Top</span>
                  </div>

                  <p className="text-sm text-gray-600 font-medium mb-2">{stat.label}</p>
                  <p className={`text-4xl font-bold text-${stat.color} mb-3`}>{stat.value}</p>

                  <div className="flex items-center gap-1 text-astu-green text-sm font-medium">
                    <span className="material-symbols-outlined text-lg">{stat.trendIcon}</span>
                    {stat.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'people', title: 'Alumni Records', desc: 'View and manage comprehensive alumni database', color: 'astu-navy' },
              { icon: 'assignment', title: 'Create Survey', desc: 'Launch new tracer studies and surveys', color: 'astu-red' },
              { icon: 'description', title: 'Generate Report', desc: 'Create comprehensive institutional reports', color: 'astu-green' }
            ].map((action, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white border border-gray-200/60 rounded-2xl hover:shadow-lg hover:border-astu-navy/30 transition-all duration-300 cursor-pointer text-center"
              >
                <div className={`mx-auto w-16 h-16 rounded-2xl bg-${action.color}/10 flex items-center justify-center mb-6 group-hover:bg-${action.color}/20 transition-colors`}>
                  <span className={`material-symbols-outlined text-3xl text-${action.color}`}>{action.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </div>
            ))}
          </div>

          {/* Active Surveys */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Active Surveys</h3>
                <p className="text-sm text-gray-600">Monitor ongoing tracer studies and feedback collection</p>
              </div>
              <button className="flex items-center gap-2 text-astu-navy font-semibold hover:text-astu-navy/80 transition-colors">
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200/60 rounded-2xl hover:shadow-lg hover:border-astu-navy/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{survey.title}</h4>
                        <span className="px-3 py-1 bg-astu-green/15 text-astu-green text-sm font-semibold rounded-full">{survey.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-3">{survey.target}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Response Rate: <span className="font-semibold">{survey.responseRate}%</span></span>
                          <span className="text-gray-600">{survey.started} - {survey.ends}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full" style={{ width: `${survey.responseRate}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-astu-navy text-white rounded-xl font-semibold hover:bg-astu-navy/90 transition-all duration-300 transform group-hover:scale-105 whitespace-nowrap flex items-center gap-2">
                      <span className="material-symbols-outlined">manage_search</span>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Metrics  */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Data Completeness', stat: '94%', icon: 'verified_user', color: 'astu-green' },
                { title: 'Alumni Engaged', stat: '18,420', icon: 'people_alt', color: 'astu-navy' }
              ].map((metric, idx) => (
                <div key={idx} className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">{metric.title}</p>
                      <p className={`text-4xl font-bold text-${metric.color}`}>{metric.stat}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-${metric.color}/10 flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-2xl text-${metric.color}`}>{metric.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RegistrarDashboard;