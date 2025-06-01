import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
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
import { Loader2, User, Lock, ChevronRight, UserPlus } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      role: "user",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: any) {
    if (values.password !== values.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    registerMutation.mutate(values);
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white rounded-xl shadow-2xl">
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
          
          {/* Right side with the login form - keeping the logo working */}
          <div className="px-6 py-12 md:px-12 lg:px-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Logo - using the working path */}
              <div className="flex justify-center mb-8">
                <img 
                  src="logo.png" 
                  alt="GOVCIO Logo" 
                  style={{ maxWidth: "180px", marginBottom: "20px" }}
                />
              </div>
              
              {/* Tab Toggle */}
              <div className="flex bg-[#f7f9fc] rounded-lg p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    isLogin
                      ? 'bg-white text-[#081f5c] shadow-sm'
                      : 'text-gray-600 hover:text-[#081f5c]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    !isLogin
                      ? 'bg-white text-[#081f5c] shadow-sm'
                      : 'text-gray-600 hover:text-[#081f5c]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#081f5c] mb-3">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-600">
                  {isLogin ? 'Continue transforming learning outcomes' : 'Join the educational management platform'}
                </p>
              </div>
              
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
                      className="w-full py-6 mt-4 bg-gradient-to-r from-[#081f5c] to-[#00a2ff] hover:from-[#071849] hover:to-[#0091e6] text-white font-medium rounded-lg shadow-md transition-all hover:shadow-xl disabled:opacity-70"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
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
                /* Registration Form */
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Full Name</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                autoComplete="name"
                                className="pl-12 py-6 bg-[#f7f9fc] border-[#e1e8ef] rounded-lg focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Email</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                className="pl-12 py-6 bg-[#f7f9fc] border-[#e1e8ef] rounded-lg focus-visible:ring-[#00a2ff] focus-visible:border-[#00a2ff] text-[#081f5c]"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
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
                                placeholder="Choose a username"
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
                      control={registerForm.control}
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
                                placeholder="Create a password"
                                autoComplete="new-password"
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
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#081f5c] font-medium">Confirm Password</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                              <Lock className="h-5 w-5" />
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
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
                      className="w-full py-6 mt-4 bg-gradient-to-r from-[#081f5c] to-[#00a2ff] hover:from-[#071849] hover:to-[#0091e6] text-white font-medium rounded-lg shadow-md transition-all hover:shadow-xl disabled:opacity-70"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              
              {/* Forgot Password - only show for login */}
              {isLogin && (
                <div className="mt-6 text-center">
                  <a 
                    onClick={() => window.alert("Please contact the administrator at munyesufi1988@gmail.com to reset your password.")}
                    className="text-sm text-[#00a2ff] hover:text-[#081f5c] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot your password?
                  </a>
                </div>
              )}
              
              {/* Company Tag */}
              <div className="mt-16 text-center text-gray-500 text-xs">
                <p>SALIENT ARABIA FOR MILITARY SUPPORT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}