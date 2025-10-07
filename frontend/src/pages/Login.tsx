import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
      <input type="email" {...register('email', { required: true })} placeholder="Email" />
      {errors.email && <p>Email is required</p>}
      <input type="password" {...register('password', { required: true })} placeholder="Password" />
      {errors.password && <p>Password is required</p>}
      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  );
};

export default Login;
