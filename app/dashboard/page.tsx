// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function DashboardPage() {
  const role = cookies().get('userRole')?.value

  if (!role) {
    redirect('/login')
  }

  switch (role) {
    case 'ADMIN':
      redirect('/dashboard/admin')
    case 'OWNER':
      redirect('/dashboard/owner')
    case 'EMPLOYEE':
      redirect('/dashboard/employee')
    default:
      redirect('/dashboard/player')
  }
}
