import React, { useState } from 'react';

const DepartmentDashboard = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const stats = [
        {
            id: 1,
            label: 'Graduates (2023)',
            value: '1,240',
            color: 'astu-navy',
            icon: 'people',
            bgGradient: 'from-blue-50 to-indigo-50',
            trend: '+8% vs 2022',
            trendIcon: 'trending_up'
        },
        {
            id: 2,
            label: 'Employment Rate',
            value: '87%',
            color: 'astu-green',
            icon: 'work',
            bgGradient: 'from-emerald-50 to-green-50',
            trend: '+3% vs 2022',
            trendIcon: 'trending_up'
        },
        {
            id: 3,
            label: 'Avg. Salary',
            value: '$45K',
            color: 'astu-red',
            icon: 'paid',
            bgGradient: 'from-red-50 to-orange-50',
            trend: '+$2K vs 2022',
            trendIcon: 'trending_up'
        },
        {
            id: 4,
            label: 'Alumni Feedback',
            value: '4.8/5',
            color: 'purple-600',
            icon: 'star',
            bgGradient: 'from-purple-50 to-pink-50',
            trend: 'Highly Satisfied',
            trendIcon: 'star'
        }
    ];

    const insights = [
        {
            title: 'Top Employer Sectors',
            items: ['Technology (42%)', 'Finance (28%)', 'Manufacturing (15%)'],
            icon: 'trending_up',
            color: 'astu-navy'
        },
        {
            title: 'Skills Gap Analysis',
            items: ['Data Science', 'Cloud Computing', 'AI/ML'],
            icon: 'school',
            color: 'astu-red'
        },
        {
            title: 'Student Satisfaction',
            items: ['Curriculum: 4.6/5', 'Teaching: 4.7/5', 'Facilities: 4.4/5'],
            icon: 'rate_review',
            color: 'astu-green'
        }
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen text-on-surface font-body-md overflow-x-hidden">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-astu-navy shadow-2xl w-[280px] hidden md:flex">
                <div className="p-6 mt-6">
                    <div className="flex items-center gap-3">
                        <img
                            alt="ASTU Logo"
                            className="h-12 w-12 object-contain drop-shadow-lg"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
                        />
                        <div>
                            <h1 className="text-headline-md font-bold text-on-primary">ASTU Department</h1>
                            <p className="text-label-sm text-primary-fixed-dim/70 uppercase tracking-widest">Analytics Hub</p>
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
                            <span className="material-symbols-outlined">trending_up</span>
                            <span className="text-label-md font-medium">Analytics</span>
                        </a>
                        <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
                            <span className="material-symbols-outlined">people</span>
                            <span className="text-label-md font-medium">Graduates</span>
                        </a>
                        <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
                            <span className="material-symbols-outlined">feedback</span>
                            <span className="text-label-md font-medium">Alumni Feedback</span>
                        </a>
                        <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300">
                            <span className="material-symbols-outlined">school</span>
                            <span className="text-label-md font-medium">Curriculum</span>
                        </a>
                    </div>

                    <div className="mt-10 px-6">
                        <button className="w-full bg-gradient-to-r from-astu-red to-red-600 hover:from-astu-red hover:to-red-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">download</span>
                            Export Report
                        </button>
                    </div>
                </nav>

                <div className="p-6 border-t border-white/20 mt-auto">
                    <a href="#" className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white mb-4 transition-all duration-300">
                        <span className="material-symbols-outlined">help</span>
                        <span className="text-label-md">Help Center</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-4 text-primary-fixed-dim/80 hover:text-white transition-all duration-300"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-label-md">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-[280px] min-h-screen">
                <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-10 h-16 bg-white/95 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/50 focus:bg-white transition-all duration-300"
                                placeholder="Search graduates, outcomes, feedback..."
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
                                <p className="text-sm font-semibold text-gray-900">Prof. Yohannes Tekle</p>
                                <p className="text-xs text-on-surface-variant">Dept. Head - Engineering</p>
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
                        <div className="absolute top-0 right-0 w-96 h-96 bg-astu-red/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Department Analytics 📈</h2>
                                <p className="text-lg opacity-95 leading-relaxed">Track graduate outcomes, monitor program effectiveness, and improve curriculum based on alumni feedback and industry trends.</p>
                            </div>
                            <button className="bg-gradient-to-r from-astu-red to-red-600 hover:from-astu-red hover:to-red-700 px-10 py-4 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-2">
                                <span className="material-symbols-outlined">download</span>
                                Export Report
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
                                        <span className="text-xs font-semibold text-astu-green bg-astu-green/15 px-3 py-1 rounded-full">Key</span>
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
                            { icon: 'trending_up', title: 'View Analytics', desc: 'Track program performance and outcomes', color: 'astu-navy' },
                            { icon: 'feedback', title: 'Alumni Feedback', desc: 'Review graduate insights and satisfaction', color: 'astu-red' },
                            { icon: 'school', title: 'Curriculum Insights', desc: 'Improve curriculum based on feedback', color: 'astu-green' }
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

                    {/* Key Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {insights.map((insight, idx) => (
                            <section key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-xl bg-${insight.color}/10 flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined text-xl text-${insight.color}`}>{insight.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
                                </div>
                                <div className="space-y-3">
                                    {insight.items.map((item, itemIdx) => (
                                        <div
                                            key={itemIdx}
                                            className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200/60 rounded-xl hover:shadow-md transition-all duration-300"
                                        >
                                            <p className={`text-sm font-semibold text-${insight.color}`}>{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Performance Metrics */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Program Performance Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl">
                                <p className="text-sm text-gray-600 font-medium mb-3">Curriculum Alignment</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 font-semibold">Industry-Ready Skills</span>
                                        <span className="text-astu-green font-bold">89%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-astu-green to-emerald-400 h-full rounded-full" style={{ width: '89%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-2xl">
                                <p className="text-sm text-gray-600 font-medium mb-3">Graduate Satisfaction</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 font-semibold">Overall Satisfaction</span>
                                        <span className="text-astu-red font-bold">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-astu-red to-red-400 h-full rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DepartmentDashboard;