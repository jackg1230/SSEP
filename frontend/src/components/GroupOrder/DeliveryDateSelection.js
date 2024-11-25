import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DeliveryDateSelection({ selectedDate, onDateChange }) {
  return (
    <div className="delivery-date-picker">
      <h3>Schedule Delivery</h3>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => onDateChange(date)}
      />
    </div>
  );
}