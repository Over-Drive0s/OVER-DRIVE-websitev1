import { ArrowUpRight, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons'
import AdminRoleSelect from '../components/auth/AdminRoleSelect'
import PreferredPaymentSelector from '../components/auth/PreferredPaymentSelector'
import SignInBackground from '../components/SignInBackground'
import { SITE_ADMIN_EMAIL } from '../config/site'
import {
  createAdminUser,
  getAdminSession,
  getPostLoginPath,
  isOwnerSession,
  readProfileImageDataUrl,
  signInAdmin,
  signInAdminProvider,
  type AdminRole,
} from '../lib/adminUsers'
import { roleUsesPreferredPayment } from '../lib/adminRoles'
import { formatPhoneNumber } from '../lib/formatPhoneNumber'
import type { PreferredPayment } from '../lib/preferredPayment'
import { validatePreferredPayment } from '../lib/preferredPayment'

type Mode = 'signin' | 'create'

const inputClass =
  'w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#0080ff]/50'

const labelClass = 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/40'

const submitButtonClass =
  'group flex w-full items-center justify-center gap-2 rounded-md bg-[#0080ff] py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] active:scale-[0.98]'

export default function AdminSignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  const [createName, setCreateName] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')
  const [createRole, setCreateRole] = useState<AdminRole>('Customer')
  const [createPreferredPayment, setCreatePreferredPayment] = useState<PreferredPayment | undefined>()
  const [createProfileImageUrl, setCreateProfileImageUrl] = useState('')
  const profileImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchParams.get('mode') === 'create') {
      setMode('create')
    }
  }, [searchParams])

  useEffect(() => {
    if (mode === 'create') return
    const session = getAdminSession()
    if (isOwnerSession(session)) {
      navigate('/masteradmin', { replace: true })
    }
  }, [navigate, mode])

  const handleSocialLogin = (provider: 'google' | 'apple' | 'slack') => {
    setError('')
    signInAdminProvider(provider)
    navigate('/masteradmin')
  }

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = signInAdmin(signInEmail, signInPassword)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(getPostLoginPath(result.session.email, result.session.role))
  }

  const handleCreateAdmin = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (createPassword !== createConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (createPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    const paymentError = roleUsesPreferredPayment(createRole)
      ? validatePreferredPayment(createPreferredPayment)
      : null
    if (paymentError) {
      setError(paymentError)
      return
    }

    const email = createEmail.trim().toLowerCase()
    const password = createPassword

    const result = createAdminUser({
      name: createName,
      email: createEmail,
      phone: createPhone,
      password: createPassword,
      role: createRole,
      ...(createProfileImageUrl ? { profileImageUrl: createProfileImageUrl } : {}),
      ...(roleUsesPreferredPayment(createRole) && createPreferredPayment
        ? { preferredPayment: createPreferredPayment }
        : {}),
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    const signInResult = signInAdmin(email, password)
    if (!signInResult.ok) {
      setError(signInResult.error)
      return
    }

    setCreateName('')
    setCreatePhone('')
    setCreateEmail('')
    setCreatePassword('')
    setCreateConfirm('')
    setCreateRole('Customer')
    setCreatePreferredPayment(undefined)
    setCreateProfileImageUrl('')
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
    navigate(getPostLoginPath(signInResult.session.email, signInResult.session.role), {
      replace: true,
    })
  }

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    const result = await readProfileImageDataUrl(file)
    if (!result.ok) {
      setError(result.error)
      event.target.value = ''
      return
    }

    setCreateProfileImageUrl(result.dataUrl)
  }

  const clearProfileImage = () => {
    setCreateProfileImageUrl('')
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#050607]">
      <SignInBackground />

      <section className="relative z-10 flex flex-1 justify-center px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-28">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 h-px w-8 bg-[#0080ff]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#0080ff]">
              ADMIN ACCESS
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              {mode === 'signin' ? 'Sign in to Admin' : 'Create Admin User'}
            </h1>
            {mode === 'signin' && (
              <p className="mt-1.5 text-xs text-white/50 sm:text-sm">
                Sign in with Google, Apple, Slack, or email to access the admin workspace.
              </p>
            )}
          </div>

          <div className="mb-3 flex rounded-lg border border-white/[0.08] bg-[#080a0e]/50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === 'signin'
                  ? 'bg-[#0080ff] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('create')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === 'create'
                  ? 'bg-[#0080ff] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              New Admin
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.1] bg-[#080a0e]/75 p-5 shadow-[0_0_80px_rgba(0,128,255,0.1),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:p-6">
            {mode === 'signin' ? (
              <>
                <SocialAuthButtons onProviderClick={handleSocialLogin} />

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#080a0e]/90 px-3 text-[11px] font-medium uppercase tracking-wider text-white/35 backdrop-blur-sm">
                      Or sign in with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label htmlFor="admin-signin-email" className={labelClass}>Email</label>
                    <input
                      id="admin-signin-email"
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder={SITE_ADMIN_EMAIL}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-signin-password" className={labelClass}>Password</label>
                    <input
                      id="admin-signin-password"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-white/50">
                      <input type="checkbox" className="rounded border-white/20 bg-white/[0.03]" />
                      Remember me
                    </label>
                    <button type="button" className="text-xs text-[#0080ff] transition-colors hover:text-[#0066cc]">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className={submitButtonClass}>
                    Sign In
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <div>
                  <span className={labelClass}>Profile file (optional)</span>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.03]">
                      {createProfileImageUrl && createProfileImageUrl.startsWith('data:image/') ? (
                        <img
                          src={createProfileImageUrl}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                          {createProfileImageUrl ? 'File set' : 'No file'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={profileImageInputRef}
                        id="admin-create-profile-image"
                        type="file"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                      <button
                        type="button"
                        onClick={() => profileImageInputRef.current?.click()}
                        className="flex items-center gap-2 rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:border-[#0080ff]/50 hover:text-white"
                      >
                        <Upload size={14} />
                        Upload image
                      </button>
                      {createProfileImageUrl && (
                        <button
                          type="button"
                          onClick={clearProfileImage}
                          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/50 transition hover:text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-white/35">
                    Any file type. Images show as the profile avatar.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="admin-create-name" className={labelClass}>Full name</label>
                    <input
                      id="admin-create-name"
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Jane Admin"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-create-email" className={labelClass}>Email</label>
                    <input
                      id="admin-create-email"
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="admin-create-phone" className={labelClass}>Phone number</label>
                    <input
                      id="admin-create-phone"
                      type="tel"
                      value={createPhone}
                      onChange={(e) => setCreatePhone(formatPhoneNumber(e.target.value))}
                      placeholder="(555) 123-4567"
                      className={inputClass}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-create-role" className={labelClass}>Role</label>
                    <AdminRoleSelect
                      id="admin-create-role"
                      value={createRole}
                      onChange={(role) => {
                        setCreateRole(role)
                        if (!roleUsesPreferredPayment(role)) {
                          setCreatePreferredPayment(undefined)
                        }
                      }}
                      variant="signin"
                    />
                  </div>
                </div>

                {createRole === 'Support' && (
                  <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    Support profiles onboard into the Support workspace at /adminsupport.
                  </p>
                )}
                {createRole === 'Administrator' && (
                  <p className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
                    Administrator profiles onboard into the Administrator workspace at /adminportal.
                  </p>
                )}

                {roleUsesPreferredPayment(createRole) && (
                  <PreferredPaymentSelector
                    value={createPreferredPayment}
                    onChange={setCreatePreferredPayment}
                    variant="signin"
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="admin-create-password" className={labelClass}>Password</label>
                    <input
                      id="admin-create-password"
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={inputClass}
                      minLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-create-confirm" className={labelClass}>Confirm password</label>
                    <input
                      id="admin-create-confirm"
                      type="password"
                      value={createConfirm}
                      onChange={(e) => setCreateConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={submitButtonClass}>
                  Create Admin User
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </form>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 sm:text-sm">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-300 sm:text-sm">
                {success}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
