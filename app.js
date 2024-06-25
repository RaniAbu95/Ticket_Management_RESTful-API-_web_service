const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let ticketsData;
try {
  ticketsData = JSON.parse(fs.readFileSync('input file/data.json', 'utf8'));
} catch (error) {
  console.error('Error reading or parsing data file:', error);
  process.exit(1); // Exit the application if data can't be loaded
}

// Helper function to save tickets data
function saveTicketsData() {
  fs.writeFileSync('input file/data.json', JSON.stringify(ticketsData, null, 2));
}

// GET /tickets - Fetch all tickets (with optional query parameters for filtering)
app.get('/tickets', (req, res) => {
  const { from, to, search } = req.query;

  let filteredTickets = ticketsData;

  if (search) {
    const searchQuery = search.toLowerCase();
    filteredTickets = filteredTickets.filter(ticket => {
      const { title, content, userEmail } = ticket;
      return (
          title.toLowerCase().includes(searchQuery) ||
          content.toLowerCase().includes(searchQuery) ||
          userEmail.toLowerCase().includes(searchQuery)
      );
    });
  }

  if (from && to) {
    const fromTime = parseInt(from);
    const toTime = parseInt(to);
    filteredTickets = filteredTickets.filter(ticket => ticket.creationTime >= fromTime && ticket.creationTime <= toTime);
  } else if (from) {
    const fromTime = parseInt(from);
    filteredTickets = filteredTickets.filter(ticket => ticket.creationTime >= fromTime);
  } else if (to) {
    const toTime = parseInt(to);
    filteredTickets = filteredTickets.filter(ticket => ticket.creationTime <= toTime);
  }

  res.json(filteredTickets);
});

// GET /tickets/:id - Fetch a single ticket by its ID
app.get('/tickets/:id', (req, res) => {
  const ticket = ticketsData.find(ticket => ticket.id === req.params.id);
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).send('Ticket not found');
  }
});

// POST /tickets - Create a new ticket
app.post('/tickets', (req, res) => {
  const newTicket = req.body;
  ticketsData.push(newTicket);
  saveTicketsData();
  res.status(201).json(newTicket);
});

// PUT /tickets/:id - Update a ticket by its ID
app.put('/tickets/:id', (req, res) => {
  const index = ticketsData.findIndex(ticket => ticket.id === req.params.id);
  if (index !== -1) {
    ticketsData[index] = { ...ticketsData[index], ...req.body };
    saveTicketsData();
    res.json(ticketsData[index]);
  } else {
    res.status(404).send('Ticket not found');
  }
});

// DELETE /tickets/:id - Delete a ticket by its ID
app.delete('/tickets/:id', (req, res) => {
  const index = ticketsData.findIndex(ticket => ticket.id === req.params.id);
  if (index !== -1) {
    const deletedTicket = ticketsData.splice(index, 1);
    saveTicketsData();
    res.json(deletedTicket);
  } else {
    res.status(404).send('Ticket not found');
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
