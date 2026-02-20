package com.example.timetable.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<title>Timetable Backend</title>" +
                "<style>" +
                "body { " +
                "  display: flex; " +
                "  justify-content: center; " +
                "  align-items: center; " +
                "  height: 100vh; " +
                "  margin: 0; " +
                "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; " +
                "  background-color: #f8fafc; " +
                "  color: #1e293b; " +
                "}" +
                ".container { " +
                "  text-align: center; " +
                "  padding: 3rem 4rem; " +
                "  background: white; " +
                "  border-radius: 16px; " +
                "  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); " +
                "  max-width: 500px; " +
                "}" +
                ".icons-wrapper { " +
                "  display: flex; " +
                "  justify-content: center; " +
                "  align-items: center; " +
                "  gap: 20px; " +
                "  margin-bottom: 24px; " +
                "}" +
                ".icon { " +
                "  display: inline-flex; " +
                "  align-items: center; " +
                "  justify-content: center; " +
                "  width: 64px; " +
                "  height: 64px; " +
                "  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); " +
                "}" +
                ".icon.globe { " +
                "  background-color: #242f36; " +
                "  border-radius: 20px; " +
                "  color: #4ade80; " +
                "}" +
                ".icon.check { " +
                "  background-color: #dcfce7; " +
                "  border-radius: 50%; " +
                "  color: #16a34a; " +
                "}" +
                ".icon svg { " +
                "  width: 32px; " +
                "  height: 32px; " +
                "}" +
                "h1 { " +
                "  font-size: 1.75rem; " +
                "  margin: 0 0 0.5rem 0; " +
                "  font-weight: 700; " +
                "  color: #0f172a; " +
                "}" +
                "p { " +
                "  margin: 0; " +
                "  color: #64748b; " +
                "  font-size: 1.1rem; " +
                "  line-height: 1.5; " +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='icons-wrapper'>" +
                "    <span class='icon check'>" +
                "      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>"
                +
                "    </span>" +
                "    <span class='icon globe'>" +
                "      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='2' y1='12' x2='22' y2='12'></line><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path></svg>"
                +
                "    </span>" +
                "  </div>" +
                "  <h1>Timetable Backend is successfully running!</h1>" +
                "  <p>The backend system is online and ready to accept incoming requests.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
