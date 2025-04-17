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
import { Loader2, User, Lock, ChevronRight } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();

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
              style={{ backgroundImage: "url('https://images.pexels.com/photos/5940721/pexels-photo-5940721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
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
              
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#081f5c] mb-3">Welcome Back</h1>
                <p className="text-gray-600">Continue transforming learning outcomes</p>
              </div>
              
              {/* Form Section */}
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
              
              {/* Forgot Password */}
              <div className="mt-6 text-center">
                <a href="#" className="text-sm text-[#00a2ff] hover:text-[#081f5c] hover:underline transition-colors">
                  Forgot your password?
                </a>
              </div>
              
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