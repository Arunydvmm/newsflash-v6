// Shared category config — no 'use client', safe to import in server and client components

export const CATEGORIES = [
  { label: 'India',         icon: '🇮🇳', color: '#FF6B35', bg: '#FFF3EE' },
  { label: 'World',         icon: '🌍',  color: '#1565C0', bg: '#E3F2FD' },
  { label: 'Business',      icon: '📈',  color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'Technology',    icon: '💻',  color: '#6A1B9A', bg: '#F3E5F5' },
  { label: 'Sports',        icon: '⚽',  color: '#00838F', bg: '#E0F7FA' },
  { label: 'Science',       icon: '🔬',  color: '#1565C0', bg: '#E8EAF6' },
  { label: 'Health',        icon: '❤️',  color: '#C62828', bg: '#FFEBEE' },
  { label: 'Entertainment', icon: '🎬',  color: '#E65100', bg: '#FFF3E0' },
  { label: 'Opinion',       icon: '💬',  color: '#4A148C', bg: '#EDE7F6' },
  { label: 'Cricket',       icon: '🏏',  color: '#1B5E20', bg: '#E8F5E9' },
  { label: 'Sarkari',       icon: '🏛',  color: '#BF360C', bg: '#FBE9E7' },
  { label: 'Education',     icon: '🎓',  color: '#283593', bg: '#E8EAF6' },
]

export type Category = typeof CATEGORIES[number]
