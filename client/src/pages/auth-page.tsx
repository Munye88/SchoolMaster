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
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* Main content container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row shadow-xl rounded-2xl overflow-hidden">
        {/* Left side with image */}
        <div className="hidden md:block md:w-1/2 relative">
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#17387c]/50"></div>
            
            {/* Blue edge accent */}
            <div className="absolute right-0 top-0 bottom-0 w-12"
                style={{
                  background: '#17387c',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 70% 100%)'
                }}
            ></div>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 px-8 py-12 md:py-16 md:px-16 bg-white">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <img 
                src="/Updated logo.png" 
                alt="GOVCIO Logo" 
                className="h-14 object-contain"
              />
            </div>

            {/* Welcome text */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Continue transforming learning outcomes.</p>
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
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-5 w-5 text-[#17387c]" />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            autoComplete="username"
                            className="pl-10 py-6 bg-[#e8f0fe] border-0 text-gray-800 rounded-md focus-visible:ring-[#17387c]"
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
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="h-5 w-5 text-[#17387c]" />
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pl-10 py-6 bg-[#e8f0fe] border-0 text-gray-800 rounded-md focus-visible:ring-[#17387c]"
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
                  className="w-full py-6 mt-4 bg-[#17387c] hover:bg-[#0f2654] text-white font-medium rounded-md shadow-md transition-colors"
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
            <div className="mt-4 text-right">
              <a href="#" className="text-sm text-[#17387c] hover:text-[#0f2654] hover:underline transition-colors">
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-xs text-gray-500">
        SALIENT ARABIA FOR MILITARY SUPPORT
      </div>
    </div>
  );
}