import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css'; // Optional for additional custom styles

const MyCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            setDate(value);
          } else if (Array.isArray(value) && value[0] instanceof Date) {
            setDate(value[0]);
          }
        }}
        value={date}
        // You can add more props here later for customization, e.g., minDetail="month"
      />
    </div>
  );
};

export default MyCalendar;