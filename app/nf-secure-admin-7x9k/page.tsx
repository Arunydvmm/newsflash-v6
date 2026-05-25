// @ts-nocheck
import { redirect } from 'next/navigation'

// Secret admin entry point — not linked anywhere on the main site
// URL: /nf-secure-admin-7x9k
export default function SecretAdminEntry() {
  redirect('/admin')
}
