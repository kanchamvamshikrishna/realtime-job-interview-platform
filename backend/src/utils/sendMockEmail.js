/**
 * Mock email sender. No real email is sent — per the assessment spec, email
 * verification/reset is mocked. The "sent" content is logged server-side and
 * also returned to callers so it can be surfaced in API responses during dev/testing.
 */
export const sendMockEmail = ({ to, subject, body }) => {
  console.log('--- MOCK EMAIL ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(body);
  console.log('------------------');
  return { to, subject, body, sentAt: new Date().toISOString() };
};
