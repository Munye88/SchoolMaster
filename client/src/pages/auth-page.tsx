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
    <div className="flex items-center justify-center min-h-screen bg-[#2c5cc6]">
      {/* Main content container */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white m-8 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row">
          {/* Left side with professionals image */}
          <div className="hidden md:block md:w-1/2 relative">
            <div 
              className="h-full w-full bg-cover bg-center"
              style={{ 
                backgroundImage: "url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
              }}
            >
              {/* Blue gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a2463]/30 to-transparent"></div>
            </div>
          </div>

          {/* Right side with form */}
          <div className="w-full md:w-1/2 px-8 py-8 md:px-12">
            <div className="max-w-md mx-auto">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img 
                  src="/images/govcio-small-logo.png" 
                  alt="GOVCIO Logo" 
                  className="h-12 object-contain"
                />
              </div>

              {/* Welcome text */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Continue transforming learning outcomes.</p>
              </div>
              
              {/* Form */}
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
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Moon2025"
                            autoComplete="username"
                            className="py-6 bg-[#e8f0fe] border-0 text-gray-800 rounded-md focus-visible:ring-[#2c5cc6]"
                            {...field}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="py-6 bg-[#e8f0fe] border-0 text-gray-800 rounded-md focus-visible:ring-[#2c5cc6]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full py-6 mt-2 bg-[#0a2463] hover:bg-[#041952] text-white font-medium rounded-md shadow-md transition-colors"
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
                <a href="#" className="text-sm text-[#2c5cc6] hover:text-[#0a2463] hover:underline transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}