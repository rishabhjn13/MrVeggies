// app/auth/signup/page.tsx
import type { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
    title: 'Sign Up - MrVeggies',
    description: 'Create a new MrVeggies account',
};

export default function SignupPage() {
    return <SignupForm />;
}