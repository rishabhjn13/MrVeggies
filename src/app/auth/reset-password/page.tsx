import { AuthForm } from "@/app/components/auth/AuthForm";

<AuthForm
  title="Create new password"
  subtitle="Choose a strong password for your account"
  onSubmit={() => {}}
>
  <div className="inputGroup">
    <label className="label">New password</label>
    <input type="password" className="input" required />
  </div>
  <div className="inputGroup">
    <label className="label">Confirm new password</label>
    <input type="password" className="input" required />
  </div>
</AuthForm>