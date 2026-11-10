import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { VideoSummary } from '../models/VideoSummary.js';

async function runAuthTests() {
  console.log('--- Running Authentication & Authorization Tests ---');

  await connectDB();

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test Developer';

  await User.deleteMany({ email: { $regex: '@example.com$' } });

  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });

  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regData.success, true);
  assert.ok(regData.token);
  assert.strictEqual(regData.user.email, testEmail);
  console.log('User registration test passed');

  const token = regData.token;

  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });

  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginData.success, true);
  assert.ok(loginData.token);
  console.log('User login test passed');

  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const meData = await meRes.json();
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meData.user.email, testEmail);
  console.log('Protected /me profile endpoint test passed');

  const unauthorizedRes = await fetch('http://localhost:5000/api/auth/me');
  assert.strictEqual(unauthorizedRes.status, 401);
  console.log('Unauthorized rejection test passed');

  const invalidTokenRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: 'Bearer invalid.fake.token' },
  });
  assert.strictEqual(invalidTokenRes.status, 401);
  console.log('Invalid token rejection test passed');

  const summary = await VideoSummary.create({
    userId: regData.user.id,
    videoId: 'auth_test_123',
    videoUrl: 'https://www.youtube.com/watch?v=auth_test_123',
    title: 'Auth Video Test',
    summary: {
      overview: 'Test overview',
      keyTakeaways: ['T1'],
      structuredNotes: [],
      terminology: [],
      chapters: [],
      flashcards: [],
      revisionSummary: '',
    },
  });

  const deleteUnauthorizedRes = await fetch(`http://localhost:5000/api/videos/${summary._id}`, {
    method: 'DELETE',
  });
  assert.strictEqual(deleteUnauthorizedRes.status, 401);
  console.log('Delete unauthorized rejection test passed');

  const deleteAuthorizedRes = await fetch(`http://localhost:5000/api/videos/${summary._id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.strictEqual(deleteAuthorizedRes.status, 200);
  console.log('Delete authorized test passed');

  await User.deleteMany({ email: testEmail });
  await VideoSummary.deleteMany({ videoId: 'auth_test_123' });
  await mongoose.disconnect();

  console.log('ALL AUTHENTICATION & AUTHORIZATION TESTS PASSED');
}

runAuthTests().catch((err) => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
