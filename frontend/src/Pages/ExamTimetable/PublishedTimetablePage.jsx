import { memo, useEffect, useState, useCallback } from 'react';
import '../../Style/Pages/ExamTimetablePage.css';
import { useAlert } from '../../Components/AlertContextProvider';
import { useConfirm } from '../../Components/ConfirmContextProvider';
import {
    getExams,
    printTimetable,
    downloadTimetable,
    formatTo12Hour,
    deleteExam,
    updateExam
} from '../../Script/ExamDataFetcher';
import Trash from '../../Icons/Trash';
import EditIcon from '../../Icons/Edit';
import { getSubjectsDetailsList } from '../../Script/SubjectsDataFetcher';
import SearchIcon from '../../Icons/Search';
import ExamTimetableIcon from '../../Icons/ExamTimetableIcon';
import Printer from '../../Icons/Printer';
import Download from '../../Icons/Download';

import { TIME_SLOTS, SEMESTERS, DEPARTMENTS } from '../../Script/Constants';

function PublishedTimetablePage() {
    const { showError, showSuccess } = useAlert();
    const { showErrorConfirm } = useConfirm();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSemester, setFilterSemester] = useState();
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterExamType, setFilterExamType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [editDepartment, setEditDepartment] = useState('');
    const [editSemester, setEditSemester] = useState(1);
    const [editCourse, setEditCourse] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editTimeSlot, setEditTimeSlot] = useState(0);
    const [editExamType, setEditExamType] = useState('MSE I');
    const [editTestCoordinator, setEditTestCoordinator] = useState('');
    const [subjectsDetails, setSubjectsDetails] = useState([]);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printDepartment, setPrintDepartment] = useState('');
    const [printSemester, setPrintSemester] = useState();
    const [printExamType, setPrintExamType] = useState('');

    // Download modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadDepartment, setDownloadDepartment] = useState('');
    const [downloadSemester, setDownloadSemester] = useState();
    const [downloadExamType, setDownloadExamType] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const examData = await getExams(filterSemester, filterDepartment || undefined, 'PUBLISHED');
            setExams(examData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filterSemester, filterDepartment]);

    useEffect(() => {
        loadData();
        getSubjectsDetailsList(data => {
            setSubjectsDetails(data);
        });
    }, [loadData, filterSemester, filterDepartment]);

    const handlePrint = () => {
        if (exams.length === 0) {
            showError('No exams available to print');
            return;
        }
        // Reset print filters and show modal
        setPrintDepartment('');
        setPrintSemester(undefined);
        setPrintExamType('');
        setShowPrintModal(true);
    };

    const handleConfirmPrint = () => {
        if (!printDepartment || !printSemester || !printExamType) {
            showError('Please select Department, Semester, and Exam Type');
            return;
        }

        // Filter exams based on selection
        const filteredExams = exams.filter(exam =>
            exam.department === printDepartment &&
            exam.semester === printSemester &&
            (printExamType === 'Retest' ? exam.examType.includes('Retest') : exam.examType === printExamType)
        );

        if (filteredExams.length === 0) {
            showError(`No exams found for ${printDepartment} SEM ${printSemester} ${printExamType}`);
            return;
        }

        setShowPrintModal(false);
        printTimetable(filteredExams, subjectsDetails, 'Examination Timetable');
    };

    const handleDownload = () => {
        if (exams.length === 0) {
            showError('No exams available to download');
            return;
        }
        // Reset download filters and show modal
        setDownloadDepartment('');
        setDownloadSemester(undefined);
        setDownloadExamType('');
        setShowDownloadModal(true);
    };

    const handleConfirmDownload = async () => {
        if (!downloadDepartment || !downloadSemester || !downloadExamType) {
            showError('Please select Department, Semester, and Exam Type');
            return;
        }

        // Filter exams based on selection
        const filteredExams = exams.filter(exam =>
            exam.department === downloadDepartment &&
            exam.semester === downloadSemester &&
            (downloadExamType === 'Retest' ? exam.examType.includes('Retest') : exam.examType === downloadExamType)
        );

        if (filteredExams.length === 0) {
            showError(`No exams found for ${downloadDepartment} SEM ${downloadSemester} ${downloadExamType}`);
            return;
        }

        setShowDownloadModal(false);

        // Direct PDF download with exact same format as print
        try {
            await downloadTimetable(filteredExams, subjectsDetails, 'Examination Timetable');
            showSuccess('PDF downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download PDF. Please try again.');
        }
    };

    const handleDelete = (id) => {
        showErrorConfirm('Permanently delete this exam?', () => {
            setLoading(true);
            deleteExam(
                id,
                () => {
                    showSuccess('Exam deleted successfully');
                    loadData();
                },
                (msg) => {
                    showError('Failed to delete exam: ' + msg);
                    setLoading(false);
                }
            );
        });
    };


    const handleEdit = (exam) => {
        showErrorConfirm(
            'Edit published exam? May affect schedules.',
            () => {
                setEditingExam(exam);
                setEditDepartment(exam.department || 'CSE');
                setEditSemester(exam.semester);
                setEditCourse(exam.courseName);
                setEditDate(exam.examDate);
                setEditStartTime(exam.startTime);
                setEditEndTime(exam.endTime);
                setEditExamType(exam.examType || 'MSE I');
                setEditTestCoordinator(exam.testCoordinator || '');

                // Find matching time slot
                const slotIdx = TIME_SLOTS.findIndex(s => s.start === exam.startTime);
                setEditTimeSlot(slotIdx >= 0 ? slotIdx : 0);

                setShowEditModal(true);
            }
        );
    };

    const handleSaveEdit = async () => {
        if (!editingExam) return;

        if (!editDepartment || !editSemester || !editCourse || !editDate || !editStartTime || !editEndTime || !editTestCoordinator) {
            showError('Please fill all required fields');
            return;
        }

        // Calculate duration in minutes
        const start = editStartTime.split(':');
        const end = editEndTime.split(':');
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        const durationMinutes = endMinutes - startMinutes;

        const updateData = {
            department: editDepartment,
            semester: editSemester,
            courseName: editCourse,
            examDate: editDate,
            startTime: editStartTime,
            endTime: editEndTime,
            durationMinutes: durationMinutes,
            examType: editExamType,
            testCoordinator: editTestCoordinator
        };

        setLoading(true);
        updateExam(
            editingExam.id,
            updateData,
            () => {
                showSuccess('Exam updated successfully');
                setShowEditModal(false);
                setEditingExam(null);
                loadData();
            },
            (msg) => {
                showError(msg);
                setLoading(false);
            }
        );
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingExam(null);
    };

    // Filter and group exams by date
    const examsByDate = exams
        .filter(exam => {
            // Exam type filter
            if (filterExamType && exam.examType !== filterExamType) return false;
            // Search query filter (by name, department, or date)
            const query = searchQuery.trim().toLowerCase();
            if (!query) return true;
            if (exam.courseName && exam.courseName.toLowerCase().includes(query)) return true;
            if (exam.department && exam.department.toLowerCase().includes(query)) return true;
            if (exam.examDate) {
                const dateStr = String(exam.examDate);

                // 1. Match raw API format "2026-01-29"
                if (dateStr.includes(query)) return true;

                // 2. Match dd-mm-yyyy format using string manipulation (reliable for ISO strings)
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const ddmmyyyy = `${parts[2]}-${parts[1]}-${parts[0]}`; // 29-01-2026
                    if (ddmmyyyy.includes(query)) return true;
                }

                // 3. Match displayed date format accurately (handling timezone shifts)
                try {
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        const displayDate = `${day}-${month}-${year}`;

                        if (displayDate.includes(query)) return true;

                        // Also match human formats
                        const long = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
                        if (long.includes(query)) return true;
                    }
                } catch (e) { /* ignore */ }
            }
            return false;
        })
        .reduce((acc, exam) => {
            if (!acc[exam.examDate]) acc[exam.examDate] = [];
            acc[exam.examDate].push(exam);
            return acc;
        }, {});

    return (
        <div className='page exam-timetable student-view'>
            <div className='page-header'>
                <h1 className='page-title'>
                    <span className='title-icon'><ExamTimetableIcon size={28} /></span>
                    Published Examination Timetable
                </h1>
                <div className='header-actions'>

                    {exams.length > 0 && (
                        <>
                            <button
                                className='btn btn-print'
                                onClick={handlePrint}
                            >
                                <Printer width={14} height={14} /> Print
                            </button>
                            <button
                                className='btn btn-download'
                                onClick={handleDownload}
                            >
                                <Download width={14} height={14} /> Download
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className='filter-section'>
                <div className='filter-bar'>
                    <label>Filter by:</label>
                    <select
                        value={filterDepartment}
                        onChange={e => setFilterDepartment(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select
                        value={filterSemester || ''}
                        onChange={e => setFilterSemester(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">All Semesters</option>
                        {SEMESTERS.map(sem => (
                            <option key={sem} value={sem}>SEM {sem}</option>
                        ))}
                    </select>
                    <select
                        value={filterExamType}
                        onChange={e => setFilterExamType(e.target.value)}
                    >
                        <option value="">Exam Type</option>
                        <option value="MSE I">MSE I</option>
                        <option value="MSE II">MSE II</option>
                        <option value="Retest MSE I">Retest MSE I</option>
                        <option value="Retest MSE II">Retest MSE II</option>
                    </select>

                    <div className="exam-search-container" style={{ marginLeft: 'auto' }}>
                        <span className="exam-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '16px', height: '16px' }}>
                                <SearchIcon fillColor="#64748b" />
                            </div>
                        </span>
                        <input
                            type="text"
                            className="exam-search-input"
                            placeholder="Search by name or date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Timetable Display */}
            <div className='timetable-display'>
                {loading ? (
                    <div className='loading-state'>Loading...</div>
                ) : exams.length === 0 ? (
                    <div className='empty-state'>
                        <p>📭 No published examination timetable available yet.</p>
                        <p>Please check back later.</p>
                    </div>
                ) : (
                    <div className='exam-table-container'>
                        <table className='exam-table'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Exam Type</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                    <th>Course</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(examsByDate)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .flatMap(([date, dateExams]) =>
                                        dateExams.map((exam, idx) => (
                                            <tr key={exam.id}>
                                                {idx === 0 && (
                                                    <td rowSpan={dateExams.length} className='date-cell'>
                                                        {(() => {
                                                            const d = new Date(date);
                                                            const day = String(d.getDate()).padStart(2, '0');
                                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                                            const year = d.getFullYear();
                                                            return `${day}-${month}-${year}`;
                                                        })()}
                                                    </td>
                                                )}
                                                <td>{formatTo12Hour(exam.startTime)} - {formatTo12Hour(exam.endTime)}</td>
                                                <td style={{ textAlign: 'center' }}><span className='exam-type-badge'>{exam.examType || '-'}</span></td>
                                                <td><span className='dept-badge'>{exam.department || 'N/A'}</span></td>
                                                <td><span className='sem-badge'>SEM {exam.semester}</span></td>
                                                <td>{exam.courseName}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            className='btn-icon'
                                                            title='Edit Exam'
                                                            onClick={() => handleEdit(exam)}
                                                            style={{ width: '32px', height: '32px', padding: '6px' }}
                                                        >
                                                            <EditIcon width={16} height={16} />
                                                        </button>
                                                        <button
                                                            className='btn-icon delete'
                                                            title='Delete Exam'
                                                            onClick={() => handleDelete(exam.id)}
                                                            style={{ width: '32px', height: '32px', padding: '6px' }}
                                                        >
                                                            <Trash width={16} height={16} fill="currentColor" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            {/* Edit Modal */}
            {showEditModal && editingExam && (
                <div className='modal-overlay' onClick={handleCancelEdit}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <EditIcon width={20} height={20} />
                                Edit Exam
                            </h2>
                            <button className='modal-close-btn' onClick={handleCancelEdit} title='Close'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Department *</label>
                                    <select
                                        value={editDepartment}
                                        onChange={(e) => setEditDepartment(e.target.value)}
                                        className='form-select'
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='form-group'>
                                    <label>Semester *</label>
                                    <select
                                        value={editSemester}
                                        onChange={(e) => setEditSemester(Number(e.target.value))}
                                        className='form-select'
                                    >
                                        {SEMESTERS.map(sem => (
                                            <option key={sem} value={sem}>SEM {sem}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>Course *</label>
                                <select
                                    value={editCourse}
                                    onChange={(e) => setEditCourse(e.target.value)}
                                    className='form-select'
                                >
                                    <option value="">Select a course</option>
                                    {/* Show current course if it exists and isn't in the filtered list */}
                                    {editCourse && !subjectsDetails.some(s => s.name === editCourse && s.semester === editSemester) && (
                                        <option value={editCourse}>{editCourse} (Current)</option>
                                    )}
                                    {subjectsDetails
                                        .filter(s => s.semester === editSemester)
                                        .map(subject => (
                                            <option key={subject.name} value={subject.name}>
                                                {subject.name} ({subject.subjectCode})
                                            </option>
                                        ))
                                    }
                                    {/* Fallback: show all subjects if none match the semester */}
                                    {subjectsDetails.filter(s => s.semester === editSemester).length === 0 &&
                                        subjectsDetails.length > 0 && (
                                            <>
                                                <option disabled>─── All Subjects ───</option>
                                                {subjectsDetails.map(subject => (
                                                    <option key={subject.name} value={subject.name}>
                                                        {subject.name} ({subject.subjectCode}) - SEM {subject.semester}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                </select>
                            </div>

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Exam Date *</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className='form-input'
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Exam Type</label>
                                    <select
                                        value={editExamType}
                                        onChange={(e) => setEditExamType(e.target.value)}
                                        className='form-select'
                                    >
                                        <option value="MSE I">MSE I</option>
                                        <option value="MSE II">MSE II</option>
                                        <option value="Retest MSE I">Retest MSE I</option>
                                        <option value="Retest MSE II">Retest MSE II</option>
                                    </select>
                                </div>
                            </div>

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Time Slot *</label>
                                    <select
                                        value={editTimeSlot}
                                        onChange={(e) => {
                                            const idx = Number(e.target.value);
                                            setEditTimeSlot(idx);
                                            setEditStartTime(TIME_SLOTS[idx].start);
                                            setEditEndTime(TIME_SLOTS[idx].end);
                                        }}
                                        className='form-select'
                                    >
                                        {TIME_SLOTS.map((slot, idx) => (
                                            <option key={idx} value={idx}>
                                                {slot.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='form-group'>
                                    <label>Test Coordinator *</label>
                                    <input
                                        type="text"
                                        value={editTestCoordinator}
                                        onChange={(e) => setEditTestCoordinator(e.target.value)}
                                        className='form-input'
                                        placeholder="Coordinator"
                                    />
                                </div>
                            </div>


                        </div>
                        <div className='modal-footer'>
                            <button className='btn modal-cancel-btn' onClick={handleCancelEdit}>
                                Cancel
                            </button>
                            <button className='btn modal-save-btn' onClick={handleSaveEdit}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .student-view .filter-section {
                    background: var(--containerColor, #fff);
                    padding: 1rem 1.25rem;
                    border-radius: 10px;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .student-view .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .student-view .filter-bar label {
                    font-weight: 500;
                    color: var(--textColor2, #666);
                }
                .student-view .timetable-display {
                    background: var(--containerColor, #fff);
                    padding: 1.25rem;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .student-view .loading-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--textColor2, #888);
                }
                .student-view .timetable-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: var(--textColor2, #666);
                }
                .student-view .note {
                    font-style: italic;
                }

                /* Professional Adaptive UI (Light Default, Dark Override) */
                
                /* LIGHT MODE (Default) */
                .modal-content {
                    background: #ffffff;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    color: #24292f;
                    border: 1px solid #d0d7de;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                .modal-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #d0d7de;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #24292f;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-body {
                    padding: 1rem 1.25rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 0.85rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.35rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #57606a;
                }

                .form-select,
                .form-input {
                    width: 100%;
                    padding: 0.6rem 0.85rem;
                    border: 1px solid #d0d7de;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    background: #f6f8fa;
                    color: #24292f;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-select:focus,
                .form-input:focus {
                    outline: none;
                    border-color: #0969da; /* Light mode focus blue */
                    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
                    background: #ffffff;
                }

                .form-input[type="date"] {
                    color-scheme: light;
                }

                .modal-footer {
                    padding: 0.85rem 1.25rem;
                    border-top: 1px solid #d0d7de;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    background: #ffffff;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
                
                /* Close button */
                .modal-close-btn {
                    background: none;
                    border: none;
                    color: #656d76;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    transition: all 0.15s ease;
                }
                .modal-close-btn:hover {
                    background: rgba(0, 0, 0, 0.06);
                    color: #24292f;
                }

                /* Save Button */
                .btn.modal-save-btn {
                    background: rgba(37, 99, 235, 0.08);
                    color: #2563eb;
                    border: 1.5px solid #2563eb;
                    border-radius: 8px;
                    padding: 0.5rem 1.25rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    box-shadow: none;
                    transition: all 0.2s ease;
                }
                .btn.modal-save-btn:hover {
                    background: rgba(37, 99, 235, 0.14);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
                }

                /* Cancel Button */
                .btn.modal-cancel-btn {
                    background: transparent;
                    color: #656d76;
                    border: 1.5px solid #d0d7de;
                    border-radius: 8px;
                    padding: 0.5rem 1.25rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    box-shadow: none;
                    transition: all 0.2s ease;
                }
                .btn.modal-cancel-btn:hover {
                    background: rgba(0, 0, 0, 0.04);
                    border-color: #afb8c1;
                    color: #24292f;
                }

                .form-select:hover,
                .form-input:hover {
                    border-color: #afb8c1;
                }

                /* DARK MODE OVERRIDES */
                body.dark .modal-content {
                    background: #161b22;
                    border-color: #30363d;
                    color: #e6edf3;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                }

                body.dark .modal-header {
                    border-bottom-color: #30363d;
                }

                body.dark .modal-header h2 {
                    color: #e6edf3;
                }

                body.dark .form-group label {
                    color: #c9d1d9;
                }

                body.dark .form-select,
                body.dark .form-input {
                    background: #0d1117;
                    border-color: #30363d;
                    color: #e6edf3;
                }

                body.dark .form-select:focus,
                body.dark .form-input:focus {
                    border-color: #58a6ff;
                    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
                    background: #0d1117;
                }

                body.dark .form-input[type="date"] {
                    /* Providing a default to ensure filter works consistently */
                    color-scheme: normal;
                }
                
                body.dark .form-input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) brightness(1.5);
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                body.dark .form-input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }

                body.dark .modal-footer {
                    background: #161b22;
                    border-top-color: #30363d;
                }

                /* Dark mode for new modal buttons */
                body.dark .modal-close-btn {
                    color: #8b949e;
                }
                body.dark .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #e6edf3;
                }

                body.dark .btn.modal-save-btn {
                    background: rgba(59, 130, 246, 0.1);
                    color: #60a5fa;
                    border-color: rgba(96, 165, 250, 0.5);
                }
                body.dark .btn.modal-save-btn:hover {
                    background: rgba(59, 130, 246, 0.18);
                    border-color: #60a5fa;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
                }

                body.dark .btn.modal-cancel-btn {
                    background: transparent;
                    color: #8b949e;
                    border-color: #30363d;
                }
                body.dark .btn.modal-cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: #8b949e;
                    color: #c9d1d9;
                }

                body.dark .form-select:hover,
                body.dark .form-input:hover {
                    border-color: #484f58;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .student-view .filter-bar {
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        padding-bottom: 5px;
                        padding-right: 20px; /* Ensure last item isn't cut off */
                        -webkit-overflow-scrolling: touch;
                        gap: 10px;
                    }
                    
                    .student-view .filter-bar > * {
                        flex-shrink: 0;
                    }
                    
                    /* Hide scrollbar for cleaner look */
                    .student-view .filter-bar::-webkit-scrollbar {
                        height: 0px;
                        background: transparent;
                    }

                    .modal-content {
                        width: 95%;
                        padding: 0;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Print Selection Modal */}
            {showPrintModal && (
                <div className='modal-overlay' style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className='modal-content' style={{
                        background: 'var(--containerColor)',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Printer width={20} height={20} color="#6366f1" /> Print Timetable
                        </h3>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department *</label>
                            <select
                                value={printDepartment}
                                onChange={e => setPrintDepartment(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Semester *</label>
                            <select
                                value={printSemester || ''}
                                onChange={e => setPrintSemester(e.target.value ? Number(e.target.value) : undefined)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map(sem => (
                                    <option key={sem} value={sem}>SEM {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Type *</label>
                            <select
                                value={printExamType}
                                onChange={e => setPrintExamType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Exam Type</option>
                                <option value="MSE I">MSE I</option>
                                <option value="MSE II">MSE II</option>
                                <option value="Retest">Retest</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className='btn secondary'
                                onClick={() => setShowPrintModal(false)}
                                style={{ padding: '10px 20px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn primary'
                                onClick={handleConfirmPrint}
                                style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Printer width={16} height={16} color="white" /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Selection Modal */}
            {showDownloadModal && (
                <div className='modal-overlay' style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className='modal-content' style={{
                        background: 'var(--containerColor)',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Download width={20} height={20} color="#28a745" /> Download Timetable
                        </h3>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department *</label>
                            <select
                                value={downloadDepartment}
                                onChange={e => setDownloadDepartment(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Semester *</label>
                            <select
                                value={downloadSemester || ''}
                                onChange={e => setDownloadSemester(e.target.value ? Number(e.target.value) : undefined)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Type *</label>
                            <select
                                value={downloadExamType}
                                onChange={e => setDownloadExamType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Exam Type</option>
                                <option value="MSE I">MSE I</option>
                                <option value="MSE II">MSE II</option>
                                <option value="Retest">Retest</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className='btn secondary'
                                onClick={() => setShowDownloadModal(false)}
                                style={{ padding: '10px 20px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn primary'
                                onClick={handleConfirmDownload}
                                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                <Download width={14} height={14} color="white" /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(PublishedTimetablePage);
