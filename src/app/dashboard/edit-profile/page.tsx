import type { Metadata } from 'next';
import EditProfileForm from './EditProfileForm';

export const metadata: Metadata = {
    title: 'Edit Profile - MrVeggies',
    description: 'Update your personal information on your MrVeggies account',
};

export default function EditProfilePage() {
    return <EditProfileForm />;
}