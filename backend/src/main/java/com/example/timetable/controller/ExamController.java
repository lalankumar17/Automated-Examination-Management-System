package com.example.timetable.controller;

import com.example.timetable.model.Exam;
import com.example.timetable.model.Exam.ExamStatus;
import com.example.timetable.service.ExamService;
import com.example.timetable.service.ExamService.ConflictResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamService examService;

    // Get all exams with optional filters
    @GetMapping
    public List<Exam> getAllExams(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) ExamStatus status) {
        return examService.getExams(semester, department, status);
    }

    // Schedule a new exam
    @PostMapping
    public ResponseEntity<?> scheduleExam(@RequestBody ExamRequest request) {

        try {
            Exam exam = new Exam();
            exam.setSemester(request.semester);
            exam.setCourseName(request.courseName);
            exam.setExamDate(LocalDate.parse(request.examDate));
            exam.setStartTime(LocalTime.parse(request.startTime));
            exam.setEndTime(LocalTime.parse(request.endTime));
            exam.setHallId(request.hallId);
            exam.setFacultyName(request.facultyName);
            exam.setDepartment(request.department);
            exam.setDurationMinutes(request.durationMinutes != null ? request.durationMinutes : 120);
            exam.setTestCoordinator(request.testCoordinator);
            exam.setHod(request.hod);
            exam.setExamType(request.examType);

            Exam saved = examService.scheduleExam(exam);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {

            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update exam (manual adjustment)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable String id, @RequestBody ExamRequest request) {
        try {
            Exam updates = new Exam();
            if (request.semester != null)
                updates.setSemester(request.semester);
            if (request.courseName != null)
                updates.setCourseName(request.courseName);
            if (request.department != null)
                updates.setDepartment(request.department);
            if (request.examDate != null)
                updates.setExamDate(LocalDate.parse(request.examDate));
            if (request.startTime != null)
                updates.setStartTime(LocalTime.parse(request.startTime));
            if (request.endTime != null)
                updates.setEndTime(LocalTime.parse(request.endTime));
            if (request.durationMinutes != null)
                updates.setDurationMinutes(request.durationMinutes);
            updates.setHallId(request.hallId);
            updates.setFacultyName(request.facultyName);
            updates.setTestCoordinator(request.testCoordinator);
            updates.setHod(request.hod);
            updates.setExamType(request.examType);

            Exam updated = examService.updateExam(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete exam
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable String id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Detect conflicts
    @GetMapping("/conflicts")
    public ResponseEntity<ConflictResult> detectConflicts(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(examService.detectConflicts(semester, department));
    }

    // Auto-resolve conflicts
    @PostMapping("/auto-resolve")
    public ResponseEntity<?> autoResolve(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        try {
            int resolved = examService.autoResolveConflicts(semester, department);
            return ResponseEntity.ok(Map.of(
                    "resolved", resolved,
                    "message", resolved > 0 ? "Resolved " + resolved + " conflicts" : "No conflicts to resolve"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Publish timetable
    @PutMapping("/publish")
    public ResponseEntity<?> publish(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        try {
            int published = examService.publishTimetable(semester, department);
            return ResponseEntity.ok(Map.of(
                    "published", published,
                    "message", "Published " + published + " exam(s)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get status
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> stats = new HashMap<>(examService.getStatus());
        return ResponseEntity.ok(stats);
    }

    // Get departments list
    @GetMapping("/departments")
    public List<String> getDepartments() {
        return examService.getDepartments();
    }

    // Endpoint to update all old time slots to new ones
    @PostMapping("/update-all-times")
    public ResponseEntity<?> updateAllTimes() {
        List<Exam> exams = examService.getExams(null, null, null);
        int updatedCount = 0;

        for (Exam exam : exams) {
            boolean changed = false;

            // Morning Slot: 9:00 - 12:00 => 9:30 - 11:00
            if (exam.getStartTime().toString().equals("09:00")) {
                exam.setStartTime(LocalTime.parse("09:30"));
                exam.setEndTime(LocalTime.parse("11:00"));
                exam.setDurationMinutes(90);
                changed = true;
            }
            // Afternoon Slot: 13:00 - 16:00 => 13:30 - 15:00
            else if (exam.getStartTime().toString().equals("13:00") || exam.getStartTime().toString().equals("01:00")) {
                exam.setStartTime(LocalTime.parse("13:30"));
                exam.setEndTime(LocalTime.parse("15:00"));
                exam.setDurationMinutes(90);
                changed = true;
            }

            if (changed) {
                examService.updateExam(exam.getId(), exam);
                updatedCount++;
            }
        }

        return ResponseEntity.ok(Map.of("message", "Updated " + updatedCount + " exams to new timings"));
    }

    // DTO for requests
    static class ExamRequest {
        public Integer semester;
        public String courseName;
        public String examDate;
        public String startTime;
        public String endTime;
        public String hallId;
        public String facultyName;
        public String department;
        public Integer durationMinutes;
        public String testCoordinator;
        public String hod;
        public String examType;
    }
}
