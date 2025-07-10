import { useAuth, loginSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Lock, ChevronRight, UserPlus, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Access request form schema
const accessRequestSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
  requestType: z.enum(["registration", "password_reset"])
});

type AccessRequestData = z.infer<typeof accessRequestSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const accessRequestForm = useForm<AccessRequestData>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      reason: "",
      requestType: isPasswordReset ? "password_reset" : "registration"
    },
  });

  const accessRequestMutation = useMutation({
    mutationFn: async (data: AccessRequestData) => {
      const response = await apiRequest("/api/access-request", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      accessRequestForm.reset();
    },
    onError: (error: any) => {
      console.error("Access request error:", error);
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onAccessRequestSubmit(values: AccessRequestData) {
    // Set the correct request type based on current mode
    const requestData = {
      ...values,
      requestType: isPasswordReset ? "password_reset" as const : "registration" as const
    };
    accessRequestMutation.mutate(requestData);
  }

  function handleForgotPassword() {
    setIsLogin(false);
    setIsPasswordReset(true);
    accessRequestForm.setValue("requestType", "password_reset");
  }

  function handleRequestAccess() {
    setIsLogin(false);
    setIsPasswordReset(false);
    accessRequestForm.setValue("requestType", "registration");
  }

  function handleBackToLogin() {
    setIsLogin(true);
    setIsPasswordReset(false);
    setSuccessMessage("");
  }

  // If the user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#081f5c] to-[#0a4b9f]"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 100%, rgba(8,31,92,0.8) 0%, rgba(10,75,159,0.4) 50%, rgba(10,75,159,0.1) 100%)"
        }}
      ></div>
      
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white rounded-none shadow-2xl">
          {/* Left side with image and design elements */}
          <div className="relative hidden lg:block">
            <div 
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: "url('login-image.png')" }}
            ></div>
            
            {/* Overlay and Accents */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#081f5c]/80 via-[#081f5c]/40 to-transparent"></div>
            
            {/* Bottom text - mission statement */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="border-l-4 border-[#00a2ff] pl-4">
                <p className="text-xl font-light mb-2">Excellence in</p>
                <h2 className="text-3xl font-bold mb-1">Educational Management</h2>
                <p className="text-sm opacity-90">Maximizing learning potential through optimized administration</p>
              </div>
            </div>
          </div>
          
          {/* Right side with the forms */}
          <div className="px-6 py-12 md:px-12 lg:px-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Logo */}
              <div className="text-center mb-8">
                <img 
                  src="/logo.png" 
                  alt="GOVCIO SAMS ELT PROGRAM" 
                  className="mx-auto h-20 w-auto mb-4"
                />
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-none">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Tab Toggle - Only show for login vs access request */}
              {!isPasswordReset && (
                <div className="flex mb-8 bg-[#f7f9fc] rounded-none p-1">
                  <button
                    onClick={handleBackToLogin}
                    className={`flex-1 py-3 text-center font-medium rounded-none transition-all ${
                      isLogin 
                        ? 'bg-white text-[#081f5c] shadow-sm' 
                        : 'text-gray-600 hover:text-[#081f5c]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRequestAccess}
                    className={`flex-1 py-3 text-center font-medium rounded-none transition-all ${
                      !isLogin 
                        ? 'bg-white text-[#081f5c] shadow-sm' 
                        : 'text-gray-600 hover:text-[#081f5c]'
                    }`}
                  >
                    Request Access
                  </button>
                </div>
              )}

              {/* Password Reset Header */}
              {isPasswordReset && (
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-[#081f5c] mb-2">Request Password Reset</h2>
                  <p className="text-gray-600">Submit a password reset request to the administrator</p>
                </div>
              )}

              {/* Welcome Section */}
              {!isPasswordReset && (
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-[#081f5c] mb-3">
                    {isLogin ? 'Welcome Back' : 'Request Access'}
                  </h1>
                  <p className="text-gray-600">
                    {isLogin ? 'Continue transforming learning outcomes' : 'Submit your access request to the administrator'}
                  </p>
                </div>
              )}
              
              {/* Login Form */}
              {isLogin ? (
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Username</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                autoComplete="username"
                                className="pl-12 py-6 bg-[#f7f9fc] border-[#e1e8ef] rounded-lg focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Password</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                              <Lock className="h-5 w-5" />
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="pl-12 py-6 bg-[#f7f9fc] border-[#e1e8ef] rounded-lg focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full py-6 mt-4 bg-gradient-to-r from-[#081f5c] to-[#00a2ff] hover:from-[#071849] hover:to-[#0091e6] text-white font-medium rounded-none shadow-md transition-all hover:shadow-xl disabled:opacity-70"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                /* Access Request Form */
                <Form {...accessRequestForm}>
                  <form onSubmit={accessRequestForm.handleSubmit(onAccessRequestSubmit)} className="space-y-5">
                    <FormField
                      control={accessRequestForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                                <User className="h-5 w-5" />
                              </div>
                              <Input
                                placeholder="Enter your full name"
                                className="pl-12 py-6 bg-white border-[#e1e8ef] rounded-none focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                autoComplete="name"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accessRequestForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                                <Mail className="h-5 w-5" />
                              </div>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                className="pl-12 py-6 bg-white border-[#e1e8ef] rounded-none focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                autoComplete="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accessRequestForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">
                            {isPasswordReset ? "Reason for Password Reset" : "Reason for Access Request"}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={isPasswordReset ? "Please explain why you need your password reset..." : "Please explain why you need access to the system..."}
                              className="py-3 bg-white border-[#e1e8ef] rounded-none focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c] min-h-[120px] resize-none text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full py-6 mt-4 bg-gradient-to-r from-[#081f5c] to-[#00a2ff] hover:from-[#071849] hover:to-[#0091e6] text-white font-medium rounded-none shadow-md transition-all hover:shadow-xl disabled:opacity-70"
                      disabled={accessRequestMutation.isPending}
                    >
                      {accessRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {isPasswordReset ? "Sending Reset Request..." : "Sending Access Request..."}
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" />
                          {isPasswordReset ? "Submit Reset Request" : "Submit Access Request"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              
              {/* Forgot Password Link - only show for login */}
              {isLogin && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleForgotPassword}
                    className="text-sm text-[#00a2ff] hover:text-[#081f5c] hover:underline transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
              
              {/* Back to Login Link - show for access request forms */}
              {!isLogin && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleBackToLogin}
                    className="text-sm text-[#00a2ff] hover:text-[#081f5c] hover:underline transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
              
              {/* Security Notice */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-none">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Secure Access Control</p>
                    <p className="text-xs text-blue-600">
                      {isPasswordReset 
                        ? "Password reset requests are sent to the administrator for verification and approval."
                        : "Access requests are sent to the administrator for verification and approval."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}