const http = require('http');
const sequelize = require('./config/database');
const Contact = require('./models/contact');
const { Op } = require('sequelize');

// Sync database
sequelize.sync();

// Find contacts based on email or phone number
const findContacts = async (email, phoneNumber) => {
  return await Contact.findAll({
    where: {
      [Op.or]: [
        { email: email || null },
        { phoneNumber: phoneNumber || null }
      ]
    },
    order: [['createdAt', 'ASC']]
  });
};

// Handle incoming HTTP requests
const handleRequest = async (req, res) => {
  if (req.method === 'POST' && req.url === '/identify') {
    // /identify
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { email, phoneNumber } = JSON.parse(body);

        const contacts = await findContacts(email, phoneNumber);

        if (contacts.length === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'No contacts found' }));
          return;
        }

        // Find the earliest contact and set it as the primary
        let primaryContact = contacts[0];  // The first contact is the earliest
        await primaryContact.update({ linkPrecedence: 'primary' });

        // All other contacts will become secondary
        const secondaryContacts = contacts.slice(1);
        for (const secondaryContact of secondaryContacts) {
          await secondaryContact.update({
            linkedId: primaryContact.id,
            linkPrecedence: 'secondary'
          });
        }

        const secondaryContactIds = secondaryContacts.map(contact => contact.id);
        const emails = Array.from(new Set(contacts.map(contact => contact.email)));
        const phoneNumbers = Array.from(new Set(contacts.map(contact => contact.phoneNumber)));

        const response = {
          contact: {
            primaryContactId: primaryContact.id,
            emails,
            phoneNumbers,
            secondaryContactIds
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));

      } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
};

// Create HTTP server
const server = http.createServer(handleRequest);



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});





