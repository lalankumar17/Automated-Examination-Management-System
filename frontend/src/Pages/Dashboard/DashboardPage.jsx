import { memo, useEffect, useState } from 'react';
import '../../Style/UnifiedPages.css';
import '../../Style/Pages/Dashboard.css';
import { getSubjectsDetailsList } from '../../Script/SubjectsDataFetcher';
import { getExamStatus, getExams } from '../../Script/ExamDataFetcher';
import { getHealthStatus } from '../../Script/HealthFetcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { useNotifications } from '../../Components/NotificationContext';
import AnalyticsChart from '../../Components/AnalyticsChart';


function DashboardPage() {
    const { user } = useAuth();
    const { addNotification, removeNotificationByMessage } = useNotifications();
    const [subjectCount, setSubjectCount] = useState(0);
    const [examStatus, setExamStatus] = useState({ total: 0, published: 0, draft: 0 });
    const [recentExams, setRecentExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState({ backend: 'Loading...', db: 'Loading...' });
    const [semesterDistribution, setSemesterDistribution] = useState({});

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            getSubjectsDetailsList((data) => {
                setSubjectCount(Object.keys(data).length);
            });
            const status = await getExamStatus();
            setExamStatus(status);
            const exams = await getExams();
            const sortedByCreation = [...exams].sort((a, b) => b.id - a.id);
            setRecentExams(sortedByCreation.slice(0, 5));

            const healthStatus = await getHealthStatus();
            setHealth(healthStatus);
            if (healthStatus.backend === 'Disconnected') {
                addNotification('Backend system is disconnected', 'error', 0);
            } else if (healthStatus.backend === 'OK') {
                removeNotificationByMessage('Backend system is disconnected');
            }

            const dist = {};
            exams.forEach(exam => {
                const sem = `SEM ${exam.semester}`;
                dist[sem] = (dist[sem] || 0) + 1;
            });
            setSemesterDistribution(dist);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            addNotification('Error loading dashboard data', 'error');
        }
        setLoading(false);
    };




    // Helper to get initials
    const getInitials = (fullName) => {
        if (!fullName) return '';
        const names = fullName.trim().split(/\s+/);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className='dashboard-container compact-mode'>
            <div className='top-section'>
                <div className='welcome-card'>
                    <div className='welcome-content-wrapper'>
                        <div className='welcome-header'>
                            <h1>Timetable Generator</h1>
                            <p>Manage curriculum & exams.</p>
                            <Link to="/ExamTimetable" className='btn-light btn-sm'>+ New Schedule</Link>
                        </div>
                    </div>
                </div>

                <div className='mini-stats'>
                    <div className='mini-stat-item stat-blue'>
                        <span className='stat-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                <path d="M8 7h8" />
                                <path d="M8 11h5" />
                            </svg>
                        </span>
                        <div className='stat-text'>
                            <strong>{subjectCount}</strong>
                            <small>Subjects</small>
                        </div>
                    </div>
                    <div className='mini-stat-item stat-purple'>
                        <span className='stat-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                                <path d="M9 16l2 2 4-4" />
                            </svg>
                        </span>
                        <div className='stat-text'>
                            <strong>{examStatus.total}</strong>
                            <small>Exams</small>
                        </div>
                    </div>
                    <div className='mini-stat-item stat-amber'>
                        <span className='stat-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </span>
                        <div className='stat-text'>
                            <strong>{examStatus.draft}</strong>
                            <small>Drafts</small>
                        </div>
                    </div>
                    <div className='mini-stat-item stat-green'>

                        <span className='stat-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </span>
                        <div className='stat-text'>
                            <strong>{examStatus.published}</strong>
                            <small>Published</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className='middle-section'>
                <div className='pipeline-card'>
                    <div className='pipeline-header'>
                        <span className='pipeline-tag'>Workflow</span>
                        <span className='pipeline-status-text'>
                            {examStatus.published > 0 ? 'All stages complete' : examStatus.total > 0 ? 'In progress' : subjectCount > 0 ? 'Getting started' : 'Not started'}
                        </span>
                    </div>
                    <div className='pipeline-steps'>
                        {/* Step 1: Subjects — Book/Library icon */}
                        <div className={`pipe-step ${subjectCount > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    <path d="M8 7h8" />
                                    <path d="M8 11h5" />
                                </svg>
                                {subjectCount > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Subjects</span>
                                <span className='pipe-meta'>{subjectCount > 0 ? `${subjectCount} loaded` : 'Awaiting data'}</span>
                            </div>
                        </div>
                        <div className='pipe-connector'>
                            <div className={`pipe-connector-line ${subjectCount > 0 ? 'active' : ''}`}></div>
                        </div>
                        {/* Step 2: Draft — Clipboard/Edit icon */}
                        <div className={`pipe-step ${examStatus.total > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                                {examStatus.total > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Draft</span>
                                <span className='pipe-meta'>{examStatus.total > 0 ? `${examStatus.draft} scheduled` : 'Awaiting exams'}</span>
                            </div>
                        </div>
                        <div className='pipe-connector'>
                            <div className={`pipe-connector-line ${examStatus.total > 0 ? 'active' : ''}`}></div>
                        </div>
                        {/* Step 3: Published — Rocket icon */}
                        <div className={`pipe-step ${examStatus.published > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {examStatus.published > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Published</span>
                                <span className='pipe-meta'>{examStatus.published > 0 ? `${examStatus.published} live` : 'Awaiting publish'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bottom-section-grid'>
                <div className='dashboard-col'>
                    <div className='panel-header-sm'>My Profile</div>
                    <div className='compact-status-box' style={{ padding: '1.5rem', flexGrow: 1, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="profile-mini-avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accentColor)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden' }}>
                                {user?.profilePicture ? <img src={user.profilePicture} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name || user?.username) || user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--textColor)' }}>
                                    {user?.name || user?.username || 'User'}
                                    {(user?.phoneNumber && user.phoneNumber.length === 10) && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '4px', verticalAlign: 'middle', position: 'relative', top: '-1px' }}>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.2356 1.70113C11.5833 0.816091 10.2751 0.816091 9.62283 1.70113L8.68067 2.98068C8.34997 3.42939 7.7951 3.65992 7.2343 3.5828L5.65582 3.36605C4.55836 3.21495 3.53503 3.96207 3.37682 5.0601L3.14923 6.63842C3.06847 7.19894 2.8028 7.71261 2.3985 8.09353L1.26125 9.16738C0.470477 9.91421 0.470477 11.218 1.26125 11.9648L2.3985 13.0387C2.8028 13.4196 3.06847 13.9333 3.14923 14.4938L3.37682 16.0721C3.53503 17.1701 4.55836 17.9173 5.65582 17.7661L7.2343 17.5494C7.7951 17.4723 8.34997 17.7028 8.68067 18.1515L9.62283 19.4311C10.2751 20.3161 11.5833 20.3161 12.2356 19.4311L13.1778 18.1515C13.5085 17.7028 14.0633 17.4723 14.6241 17.5494L16.2026 17.7661C17.3001 17.9173 18.3234 17.1701 18.4816 16.0721L18.7092 14.4938C18.7899 13.9333 19.0556 13.4196 19.4599 13.0387L20.5972 11.9648C21.3879 11.218 21.3879 9.91421 20.5972 9.16738L19.4599 8.09353C19.0556 7.71261 18.7899 7.19894 18.7092 6.63842L18.4816 5.0601C18.3234 3.96207 17.3001 3.21495 16.2026 3.36605L14.6241 3.5828C14.0633 3.65992 13.5085 3.42939 13.1778 2.98068L12.2356 1.70113Z" fill="#1877F2" />
                                            <path d="M15.932 8.17415C16.3533 7.79462 16.3888 7.14371 16.0108 6.72123C15.6328 6.29875 14.9845 6.26325 14.5632 6.64277L9.85175 10.8872L7.36214 8.44199C6.97495 8.06173 6.34976 8.06173 5.96541 8.44773C5.58107 8.83118 5.58362 9.45036 5.97081 9.83062L9.123 12.9255C9.31016 13.1093 9.56306 13.208 9.82479 13.1994C10.0865 13.1908 10.3341 13.0757 10.5117 12.8804L15.932 8.17415Z" fill="white" />
                                        </svg>
                                    )}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--textColor2)' }}>@{user?.username || 'user'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className="status-row" style={{ fontSize: '0.85rem' }}><small style={{ color: 'var(--textColor2)', width: '80px' }}>Designation:</small><span style={{ whiteSpace: 'nowrap' }}>{user?.designation || 'Not Set'}</span></div>
                            <div className="status-row" style={{ fontSize: '0.85rem' }}><small style={{ color: 'var(--textColor2)', width: '80px' }}>Department:</small><span style={{ whiteSpace: 'nowrap' }}>{user?.department || 'Not Set'}</span></div>
                        </div>
                        <Link to="/Profile" className='view-profile-btn'>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            View Profile
                        </Link>
                    </div>
                    <div className='system-status-card'>
                        <div className={`status-item ${health.backend !== 'OK' ? 'error' : ''}`}>
                            <div className='status-item-left'>
                                <div className='status-icon-box server'>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                    </svg>
                                </div>
                                <span className='status-label'>System API</span>
                            </div>
                            <span className={`status-badge ${health.backend === 'OK' ? 'online' : 'offline'}`}>
                                {health.backend === 'OK' ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>

                        <div className={`status-item ${health.db !== 'Connected' ? 'error' : ''}`}>
                            <div className='status-item-left'>
                                <div className='status-icon-box db'>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                        <path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path>
                                    </svg>
                                </div>
                                <span className='status-label'>Database</span>
                            </div>
                            <span className={`status-badge ${health.db === 'Connected' ? 'online' : 'offline'}`}>
                                {health.db === 'Connected' ? 'Active' : 'Error'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='dashboard-col wide'>
                    <div className='panel-header-sm'>Recent Activity <Link to="/ViewTimetable" className='link-xs'>View All</Link></div>
                    <div className='compact-table-container'>
                        {loading ? <div className='loading-xs'>Loading...</div> : recentExams.length === 0 ? <div className='empty-xs'>No recent exams found.</div> : (
                            <table className='compact-table rich-activity-table'>
                                <thead><tr><th>Date</th><th>Course</th><th>Sem</th></tr></thead>
                                <tbody>
                                    {recentExams.slice(0, 4).map((exam) => (
                                        <tr key={exam.id}>
                                            <td className='date-cell'>
                                                <div className='date-box'>
                                                    <span className='date-month'>{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                                                    <span className='date-day'>{new Date(exam.examDate).getDate()}</span>
                                                </div>
                                            </td>
                                            <td><div className='course-row'><div className='course-meta'><div className='course-name-text'>{exam.courseName}</div><div className='course-id-text'>Dept: <span className='dept-badge'>{exam.department || 'CSE'}</span></div></div></div></td>
                                            <td><span className='badge-pill-light'>SEM {exam.semester}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className='dashboard-col'>
                    <div className='panel-header-sm'>Insights</div>
                    <div className='insights-panel'>
                        <div className='insights-titlebar'><div className='insights-tab active'>Semester Distribution</div></div>
                        {Object.keys(semesterDistribution).length === 0 ? (
                            <div className='insights-content' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '1rem' }}>
                                <div className='insights-no-data' style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--textColor2)', fontSize: '0.85rem' }}>No exam data found to display charts.</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>

                                        <Link to="/ExamTimetable" className='btn-secondary btn-sm'>Schedule Exam</Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='insights-content' style={{ padding: '0 10px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                                <AnalyticsChart
                                    data={Object.entries(semesterDistribution)
                                        .sort(([a], [b]) => {
                                            const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                            const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                            return numA - numB;
                                        })
                                        .map(([sem, count]) => {
                                            const num = sem.replace(/\D/g, '');
                                            return { label: num || sem, value: count };
                                        })
                                    }
                                    title=""
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(DashboardPage);
