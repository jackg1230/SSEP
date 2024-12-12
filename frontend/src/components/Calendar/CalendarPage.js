import React, { useState, useEffect } from "react";
import "./CalendarPage.css";
import { useUser } from "../../context/UserContext";
import flatpickr from "flatpickr";

flatpickr(element, {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        mode: "multiple",
        minDate: "today",
        maxDate: new Date().fp_incr(14)
});





export default CalendarPage;