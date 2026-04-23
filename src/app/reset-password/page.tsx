import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-gray-600">
            Nhập mật khẩu mới của bạn
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
