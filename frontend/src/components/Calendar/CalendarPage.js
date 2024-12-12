import React, { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css"; // Import Flatpickr styles

function CalendarPage() {
    useEffect(() => {
        flatpickr("#datePicker", {
            mode: "multiple",
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: function (selectedDates, dateStr, instance) {
                // If more than 3 dates are selected, remove the most recently added date
                if (selectedDates.length > 3) {
                    selectedDates.pop();
                    instance.setDate(selectedDates, false); // Update the Flatpickr instance
                    alert("Maximum of 3 dates allowed!");
                }
            },
        });
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div className="CalendarPage">
            <form>
                <label htmlFor="datePicker">Choose dates:</label>
                <input type="text" id="datePicker" name="date-picker" />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CalendarPage;
