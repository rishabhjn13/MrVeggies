import type { Metadata } from 'next';
import LoginForm from './LoginForm'; // Adjust import path if you put it in components folder

export const metadata: Metadata = {
    title: 'Login - MrVeggies',
    description: 'Log in to your MrVeggies account',
};

export default function LoginPage() {
    return <LoginForm />;
}