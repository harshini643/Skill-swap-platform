const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 3000;

// Simple in-memory database (in production, use a real database)
let database = {
  users: [
    {
      id: 1,
      email: 'marc@demo.com',
      password: 'password',
      name: 'Marc Demo',
      location: 'New York',
      profilePhoto: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      skillsOffered: ['JavaScript', 'React'],
      skillsWanted: ['Python', 'Machine Learning'],
      availability: 'weekends',
      isPublic: true,
      rating: 4.5,
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'michell@demo.com',
      password: 'password',
      name: 'Michell',
      location: 'San Francisco',
      profilePhoto: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      skillsOffered: ['Graphic Design', 'UI/UX'],
      skillsWanted: ['Photography', 'Video Editing'],
      availability: 'evenings',
      isPublic: true,
      rating: 3.8,
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      email: 'joe@demo.com',
      password: 'password',
      name: 'Joe Willis',
      location: 'Chicago',
      profilePhoto: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      skillsOffered: ['Guitar', 'Music Production'],
      skillsWanted: ['Piano', 'Singing'],
      availability: 'flexible',
      isPublic: true,
      rating: 4.8,
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Admin User',
      location: 'Remote',
      profilePhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      skillsOffered: ['Platform Management'],
      skillsWanted: [],
      availability: 'flexible',
      isPublic: false,
      rating: 5.0,
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  requests: [
    {
      id: 1,
      fromUserId: 1,
      toUserId: 2,
      offeredSkill: 'JavaScript',
      wantedSkill: 'Graphic Design',
      message: 'Hi! I would love to learn graphic design from you.',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ],
  sessions: {}
};

// Helper functions
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getContentType(filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  return types[ext] || 'text/plain';
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(querystring.parse(body));
      }
    });
  });
}

function getUserFromSession(req) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  
  const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('sessionId='));
  if (!sessionCookie) return null;
  
  const sessionId = sessionCookie.split('=')[1];
  const userId = database.sessions[sessionId];
  
  return userId ? database.users.find(u => u.id === userId) : null;
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// API Routes
async function handleAPI(req, res, pathname) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`API Request: ${req.method} ${pathname}`);

  // Login endpoint
  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    console.log('Login attempt:', body);
    console.log('Available users:', database.users.map(u => ({ email: u.email, id: u.id })));
    
    const user = database.users.find(u => u.email === body.email && u.password === body.password);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (user) {
      const sessionId = generateSessionId();
      database.sessions[sessionId] = user.id;
      
      res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        user: { ...user, password: undefined } 
      }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
    }
    return;
  }

  // Logout endpoint
  if (pathname === '/api/logout' && req.method === 'POST') {
    const cookies = req.headers.cookie;
    if (cookies) {
      const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('sessionId='));
      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1];
        delete database.sessions[sessionId];
      }
    }
    
    res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Get current user
  if (pathname === '/api/me' && req.method === 'GET') {
    const user = getUserFromSession(req);
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...user, password: undefined }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not authenticated' }));
    }
    return;
  }

  // Get all public users
  if (pathname === '/api/users' && req.method === 'GET') {
    const currentUser = getUserFromSession(req);
    const publicUsers = database.users
      .filter(u => u.isPublic && (!currentUser || u.id !== currentUser.id))
      .map(u => ({ ...u, password: undefined }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(publicUsers));
    return;
  }

  // Update user profile
  if (pathname === '/api/profile' && req.method === 'PUT') {
    const user = getUserFromSession(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not authenticated' }));
      return;
    }

    const body = await parseBody(req);
    const userIndex = database.users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      database.users[userIndex] = { ...database.users[userIndex], ...body };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user: { ...database.users[userIndex], password: undefined } }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    }
    return;
  }

  // Create swap request
  if (pathname === '/api/requests' && req.method === 'POST') {
    const user = getUserFromSession(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not authenticated' }));
      return;
    }

    const body = await parseBody(req);
    const newRequest = {
      id: database.requests.length + 1,
      fromUserId: user.id,
      toUserId: parseInt(body.toUserId),
      offeredSkill: body.offeredSkill,
      wantedSkill: body.wantedSkill,
      message: body.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    database.requests.push(newRequest);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, request: newRequest }));
    return;
  }

  // Get user's requests (received)
  if (pathname === '/api/requests' && req.method === 'GET') {
    const user = getUserFromSession(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not authenticated' }));
      return;
    }

    const userRequests = database.requests
      .filter(r => r.toUserId === user.id)
      .map(r => {
        const fromUser = database.users.find(u => u.id === r.fromUserId);
        return {
          ...r,
          fromUser: fromUser ? { ...fromUser, password: undefined } : null
        };
      });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userRequests));
    return;
  }

  // Update request status
  if (pathname.startsWith('/api/requests/') && req.method === 'PUT') {
    const user = getUserFromSession(req);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not authenticated' }));
      return;
    }

    const requestId = parseInt(pathname.split('/')[3]);
    const body = await parseBody(req);
    const requestIndex = database.requests.findIndex(r => r.id === requestId && r.toUserId === user.id);

    if (requestIndex !== -1) {
      database.requests[requestIndex].status = body.status;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, request: database.requests[requestIndex] }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Request not found' }));
    }
    return;
  }

  // Admin endpoints
  if (pathname.startsWith('/api/admin/')) {
    const user = getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Admin access required' }));
      return;
    }

    // Get all users (admin)
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const allUsers = database.users.map(u => ({ ...u, password: undefined }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allUsers));
      return;
    }

    // Get all requests (admin)
    if (pathname === '/api/admin/requests' && req.method === 'GET') {
      const allRequests = database.requests.map(r => {
        const fromUser = database.users.find(u => u.id === r.fromUserId);
        const toUser = database.users.find(u => u.id === r.toUserId);
        return {
          ...r,
          fromUser: fromUser ? { ...fromUser, password: undefined } : null,
          toUser: toUser ? { ...toUser, password: undefined } : null
        };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allRequests));
      return;
    }

    // Ban user (admin)
    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/ban') && req.method === 'PUT') {
      const userId = parseInt(pathname.split('/')[4]);
      const userIndex = database.users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        database.users[userIndex].banned = true;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      }
      return;
    }
  }

  // 404 for unknown API routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'API endpoint not found' }));
}

// Static file serving
function serveStaticFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    await handleAPI(req, res, pathname);
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // If it's a route that should serve index.html (SPA behavior)
    if (!pathname.includes('.')) {
      filePath = path.join(__dirname, 'index.html');
    } else {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
  }

  serveStaticFile(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Demo login credentials:');
  console.log('- marc@demo.com / password');
  console.log('- michell@demo.com / password');
  console.log('- joe@demo.com / password');
  console.log('- admin@demo.com / admin123');
});