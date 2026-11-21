import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
    title: 'Search Groceries - MrVeggies',
    description: 'Search and filter fresh groceries, fruits, vegetables, and daily essentials.',
};

export default function SearchPage() {
    return <SearchClient />;
}