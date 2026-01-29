import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Карта - 10Dreamers',
  description: 'Интерактивная карта достопримечательностей культурной столицы России',
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
