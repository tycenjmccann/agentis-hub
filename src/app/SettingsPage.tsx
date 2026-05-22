import { AvatarUpload } from '../components/settings/AvatarUpload'

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-text-primary">Settings</h1>
      <section className="rounded-xl border border-surface-4 bg-surface-1 p-6">
        <h2 className="mb-4 text-lg font-medium text-text-primary">Profile</h2>
        <AvatarUpload
          userId="current-user"
          currentAvatarUrl={null}
          onUploadComplete={(url) => {
            console.log('Avatar updated:', url)
          }}
        />
      </section>
    </div>
  )
}

export default SettingsPage
