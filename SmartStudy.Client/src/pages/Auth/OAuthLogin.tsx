import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { googleLoginMutation } from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export default function OAuthLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const mutation = useMutation({
    ...googleLoginMutation(),
  });

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      const token = credentialResponse.credential;

      if (!token) {
        toast.error("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        return;
      }

      const response = await mutation.mutateAsync({
        body: token,
      });

      login(response);
      navigate("/app");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
        }}
        useOneTap
        shape="rectangular"
        theme="outline"
        text="signin_with"
      />
    </>
  );
}
