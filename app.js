const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Sample data representing doctor's calendar
let doctorCalendar = [];

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// POST method to create a new appointment
app.post('/appointments', (req, res) => {
    const newAppointment = req.body;
  
    // Validate the request body
    if (!newAppointment || !newAppointment.patient || !newAppointment.date || !newAppointment.time) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  
    // Check for conflicting appointments
    const conflict = doctorCalendar.some(appointment => appointment.dateTime === newAppointment.date + 'T' + newAppointment.time);
    if (conflict) {
      return res.status(409).json({ error: 'Appointment time slot is already booked' });
    }
  
    // Assign a unique ID to the new appointment
    newAppointment.id = doctorCalendar.length + 1;
  
    // Add the new appointment to the calendar
    doctorCalendar.push(newAppointment);
    res.status(201).json(newAppointment);
  });

// GET method to retrieve all appointments
app.get('/appointments', (req, res) => {
  res.json(doctorCalendar);
});

// GET method to retrieve a specific appointment by ID
app.get('/appointments/:id', (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const appointment = doctorCalendar.find(appointment => appointment.id === appointmentId);

  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// GET method to retrieve appointments by service
app.get('/appointments/byService', (req, res) => {
  const service = req.query.service;
  const appointmentsByService = doctorCalendar.filter(appointment => appointment.service === service);

  if (appointmentsByService.length > 0) {
    res.json(appointmentsByService);
  } else {
    res.status(404).json({ error: 'Appointments not found for the specified service' });
  }
});

// GET method to retrieve appointments by patient name
app.get('/appointments/byName', (req, res) => {
    const patientName = req.query.patient;
    const appointmentsByPatientName = doctorCalendar.filter(appointment => appointment.patient === patientName);
  
    if (appointmentsByPatientName.length > 0) {
      res.json(appointmentsByPatientName);
    } else {
      res.status(404).json({ error: 'Appointments not found for the specified patient name' });
    }
  });

// GET method to retrieve appointments by time period
app.get('/appointments/byTimePeriod', (req, res) => {
  const startDate = req.query.startDate;
  const startTime = req.query.startTime;

  const startDateTime = new Date(`${startDate}T${startTime}`);

  const appointmentsByTimePeriod = doctorCalendar.filter(
    appointment => {
      const appointmentDateTime = new Date(appointment.date + 'T' + appointment.time);
      return appointmentDateTime >= startDateTime;
    }
  );

  if (appointmentsByTimePeriod.length > 0) {
    res.json(appointmentsByTimePeriod);
  } else {
    res.status(404).json({ error: 'Appointments not found for the specified time period' });
  }
});

 // PUT method to update an existing appointment
 app.put('/appointments/:id', (req, res) => {
    const appointmentId = parseInt(req.params.id);
    const updatedAppointment = req.body;
  
    // Validate the request body
    if (!updatedAppointment || !updatedAppointment.patient || !updatedAppointment.date || !updatedAppointment.time) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  
    // Find the appointment in the calendar
    const existingAppointment = doctorCalendar.find(appointment => appointment.id === appointmentId);
  
    // If the appointment is not found, return 404
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  
    // Update the existing appointment
    Object.assign(existingAppointment, updatedAppointment);
  
    res.json(existingAppointment);
  });
  
  // DELETE method to delete an appointment
    app.delete('/appointments/:id', (req, res) => {
    const appointmentId = parseInt(req.params.id);
  
    // Find the index of the appointment in the calendar
    const appointmentIndex = doctorCalendar.findIndex(appointment => appointment.id === appointmentId);
  
    // If the appointment is not found, return 404
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
  
    // Remove the appointment from the calendar
    doctorCalendar.splice(appointmentIndex, 1);
  
    res.json({ message: 'Appointment deleted successfully' });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
