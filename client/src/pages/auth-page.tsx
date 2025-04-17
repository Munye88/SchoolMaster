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
import { Loader2, User, Lock } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen" 
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}>
      {/* Glass-morphism card */}
      <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row bg-white/10 backdrop-blur-md">
        {/* Left side with image */}
        <div className="hidden md:block md:w-1/2 relative">
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.pexels.com/photos/5212704/pexels-photo-5212704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-600/10"></div>
            
            {/* Blue edge accent */}
            <div className="absolute right-0 top-0 bottom-0 w-16"
                style={{
                  background: 'linear-gradient(to left, rgba(59, 130, 246, 0.5), transparent)',
                  clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 60% 0)'
                }}
            ></div>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 px-8 py-12 md:py-16 md:px-12">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <img 
                src="/Updated logo.png" 
                alt="GOVCIO Logo" 
                className="h-14 object-contain drop-shadow-lg"
              />
            </div>

            {/* Welcome text */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
              <p className="text-blue-100/80">Continue transforming learning outcomes.</p>
            </div>
            
            {/* Form */}
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Username</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-5 w-5 text-blue-300" />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            autoComplete="username"
                            className="pl-10 py-6 bg-white/10 border-blue-300/30 text-white placeholder:text-blue-200/50 rounded-lg focus-visible:ring-blue-400 focus-visible:border-blue-400"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Password</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-300" />
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="pl-10 py-6 bg-white/10 border-blue-300/30 text-white placeholder:text-blue-200/50 rounded-lg focus-visible:ring-blue-400 focus-visible:border-blue-400"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full py-6 mt-4 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Forgot Password */}
            <div className="mt-6 text-right">
              <a href="#" className="text-sm text-blue-200 hover:text-white hover:underline transition-colors">
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-xs text-blue-200/70">
        SALIENT ARABIA FOR MILITARY SUPPORT
      </div>
    </div>
  );
}