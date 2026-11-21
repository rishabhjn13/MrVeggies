import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'MrVeggies - Fresh Groceries & Quick Commerce',
  description: 'Browse fresh vegetables, fruits, and daily products delivered in minutes.',
};

export default function Page() {
  return <HomeClient />;
}