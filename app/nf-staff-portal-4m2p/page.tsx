// @ts-nocheck
import { redirect } from 'next/navigation'

// Secret staff entry point — not linked anywhere on the main site
// URL: /nf-staff-portal-4m2p
export default function SecretStaffEntry() {
  redirect('/staff')
}
