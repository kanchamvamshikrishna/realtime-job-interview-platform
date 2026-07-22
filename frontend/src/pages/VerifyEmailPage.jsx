import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLazyVerifyEmailQuery } from '../features/auth/authApi';
import { Spinner } from '../components/Spinner';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [verifyEmail, { isLoading, isSuccess, isError }] = useLazyVerifyEmailQuery();

  useEffect(() => {
    verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <div className="mx-auto max-w-sm text-center">
      <h1 className="mb-4 text-2xl font-bold">Email verification</h1>
      {isLoading && <Spinner />}
      {isSuccess && <p className="text-green-600">Your email has been verified successfully.</p>}
      {isError && <p className="text-red-600">This verification link is invalid or expired.</p>}
      <Link to="/login" className="mt-4 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
        Back to login
      </Link>
    </div>
  );
};
