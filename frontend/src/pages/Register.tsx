import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterRequest>();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterRequest) => {
    try {
      await registerUser(data);
      navigate('/dashboard'); // Redirect after successful registration
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Register</h1>
      <input {...register('username', { required: true })} placeholder="Username" />
      {errors.username && <p>Username is required</p>}
      <input type="email" {...register('email', { required: true })} placeholder="Email" />
      {errors.email && <p>Email is required</p>}
      <input type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Password" />
      {errors.password && <p>Password (min 6 chars) is required</p>}
      <input {...register('first_name')} placeholder="First Name" />
      <input {...register('last_name')} placeholder="Last Name" />
      <select {...register('user_type', { required: true })}>
        <option value="">Select user type</option>
        <option value="CUSTOMER">Customer</option>
        <option value="RESTAURANT_OWNER">Restaurant Owner</option>
        <option value="DELIVERY_PARTNER">Delivery Partner</option>
      </select>
      {errors.user_type && <p>User type is required</p>}
      <button type="submit" disabled={isSubmitting}>Register</button>
    </form>
  );
};

export default Register;
