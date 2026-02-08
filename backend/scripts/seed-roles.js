import 'dotenv/config';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

const users = [
  {
    email: 'delivery@gmail.com',
    password: 'delivery123',
    name: 'Delivery Driver',
    role: 'deliveryDriver'
  }
];

async function seedUsers() {
  for (const user of users) {
    try {
      console.log(`Creating user: ${user.email}`);

      const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          emailVerified: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to create user ${user.email}: ${response.status} - ${errorText}`);
      } else {
        const data = await response.json();
        console.log(`Successfully created user: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
}

seedUsers().then(() => {
  console.log('Seeding completed');
}).catch(console.error);