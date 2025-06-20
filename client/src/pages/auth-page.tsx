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

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const userData = {
      username,
      password,
      confirmPassword,
      name: username,
      email: `${username}@example.com`,
      role: "user",
    };

    registerMutation.mutate(userData);
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

              {/* Tab Toggle */}
              <div className="flex mb-8 bg-[#f7f9fc] rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
                    isLogin 
                      ? 'bg-white text-[#081f5c] shadow-sm' 
                      : 'text-gray-600 hover:text-[#081f5c]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
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
                /* Registration Form */
                <form onSubmit={onRegisterSubmit} className="space-y-5">
                  <div>
                    <label className="text-[#081f5c] font-medium block mb-2">Username</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                        minLength={3}
                        className="w-full pl-12 py-6 bg-[#f7f9fc] border border-[#e1e8ef] rounded-lg focus:ring-2 focus:ring-[#00a2ff] focus:border-[#00a2ff] text-[#081f5c] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#081f5c] font-medium block mb-2">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="w-full pl-12 py-6 bg-[#f7f9fc] border border-[#e1e8ef] rounded-lg focus:ring-2 focus:ring-[#00a2ff] focus:border-[#00a2ff] text-[#081f5c] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#081f5c] font-medium block mb-2">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#00a2ff] transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="w-full pl-12 py-6 bg-[#f7f9fc] border border-[#e1e8ef] rounded-lg focus:ring-2 focus:ring-[#00a2ff] focus:border-[#00a2ff] text-[#081f5c] outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 mt-4 bg-gradient-to-r from-[#081f5c] to-[#00a2ff] hover:from-[#071849] hover:to-[#0091e6] text-white font-medium rounded-lg shadow-md transition-all hover:shadow-xl disabled:opacity-70"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}