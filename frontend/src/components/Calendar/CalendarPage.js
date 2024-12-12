import React, { useState, useEffect } from "react";
import "./CalendarPage.css";
import { useUser } from "../../context/UserContext";
import flatpickr from "flatpickr";




function CalendarPage(){

    flatpickr("#datePicker", {
        mode: "multiple",
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date.fp_incr(14),
        onChange: function(selectedDates, dateStr, instance) {
            // If more than 3 dates are selected, remove the most recently added date
            if (selectedDates.length > 3) {
                selectedDates.pop();
                instance.setDate(selectedDates, false); // Update the Flatpickr instance
                alert("Maximum of 3 dates allowed!");
            }
        }
    });

    return(
        <div className="CalendarPage">
            <input type="text" id="datePicker" placeholder="Select dates"></input>
        </div>
    );
}