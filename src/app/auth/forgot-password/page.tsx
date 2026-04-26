import { AuthForm } from "@/app/components/auth/AuthForm";
import Link from "next/link";

<AuthForm
    title="Reset your password"
    subtitle="Enter your email and we'll send you a reset link"
    onSubmit={() => {}}
    footer={<Link href="/auth/login">Back to login</Link>}
>
    <div className="inputGroup">
        <label className="label">Email address</label>
        <input type="email" className="input" required />
    </div>
</AuthForm>