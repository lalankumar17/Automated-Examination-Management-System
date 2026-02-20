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
                "  background-color: #f8fafc; " + // Light elegant background
                "  color: #1e293b; " + // Dark professional text
                "}" +
                ".container { " +
                "  text-align: center; " +
                "  padding: 2rem 3rem; " +
                "  background: white; " +
                "  border-radius: 12px; " +
                "  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); " +
                "}" +
                "h1 { " +
                "  font-size: 1.5rem; " +
                "  margin-bottom: 0.5rem; " +
                "  font-weight: 600; " +
                "  display: flex; " +
                "  align-items: center; " +
                "  gap: 12px; " +
                "  justify-content: center; " +
                "}" +
                ".icon { " +
                "  display: inline-flex; " +
                "  align-items: center; " +
                "  justify-content: center; " +
                "  width: 40px; " +
                "  height: 40px; " +
                "  background-color: #dcfce7; " + // Light green bg
                "  border-radius: 50%; " +
                "  color: #16a34a; " + // Professional green
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <h1>" +
                "    Timetable Backend is successfully running!" +
                "    <span class='icon'>" +
                "      <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='2' y1='12' x2='22' y2='12'></line><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path></svg>"
                +
                "    </span>" +
                "  </h1>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
