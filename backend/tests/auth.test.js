const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

test('Auth Security - Password Hashing with bcrypt', async () => {
  const plain = 'EcoSecure@2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);

  assert.notStrictEqual(plain, hash);
  const isMatch = await bcrypt.compare(plain, hash);
  assert.strictEqual(isMatch, true);

  const isWrong = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isWrong, false);
});

test('Auth Security - JWT Signing & Verification', () => {
  const secret = 'test_secret_eco_track_12345';
  const payload = { id: '64b1f8e1234567890abcdef1', role: 'ADMIN' };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  assert.ok(token);

  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.id, payload.id);
  assert.strictEqual(decoded.role, payload.role);

  assert.throws(() => {
    jwt.verify(token, 'wrong_secret');
  });
});
